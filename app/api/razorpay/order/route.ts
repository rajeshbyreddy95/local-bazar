import connectDB from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { User } from '@/models/User';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';

export async function POST(request: Request) {
  try {
    await connectDB();
    const user = await getAuthUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, addressId, cartItems } = body;

    // Validate input
    if (!amount || !addressId || !cartItems || cartItems.length === 0) {
      return Response.json({ error: 'Invalid request data' }, { status: 400 });
    }

    // Get user and address
    const dbUser = await User.findOne({ email: user.email });
    if (!dbUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const selectedAddress = dbUser.addresses?.find((addr: any) => addr._id.toString() === addressId);
    if (!selectedAddress) {
      return Response.json({ error: 'Address not found' }, { status: 404 });
    }

    // Enrich cart items with sellerId if missing and validate stock
    try {
      var enrichedItems = await Promise.all(
        cartItems.map(async (item: any) => {
          try {
            const product = await Product.findById(item._id || item.productId);
            if (!product) {
              throw new Error(`Product not found: ${item._id || item.productId}`);
            }

            // Check stock availability
            if (item.quantity > product.stock) {
              throw new Error(
                `Insufficient stock for ${product.itemName}. Available: ${product.stock}, Requested: ${item.quantity}`
              );
            }

            console.log(
              `✅ Stock check passed for ${product.itemName}: Available=${product.stock}, Requested=${item.quantity}`
            );

            // If sellerId is missing or empty, use product ID
            return {
              ...item,
              sellerId: item.sellerId && item.sellerId.trim() !== '' ? item.sellerId : product._id.toString(),
              sellerEmail: product.sellerEmail,
              sellerName: product.shopName,
            };
          } catch (error) {
            console.error(`Stock validation error for item ${item._id || item.productId}:`, error);
            throw error;
          }
        })
      );
    } catch (stockError) {
      console.error('Stock validation failed:', stockError);
      return Response.json(
        { error: stockError instanceof Error ? stockError.message : 'Stock validation failed' },
        { status: 400 }
      );
    }

    // Create order in database
    const receipt = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newOrder = new Order({
      userId: dbUser._id,
      razorpayOrderId: receipt, // Temporary - will be replaced with actual Razorpay ID
      amount: Math.round(amount / 100), // Convert from paise
      status: 'pending',
      paymentStatus: 'pending',
      items: enrichedItems,
      address: {
        street: selectedAddress.street,
        village: selectedAddress.village,
        mandal: selectedAddress.mandal,
        district: selectedAddress.district,
        state: selectedAddress.state,
        pincode: selectedAddress.pincode,
        country: selectedAddress.country,
        fullAddress: selectedAddress.fullAddress,
        lat: selectedAddress.lat,
        lng: selectedAddress.lng,
      },
    });

    await newOrder.save();

    return Response.json({
      orderId: receipt,
      amount: amount,
      currency: 'INR',
      orderDbId: newOrder._id,
    });
  } catch (error) {
    console.error('Razorpay order error:', error);
    return Response.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
