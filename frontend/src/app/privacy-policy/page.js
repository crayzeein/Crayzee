'use client';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { Shield, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react';

export default function PrivacyPolicyPage() {
    const sections = [
        {
            icon: <Database size={20} />,
            title: 'Information We Collect',
            content: [
                'When you create an account, we collect your name, email address, and password (stored securely using encryption).',
                'When you place an order, we collect your shipping address, phone number, and payment-related details.',
                'We automatically collect basic usage data such as pages visited, browser type, and device information to improve your experience.'
            ]
        },
        {
            icon: <Eye size={20} />,
            title: 'How We Use Your Information',
            content: [
                'To process and deliver your orders efficiently.',
                'To manage your account and provide customer support.',
                'To send you order updates, promotional offers, and new drop alerts (you can opt out anytime).',
                'To improve our website, products, and overall shopping experience.'
            ]
        },
        {
            icon: <Lock size={20} />,
            title: 'Data Security',
            content: [
                'We use industry-standard security measures including SSL encryption and secure password hashing to protect your personal data.',
                'Your payment information is processed through secure third-party payment gateways. We do not store your card details on our servers.',
                'Access to personal data is restricted to authorized personnel only.'
            ]
        },
        {
            icon: <UserCheck size={20} />,
            title: 'Your Rights',
            content: [
                'You can access, update, or delete your personal information at any time through your account settings.',
                'You can request a copy of your data or ask us to stop processing it by contacting us.',
                'You can unsubscribe from marketing emails at any time using the link provided in the email.'
            ]
        },
        {
            icon: <Shield size={20} />,
            title: 'Cookies',
            content: [
                'We use cookies and similar technologies to keep you logged in, remember your preferences, and analyze site traffic.',
                'You can manage cookie preferences through your browser settings.'
            ]
        },
        {
            icon: <Mail size={20} />,
            title: 'Contact Us',
            content: [
                'If you have any questions about this Privacy Policy, please contact us at crayzee.in@gmail.com.',
                'We may update this policy from time to time. Any changes will be posted on this page.'
            ]
        }
    ];

    return (
        <main className="bg-white dark:bg-zinc-950 min-h-screen">
            <Navbar />

            {/* Hero */}
            <section className="pt-32 pb-16 md:pt-40 md:pb-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 text-[#fb5607] font-black text-[10px] uppercase tracking-widest mb-6">
                            <Shield size={14} className="fill-[#fb5607]" /> Legal
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-zinc-900 dark:text-white mb-6">
                            Privacy <span className="text-[#fb5607]">Policy</span>
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm md:text-base max-w-xl mx-auto">
                            Your privacy matters to us. Here's how we collect, use, and protect your information at Crayzee.in.
                        </p>
                        <p className="text-zinc-400 dark:text-zinc-600 font-bold text-[10px] uppercase tracking-widest mt-6">
                            Last updated: March 2026
                        </p>
                    </div>
                </div>
            </section>

            {/* Sections */}
            <section className="pb-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto space-y-8">
                        {sections.map((section, i) => (
                            <div
                                key={i}
                                className="bg-zinc-50 dark:bg-zinc-900/60 rounded-3xl p-8 md:p-10 border border-zinc-100 dark:border-zinc-800/50"
                            >
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-2xl bg-[#fb5607]/10 text-[#fb5607] flex items-center justify-center">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-lg md:text-xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
                                        {section.title}
                                    </h2>
                                </div>
                                <ul className="space-y-4">
                                    {section.content.map((item, j) => (
                                        <li key={j} className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            <span className="text-[#fb5607] font-black mt-1 shrink-0">→</span>
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
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
