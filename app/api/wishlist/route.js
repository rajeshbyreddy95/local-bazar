import connectDB from '../../../lib/mongodb';
import Wishlist from '../../../models/Wishlist';
import { getAuthUser } from '../../../lib/auth';
import { cacheGet, cacheSet, cacheDelete, CACHE_KEYS } from '../../../lib/redis';

export async function GET(req) {
  await connectDB();
  const user = await getAuthUser(req);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const email = user.email;

  // Check cache first
  const cacheKey = CACHE_KEYS.USER_WISHLIST(email);
  const cachedWishlist = await cacheGet(cacheKey);
  if (cachedWishlist) {
    console.log(`✅ Cache HIT (Wishlist): ${cacheKey}`);
    return Response.json({ wishlist: cachedWishlist, source: 'cache' });
  }

  console.log(`📝 Cache MISS (Wishlist): ${cacheKey}`);
  const wishlist = await Wishlist.findOne({ email });

  // Cache the result for 15 minutes (900 seconds)
  if (wishlist) {
    await cacheSet(cacheKey, wishlist, 900);
    console.log(`📝 Cached (Wishlist): ${cacheKey}`);
  }

  return Response.json({ wishlist, source: 'database' });
}

export async function POST(req) {
  await connectDB();
  const user = await getAuthUser(req);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const email = user.email;
  const body = await req.json();
  const { productId, itemName, price, discount, images } = body;
  let wishlist = await Wishlist.findOne({ email });
  if (!wishlist) wishlist = new Wishlist({ email, items: [] });
  if (!wishlist.items.some(i => i.productId.equals(productId))) {
    wishlist.items.push({ productId, itemName, price, discount, images });
    await wishlist.save();
  }

  // Clear cache after update
  const cacheKey = CACHE_KEYS.USER_WISHLIST(email);
  await cacheDelete(cacheKey);
  console.log(`🗑️  Cache cleared (Wishlist): ${cacheKey}`);

  return Response.json({ wishlist });
}

export async function DELETE(req) {
  await connectDB();
  const user = await getAuthUser(req);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const email = user.email;
  const body = await req.json();
  const { productId } = body;
  const wishlist = await Wishlist.findOne({ email });
  if (!wishlist) return Response.json({ error: 'Wishlist not found' }, { status: 404 });
  wishlist.items = wishlist.items.filter(i => !i.productId.equals(productId));
  await wishlist.save();

  // Clear cache after deletion
  const cacheKey = CACHE_KEYS.USER_WISHLIST(email);
  await cacheDelete(cacheKey);
  console.log(`🗑️  Cache cleared (Wishlist): ${cacheKey}`);

  return Response.json({ wishlist });
}
