'use client';
import LegalPage from '@/components/layout/LegalPage';
import { Shield, Lock, Eye, Database, UserCheck, Mail } from 'lucide-react';

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
        <LegalPage
            title="Privacy Policy"
            subtitle="Your privacy matters. Here's how we handle your information."
            updated="September 2026"
            sections={sections}
        />
    );
}
