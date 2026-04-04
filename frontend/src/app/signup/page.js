'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import API from '@/utils/api';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
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
      setUser(data, data.token);
      router.push('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const signupWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const { data } = await API.post('/auth/google', { credential: tokenResponse.access_token });
        setUser(data, data.token);
        router.push('/');
      } catch (error) {
        alert(error.response?.data?.message || 'Google Signup failed');
      }
    }
  });

  return (
    <main className="min-h-screen gradient-bg">
      <Navbar />
      <div className="pt-32 pb-20 container mx-auto px-4 flex justify-center">
        <div className="w-full max-w-md glass p-10 rounded-[40px] shadow-2xl">
          <h2 className="text-4xl font-black mb-2 text-zinc-900 dark:text-white uppercase tracking-tighter">
            {step === 1 ? 'Join the Gang!' : 'Verify Email'}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 font-bold uppercase text-xs tracking-widest">
            {step === 1 ? 'Get exclusive drops and member-only gear.' : 'A 6-digit code has been sent to your email.'}
          </p>
          
          {step === 1 && (
            <form onSubmit={handleSignup} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#fb5607] mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-6 py-4 bg-zinc-100 dark:bg-white/5 border-2 border-transparent focus:border-[#fb5607] rounded-2xl outline-none transition-all text-zinc-900 dark:text-white"
                  placeholder="What should we call you?"
                  required
                />
              </div>
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
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#fb5607] mb-2">Password (Min 8 Characters)</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 bg-zinc-100 dark:bg-white/5 border-2 border-transparent focus:border-[#fb5607] rounded-2xl outline-none transition-all text-zinc-900 dark:text-white"
                  placeholder="Make it strong"
                  minLength={8}
                  required
                />
              </div>
              
              <button 
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Get Started'}
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
                {loading ? 'Verifying...' : 'Verify OTP & Login'}
              </button>
            </form>
          )}
          
          <div className="mt-6 flex flex-col items-center">
            <div className="flex w-full items-center mb-6">
              <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800"></div>
              <span className="px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">OR</span>
              <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>
            
            <button
              onClick={() => signupWithGoogle()}
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-[#fb5607] hover:bg-[#ff7a33] text-white py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
              </svg>
              Sign up with Google
            </button>
          </div>

          <div className="mt-8 text-center text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest">
            Already have an account? <Link href="/login" className="text-[#fb5607] font-black hover:underline transition-all">Login here</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
