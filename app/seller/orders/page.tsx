'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiLoader, FiCheck, FiMail, FiPhone } from 'react-icons/fi';

interface OrderItem {
  productId: string;
  itemName: string;
  price: number;
  quantity: number;
  sellerEmail: string;
  sellerName: string;
  sellerId?: string;
  status?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  userId: {
    _id: string;
    email: string;
    phone: string;
    fullName: string;
  };
  razorpayPaymentId: string;
  amount: number;
  paymentStatus: string;
  createdAt: string;
  address: any;
}

interface UserSession {
  email: string;
  fullName: string;
  phone: string;
  userType: 'buyer' | 'seller';
  shopName?: string;
}

export default function SellerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserSession | null>(null);
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | '7days' | '30days' | '90days'>('all');

  // Check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/user');
        const data = await res.json();

        if (!res.ok || !data.user || data.user.userType !== 'seller') {
          router.push('/auth/login');
          return;
        }

        setUser(data.user);
      } catch (err) {
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  // Fetch orders
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/seller/orders');

        const data = await res.json();
        if (res.ok) {
          setOrders(data.orders);
        } else {
          setError(data.error || 'Failed to fetch orders');
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleAcceptOrder = async (orderId: string, itemProductId: string) => {
    const itemKey = `${orderId}-${itemProductId}`;
    setProcessingItems(prev => new Set(prev).add(itemKey));
    setError('');
    setSuccessMessage('');

    try {
      console.log('Sending to API:', { orderId, itemProductId });
      const res = await fetch('/api/seller/orders/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          orderId: String(orderId), 
          itemProductId: String(itemProductId) 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMessage('Order item accepted! Receipt sent to buyer.');
        
        // Update local state immediately
        setOrders(prevOrders =>
          prevOrders.map(order =>
            order._id === orderId
              ? {
                  ...order,
                  items: order.items.map(item =>
                    (item.productId === itemProductId || item.sellerId === itemProductId)
                      ? { ...item, status: 'Accepted' }
                      : item
                  ),
                }
              : order
          )
        );
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setError(data.error || 'Failed to accept order item');
      }
    } catch (err: any) {
      setError(err.message || 'Error accepting order item');
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  // Extract fetchOrders to be callable from multiple places
  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/seller/orders');
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders);
      } else {
        setError(data.error || 'Failed to fetch orders');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching orders');
    }
  };

  // Filter logic
  const getFilteredOrders = () => {
    let filtered = orders;

    // Date filter
    const now = new Date();
    if (dateFilter !== 'all') {
      const days = dateFilter === '7days' ? 7 : dateFilter === '30days' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(o => new Date(o.createdAt) >= cutoffDate);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(o => {
        const sellerItems = o.items.filter((item) => item.sellerEmail === user?.email);
        const allAccepted = sellerItems.every(item => item.status === 'Accepted');
        return statusFilter === 'completed' ? allAccepted : !allAccepted;
      });
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ccf5d1] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#689f38]"></div>
          <p className="mt-4 text-[#1b5e20] font-bold text-lg">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ccf5d1] py-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/seller/products"
            className="flex items-center gap-2 text-[#689f38] hover:text-[#1b5e20] font-bold mb-4 transition-colors"
          >
            <FiArrowLeft className="text-lg" />
            Back to Seller Dashboard
          </Link>
          <h1 className="text-4xl font-black text-[#1b5e20]">Orders Management</h1>
          <p className="text-lg text-[#689f38] mt-2">
            {getFilteredOrders().length} order{getFilteredOrders().length !== 1 ? 's' : ''} received
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white rounded-xl shadow-lg p-6 border-2 border-[#689f38]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-bold text-[#1b5e20] mb-2">Filter by Status</label>
              <div className="flex gap-2">
                {(['all', 'pending', 'completed'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      statusFilter === status
                        ? 'bg-[#689f38] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? '📦 All' : status === 'pending' ? '⏳ Pending' : '✅ Completed'}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-sm font-bold text-[#1b5e20] mb-2">Filter by Date</label>
              <div className="flex gap-2">
                {(['all', '7days', '30days', '90days'] as const).map((date) => (
                  <button
                    key={date}
                    onClick={() => setDateFilter(date)}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      dateFilter === date
                        ? 'bg-[#689f38] text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {date === 'all' ? '📅 All Time' : date === '7days' ? 'Last 7 Days' : date === '30days' ? 'Last 30 Days' : 'Last 90 Days'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-red-600 font-semibold">⚠️ {error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <p className="text-green-600 font-semibold">✅ {successMessage}</p>
          </div>
        )}

        {/* Orders Grid */}
        {getFilteredOrders().length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-16 text-center">
            <p className="text-2xl font-black text-gray-600">📭 No Orders Yet</p>
            <p className="text-gray-500 mt-2">Orders will appear here when buyers purchase your products</p>
          </div>
        ) : (
          <div className="space-y-6">
            {getFilteredOrders().map((order) => {
              const sellerItems = order.items.filter((item) => item.sellerEmail === user?.email);
              if (sellerItems.length === 0) return null;

              const totalAmount = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              const allAccepted = sellerItems.every(item => item.status === 'Accepted');

              return (
                <div key={order._id} className="bg-white rounded-xl shadow-lg overflow-hidden border-l-8 border-[#689f38] hover:shadow-xl transition-all">
                  {/* Order Header Card */}
                  <div className="bg-linear-to-r from-[#1b5e20] to-[#2e7d32] text-white p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {/* Order ID */}
                      <div>
                        <p className="text-xs font-semibold opacity-80 mb-1">📦 ORDER ID</p>
                        <p className="text-lg font-black">{order._id.slice(0, 12)}...</p>
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>

                      {/* Customer Info */}
                      <div>
                        <p className="text-xs font-semibold opacity-80 mb-1">👤 CUSTOMER</p>
                        <p className="text-lg font-black">{order.userId?.fullName || 'Guest'}</p>
                        <p className="text-xs opacity-75 mt-1 truncate flex items-center gap-1">
                          <FiMail size={12} /> {order.userId?.email || 'No email'}
                        </p>
                      </div>

                      {/* Phone */}
                      <div>
                        <p className="text-xs font-semibold opacity-80 mb-1">📱 PHONE</p>
                        <p className="text-lg font-black">{order.userId?.phone || 'N/A'}</p>
                        <p className="text-xs opacity-75 mt-1">Contact info</p>
                      </div>

                      {/* Amount & Status */}
                      <div className="text-right">
                        <p className="text-xs font-semibold opacity-80 mb-1">💰 AMOUNT</p>
                        <p className="text-2xl font-black text-[#8bc34a]">₹{totalAmount.toFixed(2)}</p>
                        <p className={`text-xs font-bold mt-1 inline-block px-2 py-1 rounded-full ${
                          allAccepted 
                            ? 'bg-green-400 text-green-900' 
                            : 'bg-orange-400 text-orange-900'
                        }`}>
                          {allAccepted ? '✅ COMPLETED' : '⏳ PENDING'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items Container */}
                  <div className="divide-y divide-gray-200">
                    {sellerItems.map((item, idx) => {
                      const itemKey = `${order._id}-${item.productId}`;
                      const isProcessing = processingItems.has(itemKey);
                      const isAccepted = item.status === 'Accepted';

                      return (
                        <div key={idx} className={`p-6 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                            {/* Product Details */}
                            <div className="md:col-span-5">
                              <h3 className="font-black text-gray-900 text-sm line-clamp-2 mb-2">
                                {item.itemName}
                              </h3>
                              <p className="text-xs text-gray-500 font-mono mb-3">
                                ID: {item.productId ? item.productId.slice(0, 16) : 'N/A'}
                              </p>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="px-3 py-1 bg-[#e8f5e9] text-[#1b5e20] font-black rounded-lg">
                                  Qty: {item.quantity}
                                </span>
                                <span className="text-gray-600 font-bold">
                                  @ ₹{item.price}
                                </span>
                              </div>
                            </div>

                            {/* Pricing */}
                            <div className="md:col-span-3">
                              <p className="text-xs text-gray-500 font-semibold mb-1">SUBTOTAL</p>
                              <p className="text-2xl font-black text-[#689f38]">
                                ₹{(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>

                            {/* Status Badge */}
                            <div className="md:col-span-2 text-center">
                              <span className={`inline-flex items-center gap-2 px-4 py-2 font-black text-sm rounded-lg ${
                                isAccepted
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}>
                                {isAccepted ? '✅ DONE' : '⏳ WAIT'}
                              </span>
                            </div>

                            {/* Action Button */}
                            <div className="md:col-span-2">
                              {!isAccepted ? (
                                <button
                                  onClick={() => {
                                    // Use sellerId as the product identifier (it contains the product ObjectId)
                                    const productId = item.productId || item.sellerId;
                                    if (productId) {
                                      handleAcceptOrder(order._id, productId);
                                    }
                                  }}
                                  disabled={isProcessing}
                                  className="w-full px-4 py-3 bg-[#689f38] hover:bg-[#1b5e20] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-sm rounded-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                                >
                                  {isProcessing ? (
                                    <span className="flex items-center justify-center gap-2">
                                      <FiLoader className="animate-spin" size={16} />
                                      WAIT...
                                    </span>
                                  ) : (
                                    <span className="flex items-center justify-center gap-2">
                                      <FiCheck size={18} />
                                      ACCEPT
                                    </span>
                                  )}
                                </button>
                              ) : (
                                <button className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-black text-sm rounded-lg shadow-md">
                                  <span className="flex items-center justify-center gap-2">
                                    <FiCheck size={18} />
                                    ✓ DONE
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Order Footer */}
                  <div className="bg-gray-100 px-6 py-4 flex justify-between items-center border-t-2 border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">ITEMS IN ORDER</p>
                      <p className="text-lg font-black text-[#1b5e20]">{sellerItems.length} product{sellerItems.length !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 font-semibold">ORDER TOTAL</p>
                      <p className="text-2xl font-black text-[#689f38]">₹{totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {getFilteredOrders().length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-300">
              <p className="text-sm text-blue-700 font-bold mb-2">📊 TOTAL ITEMS</p>
              <p className="text-3xl font-black text-blue-900">
                {getFilteredOrders().reduce((sum, o) => sum + o.items.filter(i => i.sellerEmail === user?.email).length, 0)}
              </p>
            </div>
            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-300">
              <p className="text-sm text-green-700 font-bold mb-2">✅ COMPLETED</p>
              <p className="text-3xl font-black text-green-900">
                {getFilteredOrders().reduce((sum, o) => sum + o.items.filter(i => i.sellerEmail === user?.email && i.status === 'Accepted').length, 0)}
              </p>
            </div>
            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-[#689f38]">
              <p className="text-sm text-[#1b5e20] font-bold mb-2">💰 TOTAL REVENUE</p>
              <p className="text-3xl font-black text-[#689f38]">
                ₹{getFilteredOrders().reduce((sum, o) => sum + o.items.filter(i => i.sellerEmail === user?.email).reduce((s, i) => s + (i.price * i.quantity), 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
