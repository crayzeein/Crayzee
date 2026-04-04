'use client';
import { useState, Suspense } from 'react';
import { useStore } from '@/store/useStore';
import API from '@/utils/api';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      setUser(data, data.token);

      // Fetch user's wishlist immediately after login
      try {
        const { data: wishlistData } = await API.get('/users/wishlist');
        useStore.getState().setWishlist(wishlistData);
      } catch (err) {
        console.error('Failed to fetch wishlist', err);
      }

      router.push(redirectTo);
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const { data } = await API.post('/auth/google', { credential: tokenResponse.access_token });
        setUser(data, data.token);

        try {
          const { data: wishlistData } = await API.get('/users/wishlist');
          useStore.getState().setWishlist(wishlistData);
        } catch (err) {}

        router.push(redirectTo);
      } catch (error) {
        alert(error.response?.data?.message || 'Google Login failed');
      }
    }
  });

  return (
    <main className="min-h-screen gradient-bg">
      <Navbar />
      <div className="pt-32 pb-20 container mx-auto px-4 flex justify-center">
        <div className="w-full max-w-md glass p-10 rounded-[40px] shadow-2xl">
          <h2 className="text-4xl font-black mb-2 text-zinc-900 dark:text-white uppercase tracking-tighter">Welcome Back!</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 font-bold uppercase text-xs tracking-widest">Ready to get more crayzee?</p>

          <form onSubmit={handleLogin} className="space-y-6">
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
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#fb5607] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-zinc-100 dark:bg-white/5 border-2 border-transparent focus:border-[#fb5607] rounded-2xl outline-none transition-all text-zinc-900 dark:text-white"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
            <div className="text-right mt-1">
              <Link href="/forgot-password" className="text-[10px] uppercase font-bold text-zinc-500 hover:text-[#fb5607] transition-colors">Forgot Password?</Link>
            </div>
          </form>

          <div className="mt-6 flex flex-col items-center">
            <div className="flex w-full items-center mb-6">
              <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800"></div>
              <span className="px-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">OR</span>
              <div className="flex-1 border-t border-zinc-200 dark:border-zinc-800"></div>
            </div>
            
            <button
              onClick={() => loginWithGoogle()}
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-[#fb5607] hover:bg-[#ff7a33] text-white py-4 px-6 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
              </svg>
              Sign in with Google
            </button>
          </div>

          <div className="mt-8 text-center text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest">
            Don't have an account? <Link href="/signup" className="text-[#fb5607] font-black hover:underline transition-all">Join the club</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen gradient-bg" />}>
      <LoginContent />
    </Suspense>
  );
}

