'use client';

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

import VerifyPaymentContent from '@/components/user/VerifyPaymentContent';

export default function VerifyPaymentPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <VerifyPaymentContent />
    </Suspense>
  );
}

function LoadingState() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center bg-slate-50">
      {' '}
      <Loader2 className="h-12 w-12 animate-spin text-blue-500" />{' '}
      <h1 className="mt-4 text-2xl font-semibold text-slate-700">
        {' '}
        Verifying your payment...
      </h1>
      <p className="text-slate-500"> Please wait a moment.</p>
    </main>
  );
}
