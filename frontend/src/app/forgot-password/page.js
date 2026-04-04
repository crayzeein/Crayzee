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

  return (
    <main className="min-h-screen gradient-bg">
      <Navbar />
      <div className="pt-32 pb-20 container mx-auto px-4 flex justify-center">
        <div className="w-full max-w-md glass p-10 rounded-[40px] shadow-2xl">
          <h2 className="text-4xl font-black mb-2 text-zinc-900 dark:text-white uppercase tracking-tighter">
            {step === 1 ? 'Forgot Password?' : step === 2 ? 'Enter OTP' : 'New Password'}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 font-bold uppercase text-xs tracking-widest">
            {step === 1
              ? 'Enter your email to get a reset code.'
              : step === 2
              ? 'Check your email for the 6-digit code.'
              : 'Secure your account with a strong password.'}
          </p>

          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#fb5607] mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 bg-zinc-100 dark:bg-white/5 border-2 border-transparent focus:border-[#fb5607] rounded-2xl outline-none transition-all text-zinc-900 dark:text-white"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <button disabled={loading} className="w-full btn-primary disabled:opacity-50">
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#fb5607] mb-2">6-Digit OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-6 py-4 bg-zinc-100 dark:bg-white/5 border-2 border-transparent focus:border-[#fb5607] rounded-2xl outline-none transition-all text-zinc-900 dark:text-white tracking-[0.5em] text-center font-black"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              <button disabled={loading} className="w-full btn-primary disabled:opacity-50">
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#fb5607] mb-2">New Password (Min 8 Chars)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-zinc-100 dark:bg-white/5 border-2 border-transparent focus:border-[#fb5607] rounded-2xl outline-none transition-all text-zinc-900 dark:text-white"
                  placeholder="Make it strong"
                  minLength={8}
                  required
                />
              </div>
              <button disabled={loading} className="w-full btn-primary disabled:opacity-50">
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest">
            Remember your password? <Link href="/login" className="text-[#fb5607] font-black hover:underline transition-all">Go back to login</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
