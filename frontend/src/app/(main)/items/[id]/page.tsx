'use client';
import { useQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import { Item } from '@/types';
import { formatPrice, formatDate, STATUS_COLORS } from '@/lib/utils';
import { MapPin, Calendar, Eye, ArrowLeft, Package } from 'lucide-react';
import PaystackButton from '@/components/PaystackButton';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);

  const { data, isLoading } = useQuery<{ item: Item }>({
    queryKey: ['item', id],
    queryFn: async () => {
      const { data } = await api.get(`/items/${id}`);
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-96 bg-gray-200 rounded-xl" />
          <div className="h-8 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    );
  }

  const item = data?.item;
  if (!item) return <div className="text-center py-20 text-gray-500">Item not found</div>;

  const seller = typeof item.seller === 'object' ? item.seller : null;
  const isOwner = user && seller?._id === user._id;
  const canBuy = user && !isOwner && item.status === 'approved' && item.isPublished;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Images */}
        <div>
          <div className="relative h-80 bg-gray-100 rounded-xl overflow-hidden">
            {item.images?.[activeImage] ? (
              <Image src={item.images[activeImage].url} alt={item.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-6xl">📦</div>
            )}
          </div>
          {item.images?.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {item.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${i === activeImage ? 'border-primary-500' : 'border-transparent'}`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">{item.category} · {item.condition}</p>
              <h1 className="text-2xl font-bold text-gray-900 mt-1">{item.title}</h1>
            </div>
            <span className={`badge ${STATUS_COLORS[item.status]}`}>{item.status.replace('_', ' ')}</span>
          </div>

          <p className="text-gray-600 mt-4 leading-relaxed">{item.description}</p>

          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {item.location}</span>
            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(item.createdAt)}</span>
            <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {item.views} views</span>
          </div>

          {/* Pricing */}
          {item.finalPrice ? (
            <div className="card p-4 mt-6 bg-primary-50 border-primary-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Item Price</span>
                <span className="font-semibold">{formatPrice(item.finalPrice)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-gray-500 text-sm">Platform Fee (10%)</span>
                <span className="text-sm text-gray-500">{formatPrice(item.platformFee!)}</span>
              </div>
              <div className="border-t border-primary-200 mt-3 pt-3 flex justify-between">
                <span className="font-bold text-gray-900">Total</span>
                <span className="font-bold text-xl text-primary-700">{formatPrice(item.totalAmount!)}</span>
              </div>
            </div>
          ) : item.expectedPrice ? (
            <div className="mt-4 text-gray-500">
              Expected price: <strong>{formatPrice(item.expectedPrice)}</strong> (pending admin review)
            </div>
          ) : null}

          {/* Seller info */}
          {seller && (
            <div className="card p-4 mt-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                {seller.name[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{seller.name}</p>
                <p className="text-sm text-gray-500">{seller.phone}</p>
              </div>
            </div>
          )}

          {/* Buy button */}
          <div className="mt-6">
            {canBuy ? (
              <PaystackButton itemId={item._id} totalAmount={item.totalAmount!} />
            ) : !user ? (
              <a href="/login" className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-base">
                Login to Purchase
              </a>
            ) : isOwner ? (
              <div className="text-center py-3 text-gray-400 text-sm border rounded-lg">This is your listing</div>
            ) : item.status === 'sold' ? (
              <div className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg text-center font-medium">
                <Package className="inline w-4 h-4 mr-2" />Item Sold
              </div>
            ) : (
              <div className="w-full py-3 bg-yellow-50 text-yellow-700 rounded-lg text-center text-sm border border-yellow-100">
                This item is pending admin verification
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
