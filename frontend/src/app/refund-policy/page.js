'use client';
import LegalPage from '@/components/layout/LegalPage';
import { RotateCcw, XCircle, Banknote, PackageX, Mail } from 'lucide-react';

export default function RefundPolicyPage() {
    const sections = [
        {
            icon: <RotateCcw size={18} />,
            title: 'Returns & Exchanges',
            content: [
                'You can request a return or exchange within 7 days of delivery.',
                'The item must be unused, unwashed, and returned with all original tags intact.',
                'Size exchanges are free once per order, subject to stock availability.',
                'To start a return, email crayzee.in@gmail.com with your order ID and a photo of the item.'
            ]
        },
        {
            icon: <PackageX size={18} />,
            title: 'Items We Cannot Accept',
            content: [
                'Products that have been worn, washed, altered, or damaged after delivery.',
                'Items returned without original tags or packaging.',
                'Customised or personalised products, unless they arrived damaged or defective.',
                'Requests raised more than 7 days after delivery.'
            ]
        },
        {
            icon: <XCircle size={18} />,
            title: 'Order Cancellation',
            content: [
                'You can cancel your order free of charge any time before it is marked as Shipped.',
                'Once shipped, an order cannot be cancelled — you may raise a return after delivery instead.',
                'We may cancel an order ourselves if the item is out of stock or the delivery address is unserviceable.',
                'To cancel, contact us at crayzee.in@gmail.com with your order ID.'
            ]
        },
        {
            icon: <Banknote size={18} />,
            title: 'Refund Process',
            content: [
                'Approved refunds are processed within 5–7 business days after we receive and inspect the returned item.',
                'Online payments are refunded to the original payment method used at checkout.',
                'For Cash on Delivery orders, refunds are sent to your bank account via UPI or NEFT.',
                'Shipping charges are non-refundable unless the item was damaged, defective, or incorrect.',
                'If your order was cancelled before shipping, the full amount including shipping is refunded.'
            ]
        },
        {
            icon: <Mail size={18} />,
            title: 'Damaged or Wrong Items',
            content: [
                'If you receive a damaged or incorrect item, contact us within 48 hours of delivery.',
                'Please share an unboxing photo or video — it helps us resolve your case faster.',
                'We will arrange a free replacement or a full refund, including shipping charges.'
            ]
        }
    ];

    return (
        <LegalPage
            title="Refund & Cancellation Policy"
            subtitle="How returns, cancellations and refunds work at Crayzee."
            updated="September 2026"
            sections={sections}
        />
    );
}
