'use client';
import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Loader2 } from 'lucide-react';

interface PaystackButtonProps {
  itemId: string;
  totalAmount: number;
  disabled?: boolean;
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        onClose: () => void;
        callback: (response: { reference: string }) => void;
      }) => { openIframe: () => void };
    };
  }
}

export default function PaystackButton({ itemId, totalAmount, disabled }: PaystackButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBuy = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/payments/initialize', { itemId });

      // Open Paystack modal
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: '', // Already set server-side
        amount: data.amount * 100,
        ref: data.reference,
        onClose: () => {
          toast.error('Payment cancelled');
          setLoading(false);
        },
        callback: async (response) => {
          // Redirect to verification page
          router.push(`/payment/verify?reference=${response.reference}`);
        },
      });

      handler.openIframe();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  return (
    <>
      <script src="https://js.paystack.co/v1/inline.js" async />
      <button
        onClick={handleBuy}
        disabled={disabled || loading}
        className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-base"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <ShoppingCart className="w-5 h-5" />
        )}
        {loading ? 'Processing...' : 'Buy Now'}
      </button>
    </>
  );
}
