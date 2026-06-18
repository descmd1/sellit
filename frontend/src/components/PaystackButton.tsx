'use client';
import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { ShoppingCart, Loader2 } from 'lucide-react';

interface PaystackButtonProps {
  itemId: string;
  disabled?: boolean;
}

export default function PaystackButton({ itemId, disabled }: PaystackButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/payments/initialize', { itemId });
      window.location.href = data.authorization_url;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initialize payment');
      setLoading(false);
    }
  };

  return (
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
  );
}
