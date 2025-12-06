import connectDB from '../../../lib/mongodb';
import Cart from '../../../models/Cart';
import { getAuthUser } from '../../../lib/auth';
import { cacheGet, cacheSet, cacheDelete, CACHE_KEYS } from '../../../lib/redis';

export async function GET(req) {
  await connectDB();
  const user = await getAuthUser(req);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const email = user.email;

  // Check cache first
  const cacheKey = CACHE_KEYS.USER_CART(email);
  const cachedCart = await cacheGet(cacheKey);
  if (cachedCart) {
    console.log(`✅ Cache HIT (Cart): ${cacheKey}`);
    return Response.json({ cart: cachedCart, source: 'cache' });
  }

  console.log(`📝 Cache MISS (Cart): ${cacheKey}`);
  const cart = await Cart.findOne({ email });

  // Cache the result for 10 minutes (600 seconds)
  if (cart) {
    await cacheSet(cacheKey, cart, 600);
    console.log(`📝 Cached (Cart): ${cacheKey}`);
  }

  return Response.json({ cart, source: 'database' });
}

export async function POST(req) {
  await connectDB();
  const user = await getAuthUser(req);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const email = user.email;
  const body = await req.json();
  const { productId, itemName, price, discount, images, quantity } = body;
  let cart = await Cart.findOne({ email });
  if (!cart) cart = new Cart({ email, items: [] });
  const idx = cart.items.findIndex(i => i.productId.equals(productId));
  if (idx > -1) {
    cart.items[idx].quantity += quantity;
  } else {
    cart.items.push({ productId, itemName, price, discount, images, quantity });
  }
  await cart.save();

  // Clear cache after update
  const cacheKey = CACHE_KEYS.USER_CART(email);
  await cacheDelete(cacheKey);
  console.log(`🗑️  Cache cleared (Cart): ${cacheKey}`);

  return Response.json({ cart });
}

export async function DELETE(req) {
  await connectDB();
  const user = await getAuthUser(req);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const email = user.email;
  const body = await req.json();
  const { productId } = body;
  const cart = await Cart.findOne({ email });
  if (!cart) return Response.json({ error: 'Cart not found' }, { status: 404 });
  
  if (productId) {
    // Remove specific product
    cart.items = cart.items.filter(i => !i.productId.equals(productId));
  } else {
    // Clear entire cart
    cart.items = [];
  }
  
  await cart.save();

  // Clear cache after update
  const cacheKey = CACHE_KEYS.USER_CART(email);
  await cacheDelete(cacheKey);
  console.log(`🗑️  Cache cleared (Cart): ${cacheKey}`);

  return Response.json({ cart });
}
