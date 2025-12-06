import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { User } from '@/models/User';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Fetch all orders with items from this seller
    const orders = await Order.find({
      'items.sellerEmail': user.email,
    }).sort({ createdAt: -1 });

    // Fetch user data separately and attach to orders
    const userIds = new Set(orders.map(o => o.userId?.toString()));
    const users = await User.find({ _id: { $in: Array.from(userIds) } }).select('email phone fullName');
    const userMap = new Map(users.map(u => [u._id.toString(), u]));

    // Group items by seller for this seller and attach user data
    const sellerOrders = orders.map((order: any) => {
      const orderObj = order.toObject();
      const userData = userMap.get(orderObj.userId.toString());
      return {
        ...orderObj,
        userId: userData ? {
          _id: userData._id,
          email: userData.email,
          phone: userData.phone,
          fullName: userData.fullName,
        } : null,
        items: order.items.filter((item: any) => item.sellerEmail === user.email),
      };
    });

    return NextResponse.json(
      {
        success: true,
        orders: sellerOrders,
        count: sellerOrders.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error fetching seller orders:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
