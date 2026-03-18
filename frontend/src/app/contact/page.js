'use client';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { Mail, MessageCircle, Clock, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
    return (
        <main className="bg-white dark:bg-zinc-950 min-h-screen">
            <Navbar />

            {/* Hero */}
            <section className="pt-32 pb-16 md:pt-40 md:pb-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 text-[#fb5607] font-black text-[10px] uppercase tracking-widest mb-6">
                            <MessageCircle size={14} className="fill-[#fb5607]" /> Get In Touch
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white mb-6">
                            Contact <span className="text-[#fb5607]">Us</span>
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm md:text-base max-w-xl mx-auto">
                            Got questions, feedback, or just wanna talk streetwear? We're all ears. Hit us up and we'll get back to you ASAP.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Cards */}
            <section className="pb-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">

                        {/* Email Card */}
                        <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-3xl p-8 md:p-10 border border-zinc-100 dark:border-zinc-800/50 group hover:border-[#fb5607]/30 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-[#fb5607]/10 text-[#fb5607] flex items-center justify-center mb-6 group-hover:bg-[#fb5607] group-hover:text-white transition-all">
                                <Mail size={24} />
                            </div>
                            <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white mb-3">
                                Email Us
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                                For orders, collabs, or anything else — drop us a mail.
                            </p>
                            <a
                                href="mailto:crayzee.in@gmail.com"
                                className="inline-flex items-center gap-2 text-[#fb5607] font-black text-sm uppercase tracking-widest hover:gap-3 transition-all"
                            >
                                <Send size={14} />
                                crayzee.in@gmail.com
                            </a>
                        </div>

                        {/* Response Time Card */}
                        <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-3xl p-8 md:p-10 border border-zinc-100 dark:border-zinc-800/50 group hover:border-[#fb5607]/30 transition-all">
                            <div className="w-14 h-14 rounded-2xl bg-[#fb5607]/10 text-[#fb5607] flex items-center justify-center mb-6 group-hover:bg-[#fb5607] group-hover:text-white transition-all">
                                <Clock size={24} />
                            </div>
                            <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white mb-3">
                                Response Time
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                                We usually reply within 24 hours. For urgent stuff, mention "URGENT" in the subject.
                            </p>
                            <span className="inline-flex items-center gap-2 text-zinc-400 font-black text-xs uppercase tracking-widest">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Mon – Sat, 10 AM – 7 PM IST
                            </span>
                        </div>

                        {/* Location Card — Full Width */}
                        <div className="md:col-span-2 bg-zinc-50 dark:bg-zinc-900/60 rounded-3xl p-8 md:p-10 border border-zinc-100 dark:border-zinc-800/50 group hover:border-[#fb5607]/30 transition-all">
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-[#fb5607]/10 text-[#fb5607] flex items-center justify-center shrink-0 group-hover:bg-[#fb5607] group-hover:text-white transition-all">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900 dark:text-white mb-2">
                                        Based In India 🇮🇳
                                    </h2>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                        We're an Indian streetwear brand, shipping across the country. For business inquiries, partnerships, or wholesale — drop us a mail at{' '}
                                        <a href="mailto:crayzee.in@gmail.com" className="text-[#fb5607] font-bold hover:underline">
                                            crayzee.in@gmail.com
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Back link */}
                    <div className="max-w-3xl mx-auto mt-12 text-center">
                        <Link
                            href="/"
                            className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-[#fb5607] transition-colors"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
