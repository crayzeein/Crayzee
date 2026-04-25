'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { User, Package, Heart, LogOut, Settings, ChevronRight, LayoutDashboard, Save, X, Lock } from 'lucide-react';
import Link from 'next/link';
import API from '@/utils/api';

export default function ProfilePage() {
  const { user, setUser, logout, _hasHydrated } = useStore();
  const router = useRouter();

  // Edit mode: null | 'personal' | 'security'
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

      <div className="w-full max-w-[1920px] mx-auto pt-24 pb-20" style={{ paddingLeft: 'clamp(16px, 4vw, 64px)', paddingRight: 'clamp(16px, 4vw, 64px)' }}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">My Account</h1>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-center">
                <div className="w-20 h-20 bg-[#fb5607]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={36} className="text-[#fb5607]" />
                </div>
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-0.5">{user.name}</h2>
                <p className="text-zinc-400 text-sm mb-5">{user.email}</p>

                <button
                  onClick={() => { logout(); router.push('/'); }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-500 text-sm font-medium hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-all"
                >
                  <LogOut size={15} /> Sign out
                </button>
              </div>

              {message.text && (
                <div className={`p-3 rounded-xl text-sm font-medium text-center ${message.type === 'success' ? 'bg-green-50 dark:bg-green-500/10 text-green-600' : 'bg-red-50 dark:bg-red-500/10 text-red-500'}`}>
                  {message.text}
                </div>
              )}
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-4">
              {/* Quick Links */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {user?.role === 'admin' && (
                  <Link href="/admin" className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 p-5 rounded-2xl group hover:shadow-lg transition-all">
                    <LayoutDashboard size={22} className="mb-3 text-[#fb5607]" />
                    <p className="text-sm font-semibold">Admin Panel</p>
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Manage store</p>
                  </Link>
                )}
                <Link href="/orders" className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 group hover:border-[#fb5607]/30 hover:shadow-md transition-all">
                  <Package size={22} className="mb-3 text-blue-500" />
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">My Orders</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Track orders</p>
                </Link>
                <Link href="/wishlist" className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 group hover:border-[#fb5607]/30 hover:shadow-md transition-all">
                  <Heart size={22} className="mb-3 text-red-500" />
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white">Wishlist</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Saved items</p>
                </Link>
              </div>

              {/* Account Settings */}
              <div className="bg-white dark:bg-zinc-900 p-5 sm:p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5 mb-5">
                  <Settings size={18} className="text-[#fb5607]" />
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">Account Settings</h3>
                </div>

                <div className="space-y-1">
                  {/* Personal Details */}
                  <SectionItem
                    label="Personal Details"
                    val="Name & email"
                    isActive={editMode === 'personal'}
                    onEdit={() => setEditMode('personal')}
                  >
                    <form onSubmit={(e) => handleUpdate(e, 'personal')} className="space-y-4 mt-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input label="Full Name" value={personalData.name} onChange={(val) => setPersonalData({ ...personalData, name: val })} />
                        <Input label="Email" value={personalData.email} onChange={(val) => setPersonalData({ ...personalData, email: val })} />
                      </div>
                      <ActionButtons onCancel={() => setEditMode(null)} loading={loading} />
                    </form>
                  </SectionItem>

                  {/* Security */}
                  <SectionItem
                    label="Security"
                    val="Change password"
                    isActive={editMode === 'security'}
                    onEdit={() => setEditMode('security')}
                  >
                    <form onSubmit={(e) => handleUpdate(e, 'security')} className="space-y-4 mt-4 pb-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input label="New Password" type="password" value={securityData.password} onChange={(val) => setSecurityData({ ...securityData, password: val })} />
                        <Input label="Confirm Password" type="password" value={securityData.confirmPassword} onChange={(val) => setSecurityData({ ...securityData, confirmPassword: val })} />
                      </div>
                      <ActionButtons onCancel={() => setEditMode(null)} loading={loading} />
                    </form>
                  </SectionItem>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  );
}

// Subcomponents
function SectionItem({ label, val, isActive, onEdit, children }) {
  return (
    <div className={`transition-all rounded-xl ${isActive ? 'bg-zinc-50 dark:bg-zinc-800/50 p-4' : ''}`}>
      <div
        onClick={!isActive ? onEdit : undefined}
        className={`flex justify-between items-center py-3 group ${!isActive ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 px-3 -mx-3 rounded-xl' : ''}`}
      >
        <div>
          <h4 className={`font-semibold text-sm transition-colors ${isActive ? 'text-[#fb5607]' : 'text-zinc-800 dark:text-zinc-100 group-hover:text-[#fb5607]'}`}>
            {label}
          </h4>
          <p className="text-zinc-400 text-xs mt-0.5">{val}</p>
        </div>
        {!isActive && <ChevronRight size={16} className="text-zinc-300 dark:text-zinc-600 group-hover:translate-x-0.5 transition-all" />}
      </div>
      {isActive && children}
    </div>
  );
}

function Input({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        required={type !== 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm outline-none focus:border-[#fb5607] focus:ring-1 focus:ring-[#fb5607] transition-all text-zinc-900 dark:text-white"
        placeholder={label}
      />
    </div>
  );
}

function ActionButtons({ onCancel, loading }) {
  return (
    <div className="flex gap-3 pt-2">
      <button type="submit" disabled={loading}
        className="flex-1 bg-[#fb5607] text-white py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#e04e06] transition-all disabled:opacity-50">
        {loading ? 'Saving...' : <><Save size={14} /> Save</>}
      </button>
      <button type="button" onClick={onCancel}
        className="px-5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all">
        <X size={14} /> Cancel
      </button>
    </div>
  );
}
