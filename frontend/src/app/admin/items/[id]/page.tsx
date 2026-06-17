'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import api from '@/lib/api';
import { Item } from '@/types';
import { formatPrice, formatDate, STATUS_COLORS } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ArrowLeft, CheckCircle, XCircle, DollarSign, Loader2, MapPin, Phone, User } from 'lucide-react';

export default function AdminReviewItemPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [finalPrice, setFinalPrice] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeImage, setActiveImage] = useState(0);

  const { data, isLoading } = useQuery<{ item: Item }>({
    queryKey: ['admin-item', id],
    queryFn: async () => {
      const { data } = await api.get(`/items/${id}`);
      return data;
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (payload: { status: string; finalPrice?: string; adminNotes?: string; rejectionReason?: string }) => {
      const { data } = await api.put(`/admin/items/${id}/review`, payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      qc.invalidateQueries({ queryKey: ['admin-items'] });
      router.push('/admin/items');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Action failed'),
  });

  const handleApprove = () => {
    if (!finalPrice) { toast.error('Please enter the final price'); return; }
    reviewMutation.mutate({ status: 'approved', finalPrice, adminNotes });
  };

  const handleReject = () => {
    if (!rejectionReason) { toast.error('Please provide a rejection reason'); return; }
    reviewMutation.mutate({ status: 'rejected', rejectionReason, adminNotes });
  };

  const handleUnderReview = () => {
    reviewMutation.mutate({ status: 'under_review', adminNotes });
  };

  if (isLoading) return (
    <div className="max-w-4xl space-y-4">
      <div className="h-80 bg-gray-100 animate-pulse rounded-xl" />
    </div>
  );

  const item = data?.item;
  if (!item) return <div className="text-gray-500">Item not found</div>;

  const seller = typeof item.seller === 'object' ? item.seller : null;

  return (
    <div className="max-w-4xl">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Items
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: Item details */}
        <div>
          <div className="relative h-72 bg-gray-100 rounded-xl overflow-hidden">
            {item.images?.[activeImage] ? (
              <Image src={item.images[activeImage].url} alt={item.title} fill className="object-cover" />
            ) : <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>}
          </div>
          {item.images?.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto">
              {item.images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 ${i === activeImage ? 'border-primary-500' : 'border-transparent'}`}>
                  <Image src={img.url} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className={`badge ${STATUS_COLORS[item.status]}`}>{item.status.replace('_', ' ')}</span>
              <span className="badge bg-gray-100 text-gray-700">{item.condition}</span>
              <span className="badge bg-gray-100 text-gray-700">{item.category}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{item.title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
            <p className="flex items-center gap-1 text-sm text-gray-500"><MapPin className="w-4 h-4" />{item.location}</p>
            {item.expectedPrice && <p className="text-sm text-gray-500">Expected price: <strong>{formatPrice(item.expectedPrice)}</strong></p>}
            <p className="text-xs text-gray-400">Submitted: {formatDate(item.createdAt)}</p>
          </div>

          {/* Seller info */}
          {seller && (
            <div className="card p-4 mt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Seller Information</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-700">
                  {seller.name[0]}
                </div>
                <div>
                  <p className="font-medium text-gray-900 flex items-center gap-1"><User className="w-3 h-3" />{seller.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{seller.phone}</p>
                  {seller.address && <p className="text-xs text-gray-400">{seller.address}</p>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Review panel */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Admin Review</h3>

            <div className="mb-4">
              <label className="label">Admin Notes (Internal)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                className="input resize-none text-sm"
                placeholder="Notes about your physical visit..."
              />
            </div>

            {/* Approve */}
            <div className="border rounded-lg p-4 mb-3">
              <h4 className="font-medium text-green-700 flex items-center gap-1 mb-3"><CheckCircle className="w-4 h-4" /> Approve & Publish</h4>
              <label className="label text-xs">Final Selling Price (₦) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                  className="input pl-9 text-sm"
                  placeholder="e.g., 80000"
                />
              </div>
              {finalPrice && (
                <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                  <p>Item price: <strong>{formatPrice(Number(finalPrice))}</strong></p>
                  <p>Platform fee (10%): <strong>{formatPrice(Math.round(Number(finalPrice) * 0.1))}</strong></p>
                  <p className="text-primary-700 font-semibold">Buyer pays: {formatPrice(Number(finalPrice) + Math.round(Number(finalPrice) * 0.1))}</p>
                </div>
              )}
              <button
                onClick={handleApprove}
                disabled={reviewMutation.isPending}
                className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {reviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Approve & Publish
              </button>
            </div>

            {/* Mark Under Review */}
            <button
              onClick={handleUnderReview}
              disabled={reviewMutation.isPending || item.status === 'under_review'}
              className="w-full mb-3 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded-lg text-sm transition disabled:opacity-50"
            >
              Mark as Under Review (Visiting Seller)
            </button>

            {/* Reject */}
            <div className="border border-red-100 rounded-lg p-4">
              <h4 className="font-medium text-red-600 flex items-center gap-1 mb-3"><XCircle className="w-4 h-4" /> Reject Listing</h4>
              <label className="label text-xs">Rejection Reason *</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
                className="input resize-none text-sm"
                placeholder="Explain why this item is being rejected..."
              />
              <button
                onClick={handleReject}
                disabled={reviewMutation.isPending}
                className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {reviewMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Reject Item
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
