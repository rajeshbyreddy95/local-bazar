import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.MIGRATION_SECRET || 'admin-secret'}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    console.log('🔄 Starting order seller info fix...');

    // Find all orders with items missing sellerEmail
    const orders = await Order.find({
      'items.sellerEmail': { $exists: false },
    });

    console.log(`📦 Found ${orders.length} orders to fix`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const order of orders) {
      try {
        let orderModified = false;

        // Fix each item that's missing seller info
        for (let i = 0; i < order.items.length; i++) {
          const item = order.items[i];

          // Skip if already has seller email
          if (item.sellerEmail) {
            continue;
          }

          try {
            // Try to find product by sellerId
            let product = null;
            if (item.sellerId && item.sellerId.trim() !== '') {
              try {
                product = await Product.findById(item.sellerId);
              } catch (e) {
                // Try searching by product ID or name if sellerId is invalid
                if (item.productId) {
                  product = await Product.findById(item.productId);
                }
              }
            }

            // If still no product, try by item name
            if (!product && item.itemName) {
              product = await Product.findOne({ itemName: item.itemName });
            }

            if (product && product.sellerEmail) {
              order.items[i].sellerEmail = product.sellerEmail;
              order.items[i].sellerName = product.shopName || 'Shop';
              orderModified = true;
              console.log(`✅ Fixed item ${item.itemName} - Seller: ${product.sellerEmail}`);
            } else {
              console.warn(`⚠️  Could not find product for item ${item.itemName}`);
              errorCount++;
            }
          } catch (itemError) {
            console.error(`Error fixing item in order ${order._id}:`, itemError);
            errorCount++;
          }
        }

        if (orderModified) {
          await order.save();
          fixedCount++;
          console.log(`✅ Saved order ${order._id}`);
        }
      } catch (orderError) {
        console.error(`Error fixing order ${order._id}:`, orderError);
        errorCount++;
      }
    }

    console.log(`✅ Fix completed - Fixed: ${fixedCount}, Errors: ${errorCount}`);

    return NextResponse.json(
      {
        success: true,
        message: 'Order seller info fix completed',
        fixed: fixedCount,
        errors: errorCount,
        total: orders.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Fix error:', error);
    return NextResponse.json(
      { error: error.message || 'Fix failed' },
      { status: 500 }
    );
  }
}
