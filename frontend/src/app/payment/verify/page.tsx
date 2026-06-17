'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function VerifyPaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference');
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!reference) { setStatus('failed'); setMessage('No payment reference found'); return; }

    api.get(`/payments/verify?reference=${reference}`)
      .then(({ data }) => {
        if (data.success) {
          setStatus('success');
          setMessage('Payment verified! The admin will coordinate delivery.');
        } else {
          setStatus('failed');
          setMessage(data.message || 'Payment was not successful');
        }
      })
      .catch((err) => {
        setStatus('failed');
        setMessage(err.response?.data?.message || 'Payment verification failed');
      });
  }, [reference]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="card p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-xl font-bold text-gray-900">Verifying Payment...</h2>
            <p className="text-gray-500 mt-2">Please wait while we confirm your payment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
            <p className="text-gray-500 mt-2">{message}</p>
            <p className="text-sm text-gray-400 mt-1">Reference: <code className="text-gray-600">{reference}</code></p>
            <div className="flex gap-3 mt-6 justify-center">
              <Link href="/history" className="btn-primary">View Purchases</Link>
              <Link href="/" className="btn-secondary">Continue Shopping</Link>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Payment Failed</h2>
            <p className="text-gray-500 mt-2">{message}</p>
            <div className="flex gap-3 mt-6 justify-center">
              <Link href="/" className="btn-primary">Back to Browse</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
