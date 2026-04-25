'use client';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { Mail, Clock, MapPin, Send, ArrowLeft } from 'lucide-react';

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Navbar />

            <div className="w-full max-w-[1920px] mx-auto pt-24 pb-20" style={{ paddingLeft: 'clamp(16px, 4vw, 64px)', paddingRight: 'clamp(16px, 4vw, 64px)' }}>
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Contact Us</h1>
                        <p className="text-zinc-400 text-sm mt-1">
                            Got questions or feedback? We'd love to hear from you.
                        </p>
                    </div>

                    {/* Contact Cards */}
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">

                        {/* Email Card */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 group hover:border-[#fb5607]/30 hover:shadow-md transition-all">
                            <div className="w-11 h-11 rounded-xl bg-[#fb5607]/10 text-[#fb5607] flex items-center justify-center mb-4 group-hover:bg-[#fb5607] group-hover:text-white transition-all">
                                <Mail size={20} />
                            </div>
                            <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">Email Us</h2>
                            <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                                For orders, collabs, or anything else.
                            </p>
                            <a href="mailto:crayzee.in@gmail.com"
                                className="inline-flex items-center gap-1.5 text-[#fb5607] font-semibold text-sm hover:gap-2.5 transition-all">
                                <Send size={13} /> crayzee.in@gmail.com
                            </a>
                        </div>

                        {/* Response Time Card */}
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 group hover:border-[#fb5607]/30 hover:shadow-md transition-all">
                            <div className="w-11 h-11 rounded-xl bg-[#fb5607]/10 text-[#fb5607] flex items-center justify-center mb-4 group-hover:bg-[#fb5607] group-hover:text-white transition-all">
                                <Clock size={20} />
                            </div>
                            <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">Response Time</h2>
                            <p className="text-sm text-zinc-400 mb-4 leading-relaxed">
                                We usually reply within 24 hours.
                            </p>
                            <span className="inline-flex items-center gap-1.5 text-zinc-400 text-sm font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                Mon – Sat, 10 AM – 7 PM IST
                            </span>
                        </div>

                        {/* Location Card — Full Width */}
                        <div className="sm:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 group hover:border-[#fb5607]/30 hover:shadow-md transition-all">
                            <div className="flex items-start gap-4">
                                <div className="w-11 h-11 rounded-xl bg-[#fb5607]/10 text-[#fb5607] flex items-center justify-center shrink-0 group-hover:bg-[#fb5607] group-hover:text-white transition-all">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                                        Based In India 🇮🇳
                                    </h2>
                                    <p className="text-sm text-zinc-400 leading-relaxed">
                                        We're an Indian streetwear brand, shipping across the country. For business inquiries or wholesale —{' '}
                                        <a href="mailto:crayzee.in@gmail.com" className="text-[#fb5607] font-medium hover:underline">
                                            crayzee.in@gmail.com
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back link */}
                    <div className="mt-6">
                        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-[#fb5607] transition-colors font-medium">
                            <ArrowLeft size={14} /> Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
