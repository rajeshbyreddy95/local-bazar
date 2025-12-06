import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { User } from '@/models/User';
import { getAuthUser } from '@/lib/auth';
import nodemailer from 'nodemailer';

// Configure email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function POST(request: NextRequest) {
  try {
    const seller = await getAuthUser();
    if (!seller) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, itemProductId } = body;

    if (!orderId || !itemProductId) {
      return NextResponse.json(
        { error: 'Order ID and Item Product ID not provided' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find order and verify seller owns this item
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Find the specific item and verify it belongs to this seller
    const itemIndex = order.items.findIndex((item: any) => 
      (item.productId === itemProductId || item.sellerId === itemProductId) && item.sellerEmail === seller.email
    );

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Item not found or unauthorized' },
        { status: 403 }
      );
    }

    const item = order.items[itemIndex];
    
    // Mark this specific item as accepted
    if (!order.items[itemIndex].status) {
      order.items[itemIndex].status = 'Accepted';
    }
    
    await order.save();

    // Get buyer info
    const buyer = await User.findById(order.userId);
    if (!buyer) {
      return NextResponse.json(
        { error: 'Buyer not found' },
        { status: 404 }
      );
    }

    // Send email with receipt (without PDF attachment to avoid pdfkit font issues)
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: buyer.email,
      subject: `✅ Order Accepted - ${item.itemName} - Receipt`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; }
            .header { background: #689f38; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background: white; padding: 20px; }
            .receipt-box { background: #f5f5f5; padding: 15px; border-left: 4px solid #689f38; margin: 15px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .detail-label { font-weight: bold; color: #666; }
            .detail-value { color: #333; }
            .total-row { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 15px 0; font-size: 18px; font-weight: bold; color: #689f38; }
            .footer { background: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #666; border-radius: 0 0 5px 5px; }
            .success-badge { display: inline-block; background: #4caf50; color: white; padding: 5px 15px; border-radius: 20px; margin-bottom: 15px; font-size: 14px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Order Accepted!</h1>
              <span class="success-badge">Payment Confirmed & Ready to Ship</span>
            </div>
            
            <div class="content">
              <p>Hello <strong>${buyer.fullName}</strong>,</p>
              <p>Great news! Your seller has accepted your order and it will be shipped soon. 📦</p>
              
              <div class="receipt-box">
                <h3 style="margin-top: 0; color: #689f38;">📋 Order Receipt</h3>
                
                <div class="detail-row">
                  <span class="detail-label">Order ID:</span>
                  <span class="detail-value"><code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px;">${order._id}</code></span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Order Date:</span>
                  <span class="detail-value">${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Payment ID:</span>
                  <span class="detail-value"><code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px;">${order.razorpayPaymentId || 'N/A'}</code></span>
                </div>
              </div>
              
              <h3 style="margin-top: 20px; color: #1b5e20;">🛍️ Product Details</h3>
              <div class="receipt-box">
                <div class="detail-row">
                  <span class="detail-label">Product:</span>
                  <span class="detail-value">${item.itemName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Shop:</span>
                  <span class="detail-value">${item.sellerName}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Quantity:</span>
                  <span class="detail-value">${item.quantity}</span>
                </div>
                
                <div class="detail-row">
                  <span class="detail-label">Price per item:</span>
                  <span class="detail-value">₹${item.price.toFixed(2)}</span>
                </div>
              </div>
              
              <div class="total-row">
                Order Total: ₹${(item.price * item.quantity).toFixed(2)}
              </div>
              
              <h3 style="color: #1b5e20;">👤 Contact Information</h3>
              <p>If you need to contact the seller regarding your order:</p>
              <div class="receipt-box">
                <div class="detail-row">
                  <span class="detail-label">Seller Shop:</span>
                  <span class="detail-value">${item.sellerName}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Seller Email:</span>
                  <span class="detail-value">${item.sellerEmail}</span>
                </div>
              </div>
              
              <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin-top: 20px; border-left: 4px solid #2196f3;">
                <strong>📋 What's Next?</strong><br>
                ✓ Your seller is preparing the item<br>
                ✓ You'll receive tracking details via email<br>
                ✓ Expected delivery: 3-5 business days<br>
                ✓ Track your order in your Local Bazar dashboard
              </div>
              
              <p style="margin-top: 20px; color: #666;">Thank you for shopping with Local Bazar! We appreciate your business.</p>
            </div>
            
            <div class="footer">
              <p>&copy; 2025 Local Bazar. All rights reserved.</p>
              <p>This is an automated email. Please do not reply to this address.</p>
              <p>If you have questions, visit our support center or contact us through the app.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      {
        success: true,
        message: 'Order accepted and email sent to buyer',
        order,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error accepting order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to accept order' },
      { status: 500 }
    );
  }
}
