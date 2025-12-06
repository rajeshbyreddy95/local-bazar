'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiLoader } from 'react-icons/fi';
import OtpModal from '@/components/OtpModal';

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
    userType: 'buyer', // 'buyer' or 'seller'
    shopName: '',
    shopAddress: '',
    landmarks: '',
    pincode: '',
  });

  const [passwordMatch, setPasswordMatch] = useState(true);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Check if passwords match
    if (name === 'password' || name === 'confirmPassword') {
      const pwd = name === 'password' ? value : formData.password;
      const confirmPwd = name === 'confirmPassword' ? value : formData.confirmPassword;
      setPasswordMatch(pwd === confirmPwd || confirmPwd === '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordMatch) {
      alert('Passwords do not match!');
      return;
    }
    if (!formData.agreeToTerms) {
      alert('Please agree to the Terms and Conditions');
      return;
    }
    if (formData.userType === 'seller' && (!formData.shopName || !formData.shopAddress || !formData.pincode)) {
      alert('Please fill in all seller details');
      return;
    }

    // Send OTP to user's email
    setFormSubmitting(true);
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          userType: formData.userType,
          phone: formData.phone,
          password: formData.password,
          shopName: formData.shopName,
          shopAddress: formData.shopAddress,
          landmarks: formData.landmarks,
          pincode: formData.pincode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || 'Failed to send OTP');
        setFormSubmitting(false);
        return;
      }

      // Show OTP modal
      setShowOtpModal(true);
      setFormSubmitting(false);
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP. Please try again.');
      setFormSubmitting(false);
    }
  };

  const handleOtpVerify = async (otp: string) => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }

      // OTP verified successfully - redirect to home
      setShowOtpModal(false);
      alert('Account created successfully!');
      router.push('/');
    } catch (error: any) {
      throw new Error(error.message || 'Failed to verify OTP');
    }
  };

  const handleOtpResend = async () => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          fullName: formData.fullName,
          userType: formData.userType,
          phone: formData.phone,
          password: formData.password,
          shopName: formData.shopName,
          shopAddress: formData.shopAddress,
          landmarks: formData.landmarks,
          pincode: formData.pincode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to resend OTP');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className=" w-screen flex items-center justify-center bg-[#ccf5d1] font-sans antialiased overflow-y-auto" style={{
        width:''
    }}>
      {/* OTP Modal */}
      <OtpModal
        isOpen={showOtpModal}
        email={formData.email}
        onVerify={handleOtpVerify}
        onResend={handleOtpResend}
        loading={otpLoading}
      />
      {/* Centered Form Section */}
      <div className="w-full max-w-5xl px-6 sm:px-12 py-12">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12">
          {/* Logo/Brand */}
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-black text-[#1b5e20] mb-2">
              🛒 Local Bazar
            </h1>
            <p className="text-gray-500 font-medium text-lg">Join our community</p>
          </div>

          {/* Form Title */}
          <h2 className="text-4xl font-black text-[#1b5e20] mb-10 text-center">
            Sign Up
          </h2>

          {/* User Type Selector */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-[#1b5e20] mb-3">
              I am a...
            </label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-[#e8f5e9] rounded-xl focus:outline-none focus:border-[#689f38] focus:ring-2 focus:ring-[#ccf5d1] transition duration-300 bg-[#f9fdf7] text-[#1b5e20] font-semibold"
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Three Column Grid for Input Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Full Name Input */}
              <div>
                <label className="block text-sm font-bold text-[#1b5e20] mb-3">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#689f38] text-lg" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full pl-12 pr-4 py-3 border-2 border-[#e8f5e9] rounded-xl focus:outline-none focus:border-[#689f38] focus:ring-2 focus:ring-[#ccf5d1] transition duration-300 bg-[#f9fdf7]"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-bold text-[#1b5e20] mb-3">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#689f38] text-lg" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-[#e8f5e9] rounded-xl focus:outline-none focus:border-[#689f38] focus:ring-2 focus:ring-[#ccf5d1] transition duration-300 bg-[#f9fdf7]"
                    required
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-sm font-bold text-[#1b5e20] mb-3">
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#689f38] text-lg" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-12 pr-4 py-3 border-2 border-[#e8f5e9] rounded-xl focus:outline-none focus:border-[#689f38] focus:ring-2 focus:ring-[#ccf5d1] transition duration-300 bg-[#f9fdf7]"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-bold text-[#1b5e20] mb-3">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#689f38] text-lg" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 border-2 border-[#e8f5e9] rounded-xl focus:outline-none focus:border-[#689f38] focus:ring-2 focus:ring-[#ccf5d1] transition duration-300 bg-[#f9fdf7]"
                    required
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-bold text-[#1b5e20] mb-3">
                  Confirm Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#689f38] text-lg" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 transition duration-300 bg-[#f9fdf7] ${
                      passwordMatch
                        ? 'border-[#e8f5e9] focus:border-[#689f38] focus:ring-[#ccf5d1]'
                        : 'border-red-500 focus:border-red-600 focus:ring-red-200'
                    }`}
                    required
                  />
                </div>
                {!passwordMatch && (
                  <p className="text-red-500 text-sm font-bold mt-2">
                    ⚠ Passwords do not match
                  </p>
                )}
              </div>
            </div>

            {/* Seller Details Section */}
            {formData.userType === 'seller' && (
              <div className="mt-8 pt-8 border-t-2 border-[#e8f5e9]">
                <h3 className="text-2xl font-black text-[#1b5e20] mb-6">Shop Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Shop Name */}
                  <div>
                    <label className="block text-sm font-bold text-[#1b5e20] mb-3">
                      Shop Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#689f38] text-lg" />
                      <input
                        type="text"
                        name="shopName"
                        value={formData.shopName}
                        onChange={handleChange}
                        placeholder="Your Shop Name"
                        className="w-full pl-12 pr-4 py-3 border-2 border-[#e8f5e9] rounded-xl focus:outline-none focus:border-[#689f38] focus:ring-2 focus:ring-[#ccf5d1] transition duration-300 bg-[#f9fdf7]"
                        required={formData.userType === 'seller'}
                      />
                    </div>
                  </div>

                  {/* Shop Address */}
                  <div>
                    <label className="block text-sm font-bold text-[#1b5e20] mb-3">
                      Shop Address
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-4 top-4 text-[#689f38] text-lg" />
                      <textarea
                        name="shopAddress"
                        value={formData.shopAddress}
                        onChange={handleChange}
                        placeholder="Enter your shop address"
                        rows={2}
                        className="w-full pl-12 pr-4 py-3 border-2 border-[#e8f5e9] rounded-xl focus:outline-none focus:border-[#689f38] focus:ring-2 focus:ring-[#ccf5d1] transition duration-300 bg-[#f9fdf7] resize-none"
                        required={formData.userType === 'seller'}
                      />
                    </div>
                  </div>

                  {/* Landmarks */}
                  <div>
                    <label className="block text-sm font-bold text-[#1b5e20] mb-3">
                      Nearby Landmarks
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#689f38] text-lg" />
                      <input
                        type="text"
                        name="landmarks"
                        value={formData.landmarks}
                        onChange={handleChange}
                        placeholder="e.g., Near Railway Station, Opposite Mall"
                        className="w-full pl-12 pr-4 py-3 border-2 border-[#e8f5e9] rounded-xl focus:outline-none focus:border-[#689f38] focus:ring-2 focus:ring-[#ccf5d1] transition duration-300 bg-[#f9fdf7]"
                      />
                    </div>
                  </div>

                  {/* Pincode */}
                  <div>
                    <label className="block text-sm font-bold text-[#1b5e20] mb-3">
                      Pincode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="Enter pincode"
                      className="w-full px-4 py-3 border-2 border-[#e8f5e9] rounded-xl focus:outline-none focus:border-[#689f38] focus:ring-2 focus:ring-[#ccf5d1] transition duration-300 bg-[#f9fdf7]"
                      required={formData.userType === 'seller'}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start gap-3 mt-8">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                className="mt-1 w-5 h-5 accent-[#689f38] rounded cursor-pointer"
                required
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-700 font-medium">
                I agree to the{' '}
                <Link
                  href="/terms"
                  className="text-[#689f38] hover:text-[#1b5e20] font-semibold transition"
                >
                  Terms and Conditions
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="text-[#689f38] hover:text-[#1b5e20] font-semibold transition"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={formSubmitting}
              className="w-full bg-[#689f38] hover:bg-[#1b5e20] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition duration-300 flex items-center justify-center gap-2 group mt-8"
            >
              {formSubmitting ? (
                <>
                  <FiLoader className="animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Create Account
                  <FiArrowRight className="group-hover:translate-x-1 transition" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-0.5 bg-gray-200"></div>
            <span className="text-gray-500 font-medium text-sm">or</span>
            <div className="flex-1 h-0.5 bg-gray-200"></div>
          </div>

          {/* Login Link */}
          <div className="text-center mb-6">
            <p className="text-gray-600 font-medium">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-[#689f38] hover:text-[#1b5e20] font-bold transition duration-300"
              >
                Login here
              </Link>
            </p>
          </div>

          {/* Back to Home Link */}
          <div className="text-center">
            <Link
              href="/"
              className="text-gray-500 hover:text-[#689f38] font-medium transition text-sm duration-300"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
