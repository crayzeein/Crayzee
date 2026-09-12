'use client';
import LegalPage from '@/components/layout/LegalPage';
import { FileText, ShoppingBag, CreditCard, Ban, Scale, Mail } from 'lucide-react';

export default function TermsPage() {
    const sections = [
        {
            icon: <FileText size={18} />,
            title: 'Acceptance of Terms',
            content: [
                'By accessing or placing an order on crayzee.in, you agree to be bound by these Terms & Conditions.',
                'If you do not agree with any part of these terms, please do not use our website.',
                'We may update these terms at any time. Continued use of the site means you accept the updated terms.'
            ]
        },
        {
            icon: <ShoppingBag size={18} />,
            title: 'Products & Orders',
            content: [
                'All products are subject to availability. We reserve the right to cancel any order if the item goes out of stock.',
                'Product colours may vary slightly from the images shown due to differences in screen display and lighting.',
                'We reserve the right to refuse or cancel any order placed with incorrect pricing or suspected fraudulent intent.',
                'Placing an order does not guarantee acceptance. An order is confirmed only after you receive our confirmation email.'
            ]
        },
        {
            icon: <CreditCard size={18} />,
            title: 'Pricing & Payment',
            content: [
                'All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes unless stated otherwise.',
                'We accept online payments through Razorpay (UPI, cards, net banking and wallets) and Cash on Delivery.',
                'Shipping is free on orders above ₹1,500. A flat shipping fee of ₹99 applies to orders below that.',
                'We do not store your card or banking details on our servers. All payments are handled by our payment gateway.'
            ]
        },
        {
            icon: <Ban size={18} />,
            title: 'Prohibited Use',
            content: [
                'You may not use our website for any unlawful purpose or to attempt unauthorised access to our systems.',
                'Reselling our products commercially without written permission is not allowed.',
                'Copying our product images, designs or website content without permission is prohibited.',
                'Accounts found abusing promotional offers or placing repeated fake orders may be blocked.'
            ]
        },
        {
            icon: <Scale size={18} />,
            title: 'Limitation of Liability',
            content: [
                'Our liability for any order is limited to the total amount paid for that order.',
                'We are not liable for delays caused by courier partners, natural events, or circumstances beyond our control.',
                'These terms are governed by the laws of India, and any disputes fall under the jurisdiction of courts in India.'
            ]
        },
        {
            icon: <Mail size={18} />,
            title: 'Contact Us',
            content: [
                'For any questions regarding these terms, write to us at crayzee.in@gmail.com.',
                'We aim to respond to all queries within 24–48 working hours.'
            ]
        }
    ];

    return (
        <LegalPage
            title="Terms & Conditions"
            subtitle="The rules that apply when you shop with us."
            updated="September 2026"
            sections={sections}
        />
    );
}
