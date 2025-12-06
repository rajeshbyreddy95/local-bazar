import connectDB from '@/lib/mongodb';
import { getAuthUser } from '@/lib/auth';
import { User } from '@/models/User';
import { Order } from '@/models/Order';
import { cacheGet, cacheSet, cacheDelete, CACHE_KEYS } from '@/lib/redis';

export async function GET(request: Request) {
  try {
    await connectDB();
    const user = await getAuthUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check cache first
    const cacheKey = CACHE_KEYS.USER_ORDERS(user.email);
    const cachedOrders = await cacheGet(cacheKey);
    if (cachedOrders) {
      console.log(`✅ Cache HIT (Orders): ${cacheKey}`);
      return Response.json({ orders: cachedOrders, source: 'cache' }, { status: 200 });
    }

    console.log(`📝 Cache MISS (Orders): ${cacheKey}`);

    const dbUser = await User.findOne({ email: user.email });
    if (!dbUser) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all orders for this user
    const orders = await Order.find({ userId: dbUser._id }).sort({ createdAt: -1 }).lean();

    // Cache for 10 minutes (600 seconds)
    await cacheSet(cacheKey, orders, 600);
    console.log(`📝 Cached (Orders): ${cacheKey}`);

    return Response.json({ orders, source: 'database' }, { status: 200 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return Response.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
