'use client';
import { useState } from 'react';
import { useStore } from '@/store/useStore';
import API from '@/utils/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUser } = useStore();
  const router = useRouter();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', { name, email, password });
      setUser(data, data.token);
      router.push('/');
    } catch (error) {
      alert(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen gradient-bg">
      <Navbar />
      <div className="pt-32 pb-20 container mx-auto px-4 flex justify-center">
        <div className="w-full max-w-md glass p-10 rounded-[40px] shadow-2xl">
          <h2 className="text-4xl font-black mb-2 text-zinc-900 dark:text-white uppercase tracking-tighter">Join the Gang!</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8 font-bold uppercase text-xs tracking-widest">Get exclusive drops and member-only gear.</p>
          
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
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#fb5607] mb-2">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 bg-zinc-100 dark:bg-white/5 border-2 border-transparent focus:border-[#fb5607] rounded-2xl outline-none transition-all text-zinc-900 dark:text-white"
                placeholder="Make it strong"
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
          
          <div className="mt-8 text-center text-zinc-500 dark:text-zinc-400 font-bold text-xs uppercase tracking-widest">
            Already have an account? <Link href="/login" className="text-[#fb5607] font-black hover:underline transition-all">Login here</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
