import { createHmac } from 'crypto';
import connectDB from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { Order } from '@/models/Order';
import { User } from '@/models/User';
import { Product } from '@/models/Product';
import { cacheDelete, CACHE_KEYS } from '@/lib/redis';
import nodemailer from 'nodemailer';

// Email transporter - using Gmail
const sendSellerEmail = async (sellerEmail: string, order: any, buyerDetails: any) => {
  try {
    // Create transporter with Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const itemsHtml = order.items
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${item.itemName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">₹${item.price}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
            .header { background: #689f38; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: white; padding: 20px; }
            .order-details { margin: 20px 0; background: #f5f5f5; padding: 15px; border-radius: 5px; }
            .address-box { background: #e8f5e9; padding: 15px; border-left: 4px solid #689f38; margin: 15px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #689f38; color: white; padding: 12px; text-align: left; }
            td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
            .total { text-align: right; font-size: 18px; font-weight: bold; color: #689f38; margin-top: 20px; }
            .footer { background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
            .success-badge { display: inline-block; background: #4caf50; color: white; padding: 5px 15px; border-radius: 20px; margin-bottom: 15px; }
            .action-box { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 15px 0; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 New Order Received!</h1>
              <span class="success-badge">Payment Confirmed</span>
            </div>
            
            <div class="content">
              <p>Dear Seller,</p>
              <p>A new order has been placed on Local Bazar. Please review the details below and start preparing the items for shipment:</p>
              
              <div class="action-box">
                <h3 style="margin: 0 0 10px 0; color: #ff6b00;">⚡ ACTION REQUIRED: Pack and prepare the order for delivery</h3>
                <p style="margin: 0;">Update the tracking information in your seller dashboard once the items are ready for shipment.</p>
              </div>
              
              <div class="order-details">
                <h3 style="margin: 0 0 10px 0;">Order Information</h3>
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <p><strong>Amount:</strong> <span style="color: #689f38; font-size: 16px; font-weight: bold;">₹${order.amount.toFixed(2)}</span></p>
                <p><strong>Payment Status:</strong> <span style="color: #4caf50; font-weight: bold;">✅ PAID</span></p>
              </div>

              <h3>Customer Details</h3>
              <p><strong>Name:</strong> ${buyerDetails.name || 'N/A'}</p>
              <p><strong>Email:</strong> ${buyerDetails.email}</p>
              <p><strong>Phone:</strong> ${buyerDetails.phone || 'N/A'}</p>

              <h3>Delivery Address</h3>
              <div class="address-box">
                <p>${order.address.street}</p>
                <p>${order.address.fullAddress}</p>
                <p><strong>Pincode:</strong> ${order.address.pincode}, ${order.address.state}</p>
              </div>

              <h3>Order Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th style="text-align: center;">Price</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div class="total">
                Total Amount: ₹${order.amount.toFixed(2)}
              </div>

              <p style="margin-top: 30px; color: #666; background: #f9f9f9; padding: 15px; border-radius: 5px;">
                <strong>Next Steps:</strong><br>
                1. Pack the items securely<br>
                2. Take a picture of the packed order<br>
                3. Update tracking information in your dashboard<br>
                4. Hand over to courier partner<br>
                5. Share tracking details with customer
              </p>
            </div>

            <div class="footer">
              <p>&copy; 2025 Local Bazar. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this address.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: sellerEmail,
      subject: `✅ New Order Received - Order #${order._id} - Action Required!`,
      html: htmlContent,
    });

    console.log(`Email sent to seller: ${sellerEmail}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Send buyer confirmation email
const sendBuyerEmail = async (buyerEmail: string, order: any, buyerName: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const itemsHtml = order.items
      .map(
        (item: any) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0;">${item.itemName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">₹${item.price}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `
      )
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
            .header { background: #689f38; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: white; padding: 20px; }
            .order-details { margin: 20px 0; background: #f5f5f5; padding: 15px; border-radius: 5px; }
            .address-box { background: #e8f5e9; padding: 15px; border-left: 4px solid #689f38; margin: 15px 0; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background: #689f38; color: white; padding: 12px; text-align: left; }
            td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
            .total { text-align: right; font-size: 18px; font-weight: bold; color: #689f38; margin-top: 20px; }
            .footer { background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
            .success-badge { display: inline-block; background: #4caf50; color: white; padding: 5px 15px; border-radius: 20px; margin-bottom: 15px; }
            .status-box { background: #e3f2fd; padding: 15px; border-left: 4px solid #2196f3; margin: 15px 0; border-radius: 5px; }
            .button { display: inline-block; background: #689f38; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Order Confirmed!</h1>
              <span class="success-badge">Payment Successful</span>
            </div>
            
            <div class="content">
              <p>Hi ${buyerName},</p>
              <p>Thank you for your order! Your payment has been received successfully. Your order is now being prepared by our sellers.</p>
              
              <div class="status-box">
                <h3 style="margin: 0 0 10px 0; color: #1976d2;">📦 Order Status</h3>
                <p style="margin: 0;"><strong>Status:</strong> <span style="color: #4caf50; font-weight: bold;">✅ CONFIRMED & PROCESSING</span></p>
                <p style="margin: 5px 0 0 0;"><strong>Expected Delivery:</strong> 3-5 Business Days</p>
              </div>
              
              <div class="order-details">
                <h3 style="margin: 0 0 10px 0;">Order Information</h3>
                <p><strong>Order ID:</strong> ${order._id}</p>
                <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                <p><strong>Amount Paid:</strong> <span style="color: #689f38; font-size: 16px; font-weight: bold;">₹${order.amount.toFixed(2)}</span></p>
                <p><strong>Payment Status:</strong> <span style="color: #4caf50; font-weight: bold;">✅ PAID</span></p>
              </div>

              <h3>Delivery Address</h3>
              <div class="address-box">
                <p>${order.address.street}</p>
                <p>${order.address.fullAddress}</p>
                <p><strong>Pincode:</strong> ${order.address.pincode}, ${order.address.state}</p>
              </div>

              <h3>Order Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th style="text-align: center;">Price</th>
                    <th style="text-align: center;">Quantity</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div class="total">
                Total Amount: ₹${order.amount.toFixed(2)}
              </div>

              <p style="margin-top: 30px; color: #666; background: #f9f9f9; padding: 15px; border-radius: 5px;">
                <strong>What Happens Next?</strong><br>
                ✓ Our sellers are packing your items<br>
                ✓ You'll receive a tracking number via email<br>
                ✓ Follow your delivery in real-time<br>
                ✓ Receive your order at your doorstep<br>
                <br>
                If you have any questions, please contact our support team or reply to this email.
              </p>
            </div>

            <div class="footer">
              <p>&copy; 2025 Local Bazar. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this address.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: buyerEmail,
      subject: `✅ Order Confirmed - Order #${order._id} - Local Bazar`,
      html: htmlContent,
    });

    console.log(`✅ Confirmation email sent to buyer: ${buyerEmail}`);
  } catch (error) {
    console.error('Error sending buyer email:', error);
  }
};

export async function POST(request: Request) {
  try {
    await connectDB();
    const user = await getAuthUser();

    if (!user) {
      console.error('❌ No authenticated user');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { razorpay_payment_id, razorpay_order_id } = body;

    console.log('=== 🔐 Payment Verification Started ===');
    console.log('💳 Payment ID:', razorpay_payment_id);
    console.log('📦 DB Order ID:', razorpay_order_id);
    console.log('👤 User Email:', user.email);

    // Get user data
    const dbUser = await User.findOne({ email: user.email });
    if (!dbUser) {
      console.error('❌ User not found in database:', user.email);
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('✅ User found in database');

    // Find the order we created earlier (using our database order ID, not Razorpay order ID)
    const order = await Order.findById(razorpay_order_id);
    if (!order) {
      console.error('❌ Order not found in database:', razorpay_order_id);
      return Response.json({ 
        error: 'Order not found',
        orderId: razorpay_order_id,
        details: 'Order does not exist in database'
      }, { status: 404 });
    }

    console.log('✅ Order found in database:', order._id);
    console.log('📊 Order Details:');
    console.log('   - Items:', order.items?.length || 0);
    console.log('   - Amount:', order.amount);
    console.log('   - Current Status:', order.paymentStatus);

    // Update order with payment details
    console.log('💾 Updating order status to PAID...');
    order.razorpayPaymentId = razorpay_payment_id;
    order.status = 'completed';
    order.paymentStatus = 'paid';
    const savedOrder = await order.save();

    console.log('✅ Order updated successfully');
    console.log('   - New Status:', savedOrder.paymentStatus);
    console.log('   - Payment ID:', savedOrder.razorpayPaymentId);

    // Deduct stock from products on successful payment
    console.log('📦 Deducting stock from products...');
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        try {
          // Find product and deduct stock
          const product = await Product.findById(item.sellerId);
          if (product) {
            const previousStock = product.stock;
            product.stock = Math.max(0, product.stock - item.quantity);
            await product.save();
            console.log(
              `✅ Stock deducted for ${item.itemName}: ${previousStock} → ${product.stock} (Qty: ${item.quantity})`
            );
          }
        } catch (stockError) {
          console.error(`Error deducting stock for ${item.itemName}:`, stockError);
          // Continue with other items if one fails
        }
      }
    }

    // Group items by product ID to get seller info
    console.log('📧 Processing seller notifications...');
    const sellerMap = new Map<string, any>();
    
    if (order.items && order.items.length > 0) {
      for (const item of order.items) {
        try {
          // Validate sellerId before fetching
          if (!item.sellerId || item.sellerId.trim() === '') {
            console.warn(`⚠️  Item ${item.itemName} has no sellerId`);
            continue;
          }

          // Fetch product to get seller email
          const product = await Product.findById(item.sellerId);
          if (product && product.sellerEmail) {
            const sellerEmail = product.sellerEmail;
            
            if (!sellerMap.has(sellerEmail)) {
              sellerMap.set(sellerEmail, {
                email: sellerEmail,
                items: [],
              });
            }
            sellerMap.get(sellerEmail)!.items.push(item);
            console.log(`✅ Found seller email: ${sellerEmail} for product: ${item.itemName}`);
          } else {
            console.warn(`⚠️  Product not found for ID: ${item.sellerId}`);
          }
        } catch (productError) {
          console.error(`Error fetching product ${item.sellerId}:`, productError);
        }
      }
    }

    console.log(`👥 Found ${sellerMap.size} seller(s) for this order`);

    // Send email to each seller with their items
    for (const [sellerEmail, sellerData] of sellerMap) {
      console.log(`📨 Sending email to seller: ${sellerEmail}...`);
      console.log(`📧 SELLER EMAIL ADDRESS: ${sellerEmail}`);
      try {
        const sellerOrder = {
          _id: order._id,
          items: sellerData.items,
          amount: order.amount,
          address: order.address,
          createdAt: order.createdAt,
        };

        await sendSellerEmail(sellerEmail, sellerOrder, {
          name: dbUser.fullName || 'Customer',
          email: dbUser.email,
          phone: dbUser.phone,
        });
        console.log(`✅ Email sent successfully to: ${sellerEmail}`);
        console.log(`✅ SELLER EMAIL DELIVERED TO: ${sellerEmail}`);
      } catch (emailError) {
        console.error(`❌ Error sending email to seller ${sellerEmail}:`, emailError);
        // Continue with other sellers if one fails
      }
    }

    // Send confirmation email to buyer
    console.log(`📧 Sending confirmation email to buyer...`);
    try {
      await sendBuyerEmail(dbUser.email, {
        _id: order._id,
        items: order.items,
        amount: order.amount,
        address: order.address,
        createdAt: order.createdAt,
      }, dbUser.fullName || 'Valued Customer');
      console.log(`✅ Confirmation email sent to buyer: ${dbUser.email}`);
    } catch (buyerEmailError) {
      console.error(`❌ Error sending email to buyer:`, buyerEmailError);
    }

    console.log('=== ✅ Payment Verification Completed Successfully ===\n');

    // Clear order and cart caches for this user
    await cacheDelete(CACHE_KEYS.USER_ORDERS(user.email));
    await cacheDelete(CACHE_KEYS.USER_CART(user.email));
    console.log(`🗑️  Cache cleared: ${CACHE_KEYS.USER_ORDERS(user.email)}`);
    console.log(`🗑️  Cache cleared: ${CACHE_KEYS.USER_CART(user.email)}`);

    return Response.json({
      success: true,
      orderId: order._id,
      message: 'Payment verified and order confirmed',
      orderStatus: 'paid'
    }, { status: 200 });
    
  } catch (error) {
    console.error('=== ❌ Payment Verification Error ===');
    console.error('Error:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
    return Response.json({ 
      error: 'Verification failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
