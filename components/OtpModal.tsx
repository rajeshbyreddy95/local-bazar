'use client';

import { useState, useEffect } from 'react';
import { FiX, FiLoader } from 'react-icons/fi';

interface OtpModalProps {
  isOpen: boolean;
  email: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  loading?: boolean;
}

export default function OtpModal({
  isOpen,
  email,
  onVerify,
  onResend,
  loading = false,
}: OtpModalProps) {
  const [otp, setOtp] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [resendDisabled, setResendDisabled] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('OTP must be 6 digits');
      return;
    }
    try {
      setError('');
      await onVerify(otp);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    }
  };

  const handleResend = async () => {
    try {
      setResendDisabled(true);
      setTimeLeft(300);
      setOtp('');
      setError('');
      await onResend();
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResendDisabled(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black text-[#1b5e20]">Verify OTP</h2>
        </div>

        {/* Description */}
        <p className="text-gray-600 font-medium mb-6">
          We've sent a verification code to{' '}
          <span className="font-bold text-[#689f38]">{email}</span>
        </p>

        {/* OTP Input */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-[#1b5e20] mb-3">
            Enter 6-digit OTP
          </label>
          <input
            type="text"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtp(val);
            }}
            placeholder="000000"
            className="w-full px-4 py-4 border-2 border-[#e8f5e9] rounded-xl focus:outline-none focus:border-[#689f38] focus:ring-2 focus:ring-[#ccf5d1] transition duration-300 bg-[#f9fdf7] text-center text-2xl font-bold tracking-widest"
          />
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-sm font-bold mb-4 text-center">
            ⚠ {error}
          </p>
        )}

        {/* Timer */}
        <div className="text-center mb-6">
          {timeLeft > 0 ? (
            <p className="text-gray-600 font-semibold">
              Code expires in: <span className="text-[#689f38] font-black">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className="text-red-500 font-bold">Code expired! Please request a new one.</p>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={loading || otp.length !== 6 || timeLeft === 0}
          className="w-full py-4 rounded-xl text-white font-bold text-lg bg-[#689f38] hover:bg-[#1b5e20] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
        >
          {loading && <FiLoader className="animate-spin" />}
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        {/* Resend Button */}
        <button
          onClick={handleResend}
          disabled={resendDisabled || loading}
          className="w-full py-3 rounded-xl text-[#689f38] font-bold text-lg border-2 border-[#689f38] hover:bg-[#ccf5d1] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendDisabled ? 'Resending...' : "Didn't receive code? Resend"}
        </button>
      </div>
    </div>
  );
}
