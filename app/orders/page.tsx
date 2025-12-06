'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { FiArrowLeft, FiLoader, FiPackage, FiCheck } from 'react-icons/fi';
import { showToast } from '@/components/Toast';

interface OrderItem {
  productId: string;
  itemName: string;
  price: number;
  discount: number;
  quantity: number;
  sellerId: string;
}

interface Order {
  _id: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  amount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed';
  items: OrderItem[];
  address: {
    street: string;
    village: string;
    mandal: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
    fullAddress: string;
  };
  createdAt: string;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders', { method: 'GET' });
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        } else if (res.status === 401) {
          showToast('Please login to view orders', 'error');
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        showToast('Failed to load orders', 'error');
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, [router]);

  if (isLoading) {
    return (
      <main className="bg-[#ccf5d1] min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <FiLoader className="text-6xl text-[#689f38] animate-spin mx-auto mb-4" />
            <p className="text-xl font-bold text-[#1b5e20]">Loading orders...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#ccf5d1] min-h-screen">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link href="/" className="flex items-center gap-2 text-[#689f38] hover:text-[#1b5e20] font-bold mb-8">
          <FiArrowLeft /> Back Home
        </Link>

        <h1 className="text-4xl font-black text-[#1b5e20] mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FiPackage className="text-6xl text-[#689f38] mb-4 mx-auto" />
            <p className="text-xl font-bold text-[#1b5e20] mb-4">No orders yet</p>
            <Link href="/products" className="bg-[#689f38] text-white px-8 py-3 rounded-lg font-bold hover:bg-[#1b5e20] transition">Shop Now</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="grid md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-[#e8f5e9]">
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Order ID</p>
                    <p className="text-lg font-bold text-[#1b5e20]">{order._id.slice(-8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Date</p>
                    <p className="text-lg font-bold text-[#1b5e20]">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      {order.paymentStatus === 'paid' ? (
                        <>
                          <FiCheck className="text-green-600" />
                          <span className="text-lg font-bold text-green-600">Paid</span>
                        </>
                      ) : (
                        <>
                          <FiLoader className="text-yellow-600" />
                          <span className="text-lg font-bold text-yellow-600">Pending</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-semibold">Amount</p>
                    <p className="text-xl font-bold text-[#689f38]">₹{order.amount.toFixed(2)}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-bold text-[#1b5e20] mb-3">Order Items</h3>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700">{item.itemName} × {item.quantity}</span>
                        <span className="font-semibold text-[#1b5e20]">₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#e8f5e9] rounded-lg p-4">
                  <h4 className="font-bold text-[#1b5e20] mb-2">Delivery Address</h4>
                  <p className="text-sm text-gray-700">{order.address.street}</p>
                  <p className="text-sm text-gray-700">{order.address.fullAddress}</p>
                  <p className="text-sm text-gray-700">{order.address.pincode}, {order.address.state}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
