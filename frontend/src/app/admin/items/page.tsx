'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Item, Pagination } from '@/types';
import { formatDate, formatPrice, STATUS_COLORS } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, MapPin } from 'lucide-react';

const STATUSES = ['', 'pending', 'under_review', 'approved', 'rejected', 'sold'];

export default function AdminItemsPage() {
  const [statusFilter, setStatusFilter] = useState('pending');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<{ items: Item[]; pagination: Pagination }>({
    queryKey: ['admin-items', statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/admin/items?${params}`);
      return data;
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Item Management</h1>

      {/* Status filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s === '' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-20 animate-pulse bg-gray-100" />)}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {['Item', 'Seller', 'Location', 'Price', 'Status', 'Date', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.items.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-400">No items found</td></tr>
              ) : data?.items.map((item) => {
                const seller = typeof item.seller === 'object' ? item.seller : null;
                return (
                  <tr key={item._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {item.images?.[0] ? (
                            <Image src={item.images[0].url} alt="" fill className="object-cover" />
                          ) : <span className="flex items-center justify-center h-full">📦</span>}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1 max-w-32">{item.title}</p>
                          <p className="text-xs text-gray-400">{item.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{seller?.name}</p>
                      <p className="text-xs text-gray-400">{seller?.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.location}</span>
                    </td>
                    <td className="px-4 py-3">
                      {item.finalPrice ? (
                        <span className="font-medium text-green-700">{formatPrice(item.finalPrice)}</span>
                      ) : item.expectedPrice ? (
                        <span className="text-gray-400">~{formatPrice(item.expectedPrice)}</span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_COLORS[item.status]}`}>{item.status.replace('_', ' ')}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{formatDate(item.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/items/${item._id}`} className="btn-secondary text-xs flex items-center gap-1 w-fit">
                        <Eye className="w-3 h-3" /> Review
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {data && data.pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${p === page ? 'bg-primary-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
