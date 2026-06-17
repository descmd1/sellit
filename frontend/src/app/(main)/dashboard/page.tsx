'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Item, Pagination } from '@/types';
import { formatDate, formatPrice, STATUS_COLORS } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ItemCard from '@/components/ItemCard';
import Link from 'next/link';
import { Plus, Package, TrendingUp, Clock } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export default function SellerDashboard() {
  const { user, loading, isSeller } = useAuth();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user && !isSeller) router.push('/');
  }, [user, loading, isSeller, router]);

  const { data, isLoading } = useQuery<{ items: Item[]; pagination: Pagination }>({
    queryKey: ['my-items', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const { data } = await api.get(`/items/my-items?${params}`);
      return data;
    },
    enabled: !!user,
  });

  const { data: salesData } = useQuery<{ transactions: any[] }>({
    queryKey: ['my-sales'],
    queryFn: async () => {
      const { data } = await api.get('/payments/my-sales');
      return data;
    },
    enabled: !!user,
  });

  const items = data?.items || [];
  const sold = items.filter((i) => i.status === 'sold').length;
  const pending = items.filter((i) => i.status === 'pending').length;
  const approved = items.filter((i) => i.status === 'approved').length;
  const totalEarnings = salesData?.transactions.filter(t => t.sellerPaid).reduce((sum: number, t: any) => sum + t.itemPrice, 0) || 0;

  const STATUSES = ['', 'pending', 'under_review', 'approved', 'rejected', 'sold'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.name}</p>
        </div>
        <Link href="/dashboard/upload" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> List Item
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Listings', value: items.length, icon: <Package className="w-5 h-5 text-primary-600" /> },
          { label: 'Approved', value: approved, icon: <TrendingUp className="w-5 h-5 text-green-600" /> },
          { label: 'Pending', value: pending, icon: <Clock className="w-5 h-5 text-yellow-500" /> },
          { label: 'Total Earnings', value: formatPrice(totalEarnings), icon: <span className="text-lg">₦</span> },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{stat.label}</p>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
              statusFilter === s ? 'bg-primary-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s === '' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card h-64 animate-pulse bg-gray-100" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No items yet</p>
          <Link href="/dashboard/upload" className="text-primary-600 text-sm mt-2 inline-block hover:underline">
            List your first item
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => <ItemCard key={item._id} item={item} showStatus />)}
        </div>
      )}
    </div>
  );
}
