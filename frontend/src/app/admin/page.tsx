'use client';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Package, Users, CreditCard, TrendingUp } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';

interface Stats {
  items: { total: number; pending: number; approved: number; sold: number };
  users: { total: number };
  transactions: { total: number; completed: number };
  revenue: number;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data;
    },
    refetchInterval: 30000,
  });

  const cards = stats
    ? [
        { label: 'Total Items', value: stats.items.total, sub: `${stats.items.pending} pending review`, icon: <Package className="w-6 h-6 text-blue-600" />, color: 'bg-blue-50', href: '/admin/items' },
        { label: 'Total Users', value: stats.users.total, sub: 'Buyers & Sellers', icon: <Users className="w-6 h-6 text-purple-600" />, color: 'bg-purple-50', href: null },
        { label: 'Transactions', value: stats.transactions.total, sub: `${stats.transactions.completed} completed`, icon: <CreditCard className="w-6 h-6 text-green-600" />, color: 'bg-green-50', href: '/admin/transactions' },
        { label: 'Platform Revenue', value: formatPrice(stats.revenue), sub: '10% platform fee', icon: <TrendingUp className="w-6 h-6 text-primary-600" />, color: 'bg-primary-50', href: null },
      ]
    : [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
      <p className="text-gray-500 mb-8">Platform overview</p>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-28 animate-pulse bg-gray-100" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {cards.map((card) => (
            <div key={card.label} className={`card p-5 ${card.href ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
              onClick={() => card.href && (window.location.href = card.href)}>
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center mb-3`}>
                {card.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-sm font-medium text-gray-700 mt-0.5">{card.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{card.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Quick action */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Pending Reviews</h3>
          <p className="text-sm text-gray-500 mb-4">Items waiting for physical inspection and price setting</p>
          <Link href="/admin/items?status=pending" className="btn-primary text-sm">Review Items</Link>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-gray-900 mb-1">Awaiting Fund Release</h3>
          <p className="text-sm text-gray-500 mb-4">Transactions where delivery is confirmed but seller hasn't been paid</p>
          <Link href="/admin/transactions?status=paid" className="btn-primary text-sm">Manage Payouts</Link>
        </div>
      </div>
    </div>
  );
}
