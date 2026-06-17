'use client';
import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '@/lib/api';
import { CATEGORIES, CONDITIONS } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Upload, X, ArrowLeft, Loader2 } from 'lucide-react';
import Image from 'next/image';

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  category: z.string().min(1, 'Category is required'),
  condition: z.string().min(1, 'Condition is required'),
  location: z.string().min(3, 'Location is required'),
  expectedPrice: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function UploadItemPage() {
  const { user, loading, isSeller } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
    if (!loading && user && !isSeller) router.push('/');
  }, [user, loading, isSeller, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (files.length + selected.length > 10) {
      toast.error('Maximum 10 files allowed');
      return;
    }
    setFiles((prev) => [...prev, ...selected]);
    selected.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    if (files.length === 0) {
      toast.error('Please add at least one image');
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => { if (v) formData.append(k, v); });
      files.forEach((file) => formData.append('media', file));

      await api.post('/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Item submitted for review! Admin will contact you soon.');
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit item');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="card p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">List an Item</h1>
        <p className="text-sm text-gray-500 mb-6">
          Our admin will physically inspect your item and set a fair price before publishing.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Media upload */}
          <div>
            <label className="label">Photos & Videos *</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-primary-400 transition"
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Click to upload images/videos</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP, MP4, MOV • Max 10 files • 50MB each</p>
            </div>
            <input ref={fileRef} type="file" multiple accept="image/*,video/*" onChange={handleFileChange} className="hidden" />

            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative h-20 rounded-lg overflow-hidden bg-gray-100">
                    {files[i]?.type.startsWith('image/') ? (
                      <Image src={src} alt="" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">🎥</div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="label">Item Title *</label>
            <input {...register('title')} className="input" placeholder="e.g., Samsung 65-inch Smart TV" />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea {...register('description')} rows={4} className="input resize-none" placeholder="Describe the item's condition, features, and any defects..." />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category *</label>
              <select {...register('category')} className="input">
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="label">Condition *</label>
              <select {...register('condition')} className="input">
                <option value="">Select condition</option>
                {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
              {errors.condition && <p className="text-red-500 text-xs mt-1">{errors.condition.message}</p>}
            </div>
          </div>

          <div>
            <label className="label">Location *</label>
            <input {...register('location')} className="input" placeholder="e.g., Lagos, Ikeja" />
            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>}
          </div>

          <div>
            <label className="label">Your Expected Price (₦) <span className="text-gray-400 font-normal">– Optional</span></label>
            <input {...register('expectedPrice')} type="number" className="input" placeholder="e.g., 50000" />
            <p className="text-xs text-gray-400 mt-1">Admin will set the final price after inspection.</p>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : 'Submit for Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
