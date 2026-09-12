'use client';
import LegalPage from '@/components/layout/LegalPage';
import { Truck, Clock, MapPin, IndianRupee, Search } from 'lucide-react';

export default function ShippingPolicyPage() {
    const sections = [
        {
            icon: <Clock size={18} />,
            title: 'Order Processing',
            content: [
                'Orders are packed and dispatched within 1–2 business days of confirmation.',
                'Orders placed on Sundays or public holidays are processed on the next working day.',
                'You will receive a confirmation email as soon as your order is placed.'
            ]
        },
        {
            icon: <Truck size={18} />,
            title: 'Delivery Timelines',
            content: [
                'Metro cities: 3–5 business days after dispatch.',
                'Other cities and towns: 5–8 business days after dispatch.',
                'Remote or rural pin codes: up to 10 business days.',
                'These timelines are estimates. Delays may occur due to weather, festivals, or courier issues.'
            ]
        },
        {
            icon: <IndianRupee size={18} />,
            title: 'Shipping Charges',
            content: [
                'Free shipping on all prepaid orders above ₹1,500.',
                'A flat shipping fee of ₹99 applies to orders below ₹1,500.',
                'Cash on Delivery is available on select pin codes and may carry an additional handling fee.'
            ]
        },
        {
            icon: <Search size={18} />,
            title: 'Tracking Your Order',
            content: [
                'Once dispatched, you will receive an email with your tracking ID and courier name.',
                'You can also track the live status of every order under My Orders on our website.',
                'Tracking details may take up to 24 hours to become active on the courier website.'
            ]
        },
        {
            icon: <MapPin size={18} />,
            title: 'Delivery Address & Failed Attempts',
            content: [
                'We currently ship across India only. International shipping is not available yet.',
                'Please provide a complete address and a valid 10-digit mobile number — couriers need both to deliver.',
                'Couriers attempt delivery up to three times before returning the parcel to us.',
                'If a parcel returns due to an incorrect address or repeated unavailability, shipping charges are non-refundable.',
                'For any delivery issue, write to crayzee.in@gmail.com with your order ID.'
            ]
        }
    ];

    return (
        <LegalPage
            title="Shipping Policy"
            subtitle="Dispatch timelines, delivery estimates and tracking."
            updated="September 2026"
            sections={sections}
        />
    );
}
