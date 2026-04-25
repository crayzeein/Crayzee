'use client';
import { useState } from 'react';
import API from '@/utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/forgot-password', { email });
      setStep(2);
      alert('OTP sent to your email!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/verify-otp', { email, otp });
      setStep(3);
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/auth/reset-password', { email, otp, newPassword });
      alert('Password reset successful! You can now log in.');
      router.push('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    1: { heading: 'Reset password', sub: 'Enter your email to receive a reset code' },
    2: { heading: 'Enter OTP', sub: 'Check your email for the 6-digit code' },
    3: { heading: 'New password', sub: 'Create a strong password for your account' },
  };

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <div className="pt-28 pb-20 flex items-center justify-center px-4">
        <div className="w-full max-w-[420px]">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Crayzee" className="w-12 h-12 mx-auto mb-4 object-contain" />
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{titles[step].heading}</h2>
            <p className="text-zinc-400 text-sm mt-1">{titles[step].sub}</p>
          </div>

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
              <div key={s} className={`h-1 rounded-full transition-all ${s <= step ? 'w-8 bg-[#fb5607]' : 'w-4 bg-zinc-200 dark:bg-zinc-700'}`} />
            ))}
          </div>

          <div className="bg-white dark:bg-zinc-900 p-7 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:border-[#fb5607] focus:ring-1 focus:ring-[#fb5607] rounded-xl outline-none transition-all text-sm text-zinc-900 dark:text-white"
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <button disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#fb5607] text-white font-semibold text-sm hover:bg-[#e04e06] transition-all disabled:opacity-50">
                  {loading ? 'Sending...' : 'Send Code'}
                </button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">Verification Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:border-[#fb5607] focus:ring-1 focus:ring-[#fb5607] rounded-xl outline-none transition-all text-sm text-zinc-900 dark:text-white tracking-[0.3em] text-center font-semibold"
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
                <button disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#fb5607] text-white font-semibold text-sm hover:bg-[#e04e06] transition-all disabled:opacity-50">
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">New Password (Min 8 chars)</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:border-[#fb5607] focus:ring-1 focus:ring-[#fb5607] rounded-xl outline-none transition-all text-sm text-zinc-900 dark:text-white"
                    placeholder="Create a strong password"
                    minLength={8}
                    required
                  />
                </div>
                <button disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#fb5607] text-white font-semibold text-sm hover:bg-[#e04e06] transition-all disabled:opacity-50">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-sm text-zinc-400 mt-6">
            Remember your password?{' '}
            <Link href="/login" className="text-[#fb5607] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
