import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.MIGRATION_SECRET || 'admin-secret'}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get first order with items
    const order = await Order.findOne({ 'items.sellerEmail': { $exists: true } }).limit(1);

    if (!order) {
      return NextResponse.json({
        message: 'No orders with sellerEmail found',
        sample: await Order.findOne().select('items').limit(1),
      });
    }

    return NextResponse.json({
      orderId: order._id,
      itemCount: order.items.length,
      firstItem: order.items[0],
      allSellerEmails: order.items.map((item: any) => item.sellerEmail),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
