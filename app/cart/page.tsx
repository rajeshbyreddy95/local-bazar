'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiArrowLeft, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import Header from '../../components/Header';

interface CartItem {
  _id: string;
  itemName: string;
  price: number;
  discount: number;
  images: Array<{ url: string }>; // Only need url for display
  quantity: number;
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    async function fetchCart() {
      const res = await fetch('/api/cart', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (data.cart && data.cart.items) {
          setCart(data.cart.items.map((item: any) => ({
            _id: item.productId || item._id,
            itemName: item.itemName,
            price: item.price,
            discount: item.discount,
            images: item.images,
            quantity: item.quantity
          })));
        } else {
          setCart([]);
        }
      } else {
        setCart([]);
      }
    }
    fetchCart();
  }, []);

  const handleRemove = async (id: string) => {
    await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: id })
    });
    setCart(cart.filter(item => item._id !== id));
  };

  const handleQuantity = async (id: string, qty: number) => {
    const item = cart.find(i => i._id === id);
    if (!item) return;
    await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: id,
        itemName: item.itemName,
        price: item.price,
        discount: item.discount,
        images: item.images,
        quantity: qty - item.quantity
      })
    });
    setCart(cart.map(i => i._id === id ? { ...i, quantity: qty } : i));
  };

  const total = cart.reduce((sum, item) => sum + item.price * (1 - item.discount / 100) * item.quantity, 0);

  return (
    <main className="bg-[#ccf5d1] min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link href="/products" className="flex items-center gap-2 text-[#689f38] hover:text-[#1b5e20] font-bold mb-8">
          <FiArrowLeft /> Back to Products
        </Link>
        <h1 className="text-4xl font-black text-[#1b5e20] mb-8">Your Cart</h1>
        {cart.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FiShoppingCart className="text-6xl text-[#689f38] mb-4 mx-auto" />
            <p className="text-xl font-bold text-[#1b5e20] mb-4">Your cart is empty</p>
            <Link href="/products" className="bg-[#689f38] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#1b5e20] transition-colors">Shop Now</Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Products List - Left 65% */}
              <div className="lg:w-2/3 w-full">
                <ul className="divide-y divide-[#e8f5e9]">
                  {cart.map(item => (
                    <li key={item._id} className="flex items-center gap-6 py-6">
                      <img src={item.images[0]?.url} alt={item.itemName} className="w-24 h-24 rounded-lg object-cover border-2 border-[#e8f5e9]" />
                      <div className="flex-1">
                        <Link href={`/product/${item._id}/details`} className="block">
                          <h2 className="text-2xl font-black text-[#1b5e20] hover:text-[#689f38] transition-colors cursor-pointer">{item.itemName}</h2>
                        </Link>
                        <p className="text-lg text-[#689f38] font-bold">₹{(item.price * (1 - item.discount / 100)).toFixed(2)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="font-bold text-[#1b5e20]">Qty:</span>
                          <button onClick={() => handleQuantity(item._id, Math.max(1, item.quantity - 1))} className="px-2 py-1 bg-[#e8f5e9] rounded">-</button>
                          <span className="px-3">{item.quantity}</span>
                          <button onClick={() => handleQuantity(item._id, item.quantity + 1)} className="px-2 py-1 bg-[#e8f5e9] rounded">+</button>
                        </div>
                      </div>
                      <button onClick={() => handleRemove(item._id)} className="text-red-600 hover:text-red-800 p-2">
                        <FiTrash2 className="text-2xl" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Summary - Right 35% */}
              <div className="lg:w-1/3 w-full flex flex-col gap-6">
                <div className="bg-[#e8f5e9] rounded-lg p-6 mb-2">
                  <span className="block text-lg font-bold text-[#1b5e20] mb-2">Number of Items</span>
                  <span className="text-2xl font-black text-[#689f38]">{cart.length}</span>
                </div>
                <div className="bg-[#e8f5e9] rounded-lg p-6 mb-2">
                  <span className="block text-lg font-bold text-[#1b5e20] mb-2">Total Quantity</span>
                  <span className="text-2xl font-black text-[#689f38]">{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="bg-[#e8f5e9] rounded-lg p-6 mb-2">
                  <span className="block text-lg font-bold text-[#1b5e20] mb-2">Total Bill</span>
                  <span className="text-2xl font-black text-[#689f38]">₹{total.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => router.push('/checkout')}
                  className="bg-[#689f38] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#1b5e20] transition-colors mt-4">Checkout</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
