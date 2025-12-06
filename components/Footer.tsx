'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

interface UserSession {
  email: string;
  fullName: string;
  userType: 'buyer' | 'seller';
}

const footerLinks = {
  quickLinks: [
    { name: 'About Us', href: '/about' },
    { name: 'Products', href: '/products' },
    { name: 'Blog', href: '/blog' },
    { name: 'Careers', href: '/careers' }
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Contact Us', href: '/contact' }
  ]
};

export default function Footer() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

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
  }, []);

  const handleAccountClick = (type: 'login' | 'signup') => {
    if (user) {
      router.push('/auth/profile');
    } else {
      if (type === 'login') {
        router.push('/auth/login');
      } else {
        router.push('/auth/signup');
      }
    }
  };
  return (
    <footer className="bg-[#1b5e20] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">🌿</div>
              <h3 className="text-3xl font-black">Local Bazar</h3>
            </div>
            <p className="text-lg font-semibold leading-relaxed text-[#c8e6c9]">
              Supporting local businesses, one order at a time.
            </p>
          </div>

          <div>
            <h4 className="text-2xl font-black mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {footerLinks.quickLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-lg font-semibold text-[#c8e6c9] transition-colors hover:text-green-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-2xl font-black mb-6">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-lg font-semibold text-[#c8e6c9] transition-colors hover:text-green-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-2xl font-black mb-6">Account</h4>
            <ul className="space-y-3 mb-8">
              {!loading && (
                <>
                  <li>
                    <button
                      onClick={() => handleAccountClick('login')}
                      className="text-lg font-semibold text-[#c8e6c9] transition-colors hover:text-green-300 text-left"
                    >
                      {user ? 'My Profile' : 'Login'}
                    </button>
                  </li>
                  {!user && (
                    <li>
                      <button
                        onClick={() => handleAccountClick('signup')}
                        className="text-lg font-semibold text-[#c8e6c9] transition-colors hover:text-green-300 text-left"
                      >
                        Sign Up
                      </button>
                    </li>
                  )}
                </>
              )}
            </ul>
            <h4 className="text-2xl font-black mb-6">Follow Us</h4>
            <div className="flex gap-5">
              <a href="#" className="text-4xl text-[#c8e6c9] hover:text-green-300 transition-colors transform hover:scale-125">
                <FaFacebook />
              </a>
              <a href="#" className="text-4xl text-[#c8e6c9] hover:text-green-300 transition-colors transform hover:scale-125">
                <FaTwitter />
              </a>
              <a href="#" className="text-4xl text-[#c8e6c9] hover:text-green-300 transition-colors transform hover:scale-125">
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        <hr className="border-[#4caf50] mb-8" />
        
        <div className="flex flex-col md:flex-row justify-between items-center text-lg font-semibold text-[#c8e6c9]">
          <p>&copy; 2025 Local Bazar. All rights reserved.</p>
          <p className="mt-4 md:mt-0">Made with 💚 for local communities</p>
        </div>
      </div>
    </footer>
  );
}
