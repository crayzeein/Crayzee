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
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <div className="pt-28 pb-20 flex items-center justify-center px-4">
        <div className="w-full max-w-[420px]">
          {/* Logo */}
          <div className="text-center mb-8">
            <img src="/logo.png" alt="Crayzee" className="w-12 h-12 mx-auto mb-4 object-contain" />
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Welcome back</h2>
            <p className="text-zinc-400 text-sm mt-1">Sign in to your Crayzee account</p>
          </div>

          <div className="bg-white dark:bg-zinc-900 p-7 rounded-2xl border border-zinc-100 dark:border-zinc-800">
            <form onSubmit={handleLogin} className="space-y-4">
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
              <div>
                <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:border-[#fb5607] focus:ring-1 focus:ring-[#fb5607] rounded-xl outline-none transition-all text-sm text-zinc-900 dark:text-white"
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="text-right">
                <Link href="/forgot-password" className="text-[11px] text-zinc-400 hover:text-[#fb5607] transition-colors font-medium">Forgot password?</Link>
              </div>
              <button disabled={loading}
                className="w-full py-3 rounded-xl bg-[#fb5607] text-white font-semibold text-sm hover:bg-[#e04e06] transition-all disabled:opacity-50">
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
              <span className="text-[10px] font-semibold text-zinc-400 uppercase">or</span>
              <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
            </div>

            <button
              onClick={() => loginWithGoogle()}
              type="button"
              className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
          </div>

          <p className="text-center text-sm text-zinc-400 mt-6">
            Don't have an account?{' '}
            <Link href="/signup" className="text-[#fb5607] font-semibold hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 dark:bg-zinc-950" />}>
      <LoginContent />
    </Suspense>
  );
}
