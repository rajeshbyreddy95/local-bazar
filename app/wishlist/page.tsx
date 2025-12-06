'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiArrowLeft, FiHeart, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import Header from '../../components/Header';


interface WishlistItem {
  _id: string;
  itemName: string;
  price: number;
  discount: number;
  images: Array<{ url: string }>;
}

interface CartItem {
  productId: string;
  quantity: number;
}


export default function WishlistPage() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState<string | null>(null);

  useEffect(() => {
    // Fetch user
    fetch('/api/auth/user')
      .then(res => res.json())
      .then(data => setUser(data.user || null));
  }, []);

  useEffect(() => {
    // Fetch wishlist from backend
    fetch('/api/wishlist', { method: 'GET' })
      .then(res => res.json())
      .then(data => {
        if (data.wishlist && data.wishlist.items) {
          setWishlist(data.wishlist.items.map((item: any) => ({
            _id: item.productId,
            itemName: item.itemName,
            price: item.price,
            discount: item.discount,
            images: item.images
          })));
        }
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    // Fetch cart from backend
    if (!user) return;
    fetch('/api/cart', { method: 'GET' })
      .then(res => res.json())
      .then(data => {
        if (data.cart && data.cart.items) {
          setCart(data.cart.items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity
          })));
        }
      });
  }, [user, wishlist]);

  const handleRemove = async (id: string) => {
    await fetch('/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: id })
    });
    setWishlist(wishlist.filter(item => item._id !== id));
  };

  const handleAddToCart = async (item: WishlistItem) => {
    setCartLoading(item._id);
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: item._id,
        itemName: item.itemName,
        price: item.price,
        discount: item.discount,
        images: item.images,
        quantity: 1,
        sellerId: item._id, // Include product ID as seller ID
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.cart && data.cart.items) {
        setCart(data.cart.items.map((cartItem: any) => ({
          productId: cartItem.productId,
          quantity: cartItem.quantity
        })));
      }
    }
    setCartLoading(null);
  };

  const handleRemoveFromCart = async (productId: string) => {
    setCartLoading(productId);
    await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId })
    });
    setCart(cart.filter(item => item.productId !== productId));
    setCartLoading(null);
  };

  return (
    <main className="bg-[#ccf5d1] min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/products" className="flex items-center gap-2 text-[#689f38] hover:text-[#1b5e20] font-bold mb-8">
          <FiArrowLeft /> Back to Products
        </Link>
        <h1 className="text-4xl font-black text-[#1b5e20] mb-8">Your Wishlist</h1>
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FiHeart className="text-6xl text-[#689f38] mb-4 mx-auto animate-spin" />
            <p className="text-xl font-bold text-[#1b5e20] mb-4">Loading wishlist...</p>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FiHeart className="text-6xl text-[#689f38] mb-4 mx-auto" />
            <p className="text-xl font-bold text-[#1b5e20] mb-4">Your wishlist is empty</p>
            <Link href="/products" className="bg-[#689f38] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#1b5e20] transition-colors">Browse Products</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <ul className="divide-y divide-[#e8f5e9]">
              {wishlist.map(item => {
                const inCart = cart.some(c => c.productId === item._id);
                return (
                  <li key={item._id} className="flex items-center gap-6 py-6">
                    <img src={item.images[0]?.url} alt={item.itemName} className="w-24 h-24 rounded-lg object-cover border-2 border-[#e8f5e9]" />
                    <div className="flex-1">
                      <Link href={`/product/${item._id}/details`} className="block">
                        <h2 className="text-2xl font-black text-[#1b5e20] hover:text-[#689f38] transition-colors cursor-pointer">{item.itemName}</h2>
                      </Link>
                      <p className="text-lg text-[#689f38] font-bold">₹{(item.price * (1 - item.discount / 100)).toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleRemove(item._id)}
                        className="text-red-600 hover:text-red-800 p-2"
                        disabled={cartLoading === item._id}
                      >
                        <FiTrash2 className="text-2xl" />
                      </button>
                      {inCart ? (
                        <button
                          onClick={() => handleRemoveFromCart(item._id)}
                          className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200 transition-colors flex items-center gap-2"
                          disabled={cartLoading === item._id}
                        >
                          <FiShoppingCart /> Remove from Cart
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="bg-[#689f38] text-white px-4 py-2 rounded-lg font-bold hover:bg-[#1b5e20] transition-colors flex items-center gap-2"
                          disabled={cartLoading === item._id}
                        >
                          <FiShoppingCart /> Add to Cart
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
