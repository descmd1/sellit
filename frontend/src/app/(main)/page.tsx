'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import ItemCard from '@/components/ItemCard';
import { Item, Pagination } from '@/types';
import { CATEGORIES } from '@/lib/utils';
import { Search, SlidersHorizontal, ShieldCheck, Truck, Star } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user, isSeller } = useAuth();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<{ items: Item[]; pagination: Pagination }>({
    queryKey: ['items', { search, category, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      params.set('page', String(page));
      const { data } = await api.get(`/items?${params}`);
      return data;
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Buy & Sell with <span className="text-primary-200">Confidence</span>
          </h1>
          <p className="text-primary-100 text-lg mb-8">
            Every item is physically inspected and verified by our team before it goes live.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!user && (
              <>
                <Link href="/register" className="bg-white text-primary-700 font-bold px-6 py-3 rounded-lg hover:bg-primary-50 transition">
                  Start Selling
                </Link>
                <Link href="/register" className="border-2 border-white text-white font-bold px-6 py-3 rounded-lg hover:bg-white/10 transition">
                  Browse Items
                </Link>
              </>
            )}
            {isSeller && (
              <Link href="/dashboard/upload" className="bg-white text-primary-700 font-bold px-6 py-3 rounded-lg hover:bg-primary-50 transition">
                + List an Item
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: <ShieldCheck className="w-8 h-8 text-primary-600 mx-auto mb-2" />, title: 'Verified Items', desc: 'Admin inspects every item in person' },
            { icon: <Truck className="w-8 h-8 text-primary-600 mx-auto mb-2" />, title: 'Safe Delivery', desc: 'Admin coordinates handover' },
            { icon: <Star className="w-8 h-8 text-primary-600 mx-auto mb-2" />, title: 'Secure Payment', desc: 'Funds held until delivery confirmed' },
          ].map((f) => (
            <div key={f.title}>
              {f.icon}
              <h3 className="font-semibold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Items grid */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input pl-9"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); setPage(1); }}
              className="input pl-9 pr-8 w-full sm:w-48"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="card h-72 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg font-medium">No items found</p>
            <p className="text-sm">Try a different search or category</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{data?.pagination.total} items available</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data?.items.map((item) => <ItemCard key={item._id} item={item} />)}
            </div>

            {data && data.pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium ${p === page ? 'bg-primary-600 text-white' : 'bg-white border text-gray-700 hover:bg-gray-50'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
