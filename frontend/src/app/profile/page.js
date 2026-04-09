'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { User, Package, Heart, LogOut, Settings, ChevronRight, LayoutDashboard, Save, X, MapPin, ShieldCheck, Lock } from 'lucide-react';
import Link from 'next/link';
import API from '@/utils/api';

export default function ProfilePage() {
  const { user, setUser, logout, _hasHydrated } = useStore();
  const router = useRouter();

  // Edit mode: null | 'personal' | 'address' | 'security'
  const [editMode, setEditMode] = useState(null);

  const [personalData, setPersonalData] = useState({ name: '', email: '' });
  const [securityData, setSecurityData] = useState({ password: '', confirmPassword: '' });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (_hasHydrated && !user) {
      router.push('/login?redirect=/profile');
    } else if (user) {
      setPersonalData({ name: user.name, email: user.email });
    }
  }, [user, router, _hasHydrated]);

  if (!_hasHydrated) return null;
  if (!user) return null;

  const handleUpdate = async (e, mode) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      let payload = {};

      if (mode === 'personal') {
        payload = personalData;
      } else if (mode === 'security') {
        if (securityData.password !== securityData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        payload = { password: securityData.password };
      }

      const { data } = await API.put('/auth/profile', payload);
      setUser(data, data.token);
      setEditMode(null);
      setSecurityData({ password: '', confirmPassword: '' });
      setMessage({ type: 'success', text: `${mode.charAt(0).toUpperCase() + mode.slice(1)} updated successfully!` });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || error.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Navbar />

      <div className="pt-32 pb-20 container mx-auto px-4 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-10 rounded-[32px] md:rounded-[48px] shadow-xl border border-zinc-100 dark:border-white/5 text-center">
              <div className="w-32 h-32 bg-[#fb5607]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <User size={64} className="text-[#fb5607]" />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 text-zinc-900 dark:text-white">{user.name}</h1>
              <p className="text-zinc-500 dark:text-zinc-400 font-bold text-sm mb-8 uppercase tracking-widest">{user.email}</p>

              <button
                onClick={() => { logout(); router.push('/'); }}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
              >
                <LogOut size={16} /> Logout Profile
              </button>
            </div>

            {message.text && (
              <div className={`p-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-center animate-in fade-in zoom-in duration-300 ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {message.text}
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {user?.role === 'admin' && (
                <Link href="/admin" className="bg-black text-white p-8 rounded-[40px] shadow-lg group hover:scale-[1.02] transition-all">
                  <div className="w-14 h-14 bg-[#fb5607] rounded-2xl flex items-center justify-center mb-6">
                    <LayoutDashboard size={28} className="text-white" />
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tighter mb-1">Control Center</h3>
                      <p className="text-[#fb5607] text-[10px] font-black uppercase tracking-widest">Admin Dashboard</p>
                    </div>
                    <ChevronRight size={20} className="text-white/20 group-hover:text-white transition-colors" />
                  </div>
                </Link>
              )}

              <Link href="/orders" className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] shadow-lg border border-zinc-100 dark:border-white/5 group hover:border-[#fb5607] transition-all">
                <div className="w-14 h-14 bg-blue-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Package size={28} className="text-blue-500" />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-1 text-zinc-900 dark:text-white group-hover:text-[#fb5607] transition-colors">My Orders</h3>
                    <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest">Track your drops</p>
                  </div>
                  <ChevronRight size={20} className="text-zinc-300 dark:text-zinc-600 group-hover:text-[#fb5607] transition-colors" />
                </div>
              </Link>

              <Link href="/wishlist" className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] shadow-lg border border-zinc-100 dark:border-white/5 group hover:border-[#fb5607] transition-all">
                <div className="w-14 h-14 bg-red-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Heart size={28} className="text-red-500" />
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-xl font-black uppercase tracking-tighter mb-1 text-zinc-900 dark:text-white group-hover:text-[#fb5607] transition-colors">Wishlist</h3>
                    <p className="text-zinc-400 dark:text-zinc-500 text-[10px] font-black uppercase tracking-widest">Saved Vibes</p>
                  </div>
                  <ChevronRight size={20} className="text-zinc-300 dark:text-zinc-600 group-hover:text-[#fb5607] transition-colors" />
                </div>
              </Link>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-6 sm:p-10 rounded-[32px] md:rounded-[48px] shadow-xl border border-zinc-100 dark:border-white/5">
              <div className="flex items-center gap-4 mb-10">
                <Settings size={28} className="text-[#fb5607]" />
                <h3 className="text-2xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white">Account Vibe</h3>
              </div>

              <div className="space-y-6">
                {/* Personal Details Section */}
                <SectionItem
                  label="Personal Details"
                  val="Update name & email"
                  isActive={editMode === 'personal'}
                  onEdit={() => setEditMode('personal')}
                >
                  <form onSubmit={(e) => handleUpdate(e, 'personal')} className="space-y-6 mt-6 pb-6 border-b border-zinc-100 dark:border-white/5">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="Full Name"
                        value={personalData.name}
                        onChange={(val) => setPersonalData({ ...personalData, name: val })}
                      />
                      <Input
                        label="Email Address"
                        value={personalData.email}
                        onChange={(val) => setPersonalData({ ...personalData, email: val })}
                      />
                    </div>
                    <ActionButtons onCancel={() => setEditMode(null)} loading={loading} />
                  </form>
                </SectionItem>


                {/* Security Section */}
                <SectionItem
                  label="Security"
                  val="Passcodes & Keys"
                  isActive={editMode === 'security'}
                  onEdit={() => setEditMode('security')}
                >
                  <form onSubmit={(e) => handleUpdate(e, 'security')} className="space-y-6 mt-6 pb-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <Input
                        label="New Password"
                        type="password"
                        value={securityData.password}
                        onChange={(val) => setSecurityData({ ...securityData, password: val })}
                      />
                      <Input
                        label="Confirm Password"
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(val) => setSecurityData({ ...securityData, confirmPassword: val })}
                      />
                    </div>
                    <ActionButtons onCancel={() => setEditMode(null)} loading={loading} />
                  </form>
                </SectionItem>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

// Subcomponents for cleaner code
function SectionItem({ label, val, isActive, onEdit, children }) {
  return (
    <div className={`transition-all ${isActive ? 'bg-zinc-50/50 dark:bg-white/5 -mx-4 px-4 rounded-3xl' : ''}`}>
      <div
        onClick={!isActive ? onEdit : undefined}
        className={`flex justify-between items-center py-6 border-b border-zinc-50 dark:border-white/5 last:border-0 group ${!isActive ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-white/5 -mx-4 px-4 rounded-3xl' : 'border-none'}`}
      >
        <div>
          <h4 className={`font-black uppercase text-sm mb-1 transition-colors ${isActive ? 'text-[#fb5607]' : 'text-zinc-800 dark:text-zinc-100 group-hover:text-[#fb5607]'}`}>
            {label}
          </h4>
          <p className="text-zinc-400 dark:text-zinc-500 text-xs font-bold uppercase tracking-widest">{val}</p>
        </div>
        {!isActive && <ChevronRight size={18} className="text-zinc-200 dark:text-zinc-700 group-hover:translate-x-1 transition-all" />}
      </div>
      {isActive && children}
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', full = false }) {
  return (
    <div className={`space-y-2 ${full ? 'w-full' : ''}`}>
      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-4">{label}</label>
      <input
        type={type}
        required={type !== 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white dark:bg-zinc-800 border-none rounded-2xl px-6 py-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-[#fb5607] transition-all outline-none"
        placeholder={label}
      />
    </div>
  );
}

function ActionButtons({ onCancel, loading }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
      <button
        type="submit"
        disabled={loading}
        className="flex-1 bg-[#fb5607] text-white py-3 sm:py-4 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#ff6b2b] transition-all shadow-lg shadow-[#fb5607]/20 disabled:opacity-50"
      >
        {loading ? 'Processing...' : <><Save size={14} /> Save Changes</>}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-6 sm:px-8 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 py-3 sm:py-4 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-all"
      >
        <X size={14} /> Cancel
      </button>
    </div>
  );
}
