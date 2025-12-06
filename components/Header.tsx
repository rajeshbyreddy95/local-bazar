'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiLogOut, FiChevronDown, FiPlus, FiShoppingBag, FiMenu, FiX, FiMapPin } from 'react-icons/fi';

interface UserSession {
  email: string;
  fullName: string;
  phone: string;
  userType: 'buyer' | 'seller';
  shopName?: string;
}

export default function Header() {
  const [address, setAddress] = useState<{ street: string; fullAddress: string } | null>(null);
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function fetchAddress() {
    try {
      const response = await fetch('/api/address');
      const data = await response.json();
      if (data.addresses && data.addresses.length > 0) {
        // Get the first (most recent) address
        const latestAddress = data.addresses[0];
        setAddress({
          street: latestAddress.street || latestAddress.fullAddress || null,
          fullAddress: latestAddress.fullAddress || null,
        });
      } else if (data.defaultAddress) {
        setAddress({
          street: data.defaultAddress.street || data.defaultAddress.fullAddress || null,
          fullAddress: data.defaultAddress.fullAddress || null,
        });
      } else {
        setAddress(null);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddress(null);
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user');
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
    fetchAddress();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      setUser(null);
      setShowDropdown(false);
      router.push('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 shadow-lg bg-[#ccf5d1]">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <Link href="/" className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity duration-300">
            <div className="text-5xl font-bold"></div>
            <div>
              <h1 className="text-4xl font-black text-[#1b5e20]">Local Bazar</h1>
              <p className="text-sm font-semibold text-[#689f38]">Your Local Marketplace</p>
            </div>
          </Link>
          {/* Location in Header */}
          {/* <div className="flex flex-col items-center ml-6">
            <button
              className="flex flex-col items-center group"
              onClick={() => router.push('/addaddress')}
            >
              <FiMapPin className="text-2xl text-[#689f38] group-hover:text-[#1b5e20]" />
              <span className="text-xs font-semibold text-[#1b5e20] mt-1 max-w-[120px] truncate" title={address?.fullAddress || 'Add Location'}>
                {address ? (
                  address.street || address.fullAddress || 'Add Location'
                ) : (
                  'Add Location'
                )}
              </span>
            </button>
          </div> */}
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-10 items-center justify-center flex-1">
            <a href="/" className="font-bold text-lg text-[#1b5e20] transition-all duration-300 hover:scale-110">Home</a>
            <a href="#features" className="font-bold text-lg text-[#1b5e20] transition-all duration-300 hover:scale-110">Features</a>
            <Link href="/products" className="font-bold text-lg text-[#1b5e20] transition-all duration-300 hover:scale-110 flex items-center gap-2">
              <FiShoppingBag className="text-lg" />
              Explore
            </Link>
            <a href="#categories" className="font-bold text-lg text-[#1b5e20] transition-all duration-300 hover:scale-110">Categories</a>
            <a href="#why-us" className="font-bold text-lg text-[#1b5e20] transition-all duration-300 hover:scale-110">Why Us</a>
            <a href="#contact" className="font-bold text-lg text-[#1b5e20] transition-all duration-300 hover:scale-110">Contact</a>
            <div className="flex gap-4 items-center ml-6 pl-6 border-l-2 border-[#689f38]">
              {!loading && !user ? (
                <>
                  <Link href="/auth/login" className="font-bold text-lg text-[#1b5e20] transition-all duration-300 hover:scale-110 px-4 py-2">
                    Login
                  </Link>
                  <Link href="/auth/signup" className="font-bold text-lg rounded-lg px-6 py-2 text-white bg-[#689f38] transition-all duration-300 hover:scale-105 hover:bg-[#1b5e20]">
                    Sign Up
                  </Link>
                </>
              ) : !loading && user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#689f38] text-white font-bold transition-all duration-300 hover:bg-[#1b5e20]"
                  >
                    <FiUser className="text-lg" />
                    <span className="truncate max-w-[120px]">{user.fullName}</span>
                    <FiChevronDown className={`transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border-2 border-[#e8f5e9] overflow-hidden">
                      <div className="px-4 py-3 border-b-2 border-[#e8f5e9]">
                        <p className="text-sm font-bold text-[#1b5e20]">{user.fullName}</p>
                        <p className="text-xs text-gray-600">{user.email}</p>
                        <p className="text-xs text-[#689f38] font-semibold mt-1">
                          {user.userType.charAt(0).toUpperCase() + user.userType.slice(1)} Account
                        </p>
                      </div>
                      <div className="px-4 py-2">
                        <Link
                          href="/auth/profile"
                          className="flex items-center gap-2 px-3 py-2 text-[#1b5e20] font-semibold hover:bg-[#ccf5d1] rounded-lg transition duration-300"
                          onClick={() => setShowDropdown(false)}
                        >
                          <FiUser className="text-lg" />
                          View Profile
                        </Link>
                        {user.userType === 'seller' && (
                          <Link
                            href="/seller/products"
                            className="flex items-center gap-2 px-3 py-2 text-[#689f38] font-semibold hover:bg-[#ccf5d1] rounded-lg transition duration-300"
                            onClick={() => setShowDropdown(false)}
                          >
                            <FiPlus className="text-lg" />
                            Add Products
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-3 py-2 text-red-600 font-semibold hover:bg-red-50 rounded-lg transition duration-300"
                        >
                          <FiLogOut className="text-lg" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </nav>
          {/* Hamburger for mobile */}
          <button
            className="md:hidden text-3xl text-[#1b5e20] p-2 rounded-lg focus:outline-none"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <FiMenu />
          </button>
        </div>
      </div>
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#e8f5e9] bg-opacity-95 flex items-center justify-center">
          <div
            className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-[#e8f5e9] shadow-lg transition-transform duration-500 delay-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
            style={{ willChange: 'transform' }}
          >
            <button
              className="absolute top-6 right-6 text-3xl text-[#1b5e20] p-2 rounded-lg focus:outline-none"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close menu"
            >
              <FiX />
            </button>
            <nav className="flex flex-col items-center justify-center h-full gap-10">
              <a href="#home" className="font-bold text-2xl text-[#1b5e20] hover:text-[#689f38] transition-all">Home</a>
              <a href="#features" className="font-bold text-2xl text-[#1b5e20] hover:text-[#689f38] transition-all">Features</a>
              <Link href="/products" className="font-bold text-2xl text-[#1b5e20] hover:text-[#689f38] transition-all flex items-center gap-2">
                <FiShoppingBag className="text-2xl" />
                Explore
              </Link>
              <a href="#categories" className="font-bold text-2xl text-[#1b5e20] hover:text-[#689f38] transition-all">Categories</a>
              <a href="#why-us" className="font-bold text-2xl text-[#1b5e20] hover:text-[#689f38] transition-all">Why Us</a>
              <a href="#contact" className="font-bold text-2xl text-[#1b5e20] hover:text-[#689f38] transition-all">Contact</a>
              <div className="flex gap-4 mt-8">
                {!loading && !user ? (
                  <>
                    <Link href="/auth/login" className="font-bold text-lg text-[#1b5e20] px-4 py-2 rounded-lg bg-[#c8e6c9] hover:bg-[#689f38] transition-all">Login</Link>
                    <Link href="/auth/signup" className="font-bold text-lg text-white px-6 py-2 rounded-lg bg-[#689f38] hover:bg-[#1b5e20] transition-all">Sign Up</Link>
                  </>
                ) : !loading && user ? (
                  <Link href="/auth/profile" className="font-bold text-lg text-[#1b5e20] px-4 py-2 rounded-lg bg-[#c8e6c9] hover:bg-[#689f38] transition-all">My Profile</Link>
                ) : null}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
