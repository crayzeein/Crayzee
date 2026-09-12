'use client';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Shared shell for Privacy, Terms, Refund and Shipping policy pages
export default function LegalPage({ title, subtitle, updated, sections }) {
    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Navbar />

            <div className="w-full max-w-[1920px] mx-auto pt-24 pb-20" style={{ paddingLeft: 'clamp(16px, 4vw, 64px)', paddingRight: 'clamp(16px, 4vw, 64px)' }}>
                <div className="max-w-3xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">{title}</h1>
                        <p className="text-zinc-400 text-sm mt-1">{subtitle}</p>
                        <p className="text-zinc-300 dark:text-zinc-600 text-[11px] mt-2">Last updated: {updated}</p>
                    </div>

                    <div className="space-y-4">
                        {sections.map((section, i) => (
                            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 border border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2.5 mb-4">
                                    <div className="w-9 h-9 rounded-xl bg-[#fb5607]/10 text-[#fb5607] flex items-center justify-center">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-base font-bold text-zinc-900 dark:text-white">{section.title}</h2>
                                </div>
                                <ul className="space-y-2.5 pl-[46px]">
                                    {section.content.map((item, j) => (
                                        <li key={j} className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed flex gap-2">
                                            <span className="text-[#fb5607] shrink-0 mt-0.5">•</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

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
