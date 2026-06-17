'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Transaction } from '@/types';
import { formatPrice, formatDate, STATUS_COLORS } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function PurchaseHistoryPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  const { data, isLoading } = useQuery<{ transactions: Transaction[] }>({
    queryKey: ['my-purchases'],
    queryFn: async () => {
      const { data } = await api.get('/payments/my-purchases');
      return data;
    },
    enabled: !!user,
  });

  if (loading || isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card h-24 animate-pulse bg-gray-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Purchase History</h1>

      {!data?.transactions.length ? (
        <div className="text-center py-20 text-gray-400">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No purchases yet</p>
          <Link href="/" className="text-primary-600 text-sm mt-2 inline-block hover:underline">
            Browse available items
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.transactions.map((tx) => {
            const item = typeof tx.item === 'object' ? tx.item : null;
            return (
              <div key={tx._id} className="card p-4 flex gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {item && typeof item === 'object' && item.images?.[0] ? (
                    <Image src={item.images[0].url} alt="" fill className="object-cover" />
                  ) : <span className="flex items-center justify-center h-full text-2xl">📦</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-gray-900 truncate">
                        {item && typeof item === 'object' ? item.title : 'Item'}
                      </p>
                      <p className="text-sm text-gray-500">{formatDate(tx.createdAt)}</p>
                    </div>
                    <span className={`badge flex-shrink-0 ${STATUS_COLORS[tx.status]}`}>{tx.status}</span>
                  </div>
                  <div className="flex gap-6 mt-2 text-sm">
                    <div>
                      <p className="text-gray-500">Item Price</p>
                      <p className="font-medium">{formatPrice(tx.itemPrice)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Platform Fee</p>
                      <p className="font-medium">{formatPrice(tx.platformFee)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Paid</p>
                      <p className="font-bold text-primary-700">{formatPrice(tx.totalAmount)}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2">
                    <span className={`badge text-xs ${STATUS_COLORS[tx.paymentStatus]}`}>
                      Payment: {tx.paymentStatus}
                    </span>
                    <span className={`badge text-xs ${STATUS_COLORS[tx.deliveryStatus] || 'bg-gray-100 text-gray-600'}`}>
                      Delivery: {tx.deliveryStatus}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
