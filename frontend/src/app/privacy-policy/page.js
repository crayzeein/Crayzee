'use client';
import Navbar from '@/components/layout/Navbar';
import Link from 'next/link';
import { Shield, Lock, Eye, Database, UserCheck, Mail, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
    const sections = [
        {
            icon: <Database size={18} />,
            title: 'Information We Collect',
            content: [
                'When you create an account, we collect your name, email address, and password (stored securely using encryption).',
                'When you place an order, we collect your shipping address, phone number, and payment-related details.',
                'We automatically collect basic usage data such as pages visited, browser type, and device information to improve your experience.'
            ]
        },
        {
            icon: <Eye size={18} />,
            title: 'How We Use Your Information',
            content: [
                'To process and deliver your orders efficiently.',
                'To manage your account and provide customer support.',
                'To send you order updates, promotional offers, and new drop alerts (you can opt out anytime).',
                'To improve our website, products, and overall shopping experience.'
            ]
        },
        {
            icon: <Lock size={18} />,
            title: 'Data Security',
            content: [
                'We use industry-standard security measures including SSL encryption and secure password hashing to protect your personal data.',
                'Your payment information is processed through secure third-party payment gateways. We do not store your card details on our servers.',
                'Access to personal data is restricted to authorized personnel only.'
            ]
        },
        {
            icon: <UserCheck size={18} />,
            title: 'Your Rights',
            content: [
                'You can access, update, or delete your personal information at any time through your account settings.',
                'You can request a copy of your data or ask us to stop processing it by contacting us.',
                'You can unsubscribe from marketing emails at any time using the link provided in the email.'
            ]
        },
        {
            icon: <Shield size={18} />,
            title: 'Cookies',
            content: [
                'We use cookies and similar technologies to keep you logged in, remember your preferences, and analyze site traffic.',
                'You can manage cookie preferences through your browser settings.'
            ]
        },
        {
            icon: <Mail size={18} />,
            title: 'Contact Us',
            content: [
                'If you have any questions about this Privacy Policy, please contact us at crayzee.in@gmail.com.',
                'We may update this policy from time to time. Any changes will be posted on this page.'
            ]
        }
    ];

    return (
        <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <Navbar />

            <div className="w-full max-w-[1920px] mx-auto pt-24 pb-20" style={{ paddingLeft: 'clamp(16px, 4vw, 64px)', paddingRight: 'clamp(16px, 4vw, 64px)' }}>
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white">Privacy Policy</h1>
                        <p className="text-zinc-400 text-sm mt-1">
                            Your privacy matters. Here's how we handle your information.
                        </p>
                        <p className="text-zinc-300 dark:text-zinc-600 text-[11px] mt-2">Last updated: March 2026</p>
                    </div>

                    {/* Sections */}
                    <div className="space-y-4">
                        {sections.map((section, i) => (
                            <div key={i} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 sm:p-6 border border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-2.5 mb-4">
                                    <div className="w-9 h-9 rounded-xl bg-[#fb5607]/10 text-[#fb5607] flex items-center justify-center">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                                        {section.title}
                                    </h2>
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
