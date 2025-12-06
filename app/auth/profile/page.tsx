'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiMail, FiPhone, FiUser, FiMapPin, FiLogOut, FiArrowLeft, FiPackage, FiShoppingBag } from 'react-icons/fi';
import SavedAddressesModal from '@/components/SavedAddressesModal';

interface UserSession {
  email: string;
  fullName: string;
  phone: string;
  userType: 'buyer' | 'seller';
  shopName?: string;
  shopAddress?: string;
  landmarks?: string;
  pincode?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [productCount, setProductCount] = useState(0);
  const [showAddressesModal, setShowAddressesModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user');
        const data = await response.json();
        
        if (!data.user) {
          // Redirect to login if not authenticated
          router.push('/auth/login');
          return;
        }
        
        setUser(data.user);

        // Fetch product count for sellers
        if (data.user.userType === 'seller') {
          try {
            const productsResponse = await fetch('/api/products');
            const productsData = await productsResponse.json();
            if (productsData.products) {
              setProductCount(productsData.products.length);
            }
          } catch (error) {
            console.error('Error fetching product count:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-[#e8f5e9] to-[#ccf5d1] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-14 w-14 border-b-4 border-[#689f38]"></div>
          <p className="mt-4 text-[#1b5e20] font-extrabold text-xl tracking-wide">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br  py-10 px-2 sm:px-6">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="flex items-center gap-2 text-[#689f38] hover:text-[#1b5e20] font-bold mb-8 transition-colors text-base"
        >
          <FiArrowLeft className="text-lg" />
          Back to Home
        </Link>

        {/* Profile Card */}
        <div className="bg-white/90  rounded-3xl shadow-2xl overflow-hidden border border-[#e8f5e9]">
          {/* Header Gradient */}
          <div className="h-36 w-full bg-linear-to-r from-[#689f38] to-[#1b5e20] relative flex items-center justify-center">
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-12 w-32 h-32 rounded-full bg-white shadow-xl border-4 border-[#e8f5e9] flex items-center justify-center text-6xl">
              {user.userType === 'seller' ? '🏪' : '👤'}
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 pb-10 px-6 sm:px-12">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10">
              <div className="text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1b5e20] mb-1 tracking-tight">{user.fullName}</h1>
                <p className="text-base sm:text-lg font-semibold text-[#689f38]">
                  {user.userType === 'buyer' ? '🛒 Buyer' : '🏪 Seller'} Account
                </p>
              </div>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-50 text-white font-bold shadow-lg transition-all duration-300 text-base"
              >
                <FiLogOut className="text-lg" />
                {loggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>

            {/* Info Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              {/* Contact Information */}
              <div className="bg-[#f4f8f6] rounded-2xl p-6 shadow-sm border border-[#e8f5e9]">
                <h2 className="text-xl font-bold text-[#1b5e20] mb-4 flex items-center gap-2"><FiMail className="text-[#689f38]" /> Contact</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FiMail className="text-[#689f38] text-lg" />
                    <span className="text-sm font-semibold text-gray-600">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiPhone className="text-[#689f38] text-lg" />
                    <span className="text-sm font-semibold text-gray-600">{user.phone}</span>
                  </div>
                </div>
              </div>

              {/* Account Type Information */}
              <div className="bg-[#f4f8f6] rounded-2xl p-6 shadow-sm border border-[#e8f5e9]">
                <h2 className="text-xl font-bold text-[#1b5e20] mb-4 flex items-center gap-2"><FiUser className="text-[#689f38]" /> Account</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-600">Type:</span>
                    <span className="text-base font-bold text-[#1b5e20] capitalize">{user.userType === 'buyer' ? 'Buyer' : 'Seller'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Information (for sellers only) */}
            {user.userType === 'seller' && (
              <div className="bg-[#f4f8f6] rounded-2xl p-6 shadow-sm border border-[#e8f5e9] mb-10">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                  <h2 className="text-xl font-bold text-[#1b5e20] flex items-center gap-2"><FiMapPin className="text-[#689f38]" /> Shop Info</h2>
                  <button
                    onClick={() => router.push('/seller/products/analytics')}
                    className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-[#689f38] to-[#1b5e20] hover:from-[#1b5e20] hover:to-[#689f38] text-white font-bold rounded-xl shadow-md transition-all duration-300 text-base"
                  >
                    <FiPackage className="text-lg" />
                    View Products ({productCount})
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <FiUser className="text-[#689f38] text-lg" />
                    <span className="text-sm font-semibold text-gray-600">Shop Name:</span>
                    <span className="text-base font-bold text-[#1b5e20]">{user.shopName || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiMapPin className="text-[#689f38] text-lg" />
                    <span className="text-sm font-semibold text-gray-600">Pincode:</span>
                    <span className="text-base font-bold text-[#1b5e20]">{user.pincode || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiMapPin className="text-[#689f38] text-lg" />
                    <span className="text-sm font-semibold text-gray-600">Address:</span>
                    <span className="text-base font-bold text-[#1b5e20] wrap-break-word">{user.shopAddress || 'Not provided'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FiMapPin className="text-[#689f38] text-lg" />
                    <span className="text-sm font-semibold text-gray-600">Landmarks:</span>
                    <span className="text-base font-bold text-[#1b5e20] wrap-break-word">{user.landmarks || 'Not provided'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
              <Link href="/orders" className="flex-1 bg-linear-to-r from-[#689f38] to-[#1b5e20] text-white px-8 py-3 rounded-xl font-bold hover:from-[#1b5e20] hover:to-[#689f38] transition-all flex items-center justify-center gap-2 shadow-md text-base">
                <FiShoppingBag className="text-2xl" />
                My Orders
              </Link>
              <Link href="/wishlist" className="flex-1 bg-linear-to-r from-[#689f38] to-[#1b5e20] text-white px-8 py-3 rounded-xl font-bold hover:from-[#1b5e20] hover:to-[#689f38] transition-all flex items-center justify-center gap-2 shadow-md text-base">
                <FiPackage className="text-2xl" />
                My Wishlist
              </Link>
              <Link href="/cart" className="flex-1 bg-linear-to-r from-[#e8f5e9] to-[#ccf5d1] text-[#1b5e20] px-8 py-3 rounded-xl font-bold hover:from-[#689f38] hover:to-[#1b5e20] hover:text-white transition-all flex items-center justify-center gap-2 shadow-md text-base">
                <FiPackage className="text-2xl" />
                My Cart
              </Link>
              <button
                onClick={() => setShowAddressesModal(true)}
                className="flex-1 bg-linear-to-r from-[#ccf5d1] to-[#e8f5e9] text-[#1b5e20] px-8 py-3 rounded-xl font-bold hover:from-[#689f38] hover:to-[#1b5e20] hover:text-white transition-all flex items-center justify-center gap-2 shadow-md text-base"
              >
                <FiMapPin className="text-2xl" />
                Saved Addresses
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Addresses Modal */}
      <SavedAddressesModal
        isOpen={showAddressesModal}
        onClose={() => setShowAddressesModal(false)}
      />
    </div>
  );
}
