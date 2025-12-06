'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiMail, FiLock, FiLoader } from 'react-icons/fi';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Login successful
      setLoading(false);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#ccf5d1] font-sans antialiased px-4 py-8 sm:py-0">
      {/* Centered Form Section */}
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 md:p-12">
          {/* Logo/Brand */}
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#1b5e20] mb-1 sm:mb-2">
              🛒 Local Bazar
            </h1>
            <p className="text-gray-500 font-medium text-sm sm:text-base md:text-lg">Welcome back!</p>
          </div>

          {/* Form Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1b5e20] mb-6 sm:mb-10 text-center">
            Login
          </h2>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#1b5e20] mb-2 sm:mb-3">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-[#689f38] text-base sm:text-lg" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#e8f5e9] rounded-xl focus:outline-none focus:border-[#689f38] focus:ring-2 focus:ring-[#ccf5d1] transition duration-300 bg-[#f9fdf7]"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs sm:text-sm font-bold text-[#1b5e20] mb-2 sm:mb-3">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-[#689f38] text-base sm:text-lg" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 sm:pl-12 pr-4 py-2 sm:py-3 text-sm sm:text-base border-2 border-[#e8f5e9] rounded-xl focus:outline-none focus:border-[#689f38] focus:ring-2 focus:ring-[#ccf5d1] transition duration-300 bg-[#f9fdf7]"
                  required
                />
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-[#689f38] hover:text-[#1b5e20] font-semibold transition text-xs sm:text-sm"
              >
                Forgot password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 sm:p-4 mb-4">
                <p className="text-red-600 font-semibold text-xs sm:text-sm">⚠ {error}</p>
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#689f38] hover:bg-[#1b5e20] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 sm:py-3 text-sm sm:text-base rounded-lg transition duration-300 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin text-sm sm:text-base" />
                  Logging in...
                </>
              ) : (
                <>
                  Login
                  <FiArrowRight className="group-hover:translate-x-1 transition text-sm sm:text-base" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 sm:my-8 flex items-center gap-4">
            <div className="flex-1 h-0.5 bg-[#e8f5e9]"></div>
            <span className="text-gray-400 font-medium text-xs sm:text-sm">or</span>
            <div className="flex-1 h-0.5 bg-[#e8f5e9]"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mb-4 sm:mb-6">
            <p className="text-gray-600 font-medium text-xs sm:text-sm md:text-base">
              Don't have an account?{' '}
              <Link
                href="/auth/signup"
                className="text-[#689f38] hover:text-[#1b5e20] font-bold transition duration-300"
              >
                Sign up now
              </Link>
            </p>
          </div>

          {/* Back to Home Link */}
          <div className="text-center">
            <Link
              href="/"
              className="text-gray-500 hover:text-[#689f38] font-medium transition text-xs sm:text-sm duration-300"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
