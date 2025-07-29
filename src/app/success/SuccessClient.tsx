'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { CheckCircle } from 'lucide-react';

export default function SuccessClient() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCart();

    const [hasConfirmed, setHasConfirmed] = useState(false);

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        if (!sessionId || hasConfirmed) return;

        const confirmAndSaveOrder = async () => {
            try {
                const res = await fetch('/api/confirm-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ sessionId }),
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Server error: ${res.status}\n${text}`);
                }

                const data = await res.json();
                console.log('✅ Payment confirmed and order saved:', data);

                clearCart();
                setHasConfirmed(true);
            } catch (err) {
                console.error('🔥 Failed to confirm payment:', err);
            }
        };

        confirmAndSaveOrder();
    }, [searchParams, clearCart, hasConfirmed]);

    return (
        <div className="min-h-screen flex items-center justify-center px-4 text-center">
            <div className="max-w-md space-y-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <h1 className="text-3xl font-bold">Payment Successful</h1>
                <p className="text-gray-600">
                    Thank you for your purchase! Your order has been confirmed.
                </p>
                <button
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                    onClick={() => router.push('/store')}
                >
                    Continue Shopping
                </button>
            </div>
        </div>
    );
}
