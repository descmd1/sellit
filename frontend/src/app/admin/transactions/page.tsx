'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Transaction, Pagination } from '@/types';
import { formatDate, formatPrice, STATUS_COLORS } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Truck, DollarSign, Loader2 } from 'lucide-react';
import Image from 'next/image';

const STATUSES = ['', 'pending', 'paid', 'delivered', 'completed', 'failed'];

export default function AdminTransactionsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery<{ transactions: Transaction[]; pagination: Pagination }>({
    queryKey: ['admin-transactions', statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/admin/transactions?${params}`);
      return data;
    },
  });

  const deliverMutation = useMutation({
    mutationFn: async (txId: string) => {
      const { data } = await api.put(`/admin/transactions/${txId}/deliver`);
      return data;
    },
    onSuccess: () => { toast.success('Marked as delivered'); qc.invalidateQueries({ queryKey: ['admin-transactions'] }); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const releaseMutation = useMutation({
    mutationFn: async (txId: string) => {
      const { data } = await api.put(`/admin/transactions/${txId}/release-funds`);
      return data;
    },
    onSuccess: () => { toast.success('Funds released to seller!'); qc.invalidateQueries({ queryKey: ['admin-transactions'] }); },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Transactions</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>
            {s === '' ? 'All' : s}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-28 animate-pulse bg-gray-100" />)
        ) : data?.transactions.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No transactions found</div>
        ) : data?.transactions.map((tx) => {
          const item = typeof tx.item === 'object' ? tx.item : null;
          const buyer = typeof tx.buyer === 'object' ? tx.buyer : null;
          const seller = typeof tx.seller === 'object' ? tx.seller : null;

          return (
            <div key={tx._id} className="card p-5">
              <div className="flex flex-wrap gap-4 items-start">
                {/* Item thumbnail */}
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {item && typeof item === 'object' && item.images?.[0] ? (
                    <Image src={item.images[0].url} alt="" fill className="object-cover" />
                  ) : <span className="flex items-center justify-center h-full text-2xl">📦</span>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900">{item && typeof item === 'object' ? item.title : 'Item'}</p>
                    <span className={`badge ${STATUS_COLORS[tx.status]}`}>{tx.status}</span>
                    <span className={`badge ${STATUS_COLORS[tx.paymentStatus]}`}>Payment: {tx.paymentStatus}</span>
                    <span className={`badge ${STATUS_COLORS[tx.deliveryStatus] || 'bg-gray-100 text-gray-600'}`}>Delivery: {tx.deliveryStatus}</span>
                    {tx.sellerPaid && <span className="badge bg-green-100 text-green-700">Seller Paid</span>}
                  </div>

                  <div className="flex flex-wrap gap-6 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Buyer</p>
                      <p className="font-medium">{buyer?.name} · {buyer?.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Seller</p>
                      <p className="font-medium">{seller?.name} · {seller?.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Amount</p>
                      <p className="font-bold text-primary-700">{formatPrice(tx.totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Platform Fee</p>
                      <p className="font-medium text-green-700">{formatPrice(tx.platformFee)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Seller Gets</p>
                      <p className="font-medium">{formatPrice(tx.itemPrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Date</p>
                      <p className="text-gray-500">{formatDate(tx.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {tx.paymentStatus === 'success' && tx.deliveryStatus === 'pending' && (
                    <button
                      onClick={() => deliverMutation.mutate(tx._id)}
                      disabled={deliverMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition flex items-center gap-1 disabled:opacity-50"
                    >
                      {deliverMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Truck className="w-3 h-3" />}
                      Mark Delivered
                    </button>
                  )}
                  {tx.deliveryStatus === 'delivered' && !tx.sellerPaid && (
                    <button
                      onClick={() => releaseMutation.mutate(tx._id)}
                      disabled={releaseMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition flex items-center gap-1 disabled:opacity-50"
                    >
                      {releaseMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <DollarSign className="w-3 h-3" />}
                      Release Funds
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
