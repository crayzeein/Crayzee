'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import API from '@/utils/api';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { ShieldCheck, Truck, RotateCcw } from 'lucide-react';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { setUser } = useStore();
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (password.length < 8) {
         alert('Password must be at least 8 characters long');
         setLoading(false);
         return;
      }
      await API.post('/auth/register', { name, email, password });
      setStep(2);
      alert('Verification code sent to your email!');
    } catch (error) {
      alert(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/verify-signup', { email, otp });
      setUser(data, data.token, data.refreshToken);
      router.push('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    try {
      await API.post('/auth/register', { name, email, password });
      alert('New verification code sent! Check your inbox & spam folder.');
      // Start 60s cooldown
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to resend code');
    }
  };

  const signupWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const { data } = await API.post('/auth/google', { credential: tokenResponse.access_token });
        setUser(data, data.token, data.refreshToken);
        router.push('/');
      } catch (error) {
        alert(error.response?.data?.message || 'Google Signup failed');
      }
    }
  });

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <div className="pt-20 pb-20 flex items-center justify-center px-4 min-h-screen">
        <div className="w-full max-w-[900px] flex rounded-3xl overflow-hidden shadow-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">

          {/* Left Brand Panel — desktop only */}
          <div className="hidden md:flex w-[380px] bg-zinc-950 p-10 flex-col justify-between relative overflow-hidden shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#fb5607]/20 via-transparent to-transparent" />
            <div className="relative z-10">
              <Link href="/" className="text-2xl font-bold text-white tracking-tight block mb-2">
                CRAYZEE<span className="text-[#fb5607]">.IN</span>
              </Link>
              <p className="text-zinc-500 text-sm leading-relaxed">Join thousands of streetwear lovers. Get exclusive drops, early access, and member-only deals.</p>
            </div>
            <div className="relative z-10 space-y-4">
              {[
                { icon: ShieldCheck, text: '100% Secure Sign Up' },
                { icon: Truck, text: 'Free Shipping Above ₹1500' },
                { icon: RotateCcw, text: 'Easy 7-Day Returns' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <item.icon size={14} className="text-[#fb5607]" />
                  </div>
                  <span className="text-zinc-400 text-[12px] font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="flex-1 p-7 sm:p-10">
            <div className="mb-8">
              <div className="md:hidden mb-4">
                <Link href="/" className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                  CRAYZEE<span className="text-[#fb5607]">.IN</span>
                </Link>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">
                {step === 1 ? 'Create an account' : 'Verify your email'}
              </h2>
              <p className="text-zinc-400 text-sm mt-1">
                {step === 1 ? 'Join the Crayzee community' : 'Enter the 6-digit code sent to your email'}
              </p>
            </div>

            {step === 1 && (
              <>
                {/* Google Button — First */}
                <button
                  onClick={() => signupWithGoogle()}
                  type="button"
                  className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all mb-5"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                  <span className="text-[10px] font-medium text-zinc-400">or sign up with email</span>
                  <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:border-[#fb5607] focus:ring-1 focus:ring-[#fb5607] rounded-xl outline-none transition-all text-sm text-zinc-900 dark:text-white"
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Email address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:border-[#fb5607] focus:ring-1 focus:ring-[#fb5607] rounded-xl outline-none transition-all text-sm text-zinc-900 dark:text-white"
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:border-[#fb5607] focus:ring-1 focus:ring-[#fb5607] rounded-xl outline-none transition-all text-sm text-zinc-900 dark:text-white"
                      placeholder="Min 8 characters"
                      minLength={8}
                      required
                    />
                  </div>

                  <button disabled={loading}
                    className="w-full py-3 rounded-xl bg-[#fb5607] text-white font-semibold text-sm hover:bg-[#e04e06] transition-all disabled:opacity-50">
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </form>
              </>
            )}

            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-[12px] text-blue-600 dark:text-blue-400 text-center">
                  Code sent to <strong>{email}</strong><br/>
                  <span className="text-[11px] text-zinc-400">Check inbox, spam & promotions folder</span>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-zinc-500 mb-1.5">Verification Code</label>
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
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={resendCooldown > 0}
                  className="w-full py-2.5 rounded-xl text-[12px] font-medium text-zinc-500 hover:text-[#fb5607] transition-colors disabled:text-zinc-300 disabled:cursor-not-allowed"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive code? Resend"}
                </button>
              </form>
            )}

            <p className="text-center text-sm text-zinc-400 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-[#fb5607] font-semibold hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
