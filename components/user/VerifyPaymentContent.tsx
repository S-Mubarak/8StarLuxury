'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface VerificationResult {
  status: 'success' | 'failed' | 'error';
  message: string;
  bookingId?: string;
  amount?: number;
  customerEmail?: string;
}

export default function VerifyPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reference = searchParams.get('reference');
  const [result, setResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    if (!reference) {
      setResult({
        status: 'error',
        message: 'Payment reference missing from URL.',
      });
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(
          `/api/payment/verify?reference=${reference}`
        );

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const textResponse = await response.text();
          throw new Error(
            `Invalid response from server: ${textResponse.slice(0, 100)}`
          );
        }

        const data: VerificationResult = await response.json();

        if (!response.ok && data.status !== 'failed') {
          throw new Error(data.message || 'Verification request failed.');
        }
        setResult(data);
      } catch (err: any) {
        console.error('Verification fetch error:', err);
        setResult({
          status: 'error',
          message: err.message || 'Could not connect to verification service.',
        });
      }
    };

    verify();
  }, [reference]);

  if (!result) {
    return null;
  }

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center bg-slate-50">
      <Card className="w-full max-w-md shadow-lg bg-white rounded-lg overflow-hidden">
        <CardHeader
          className={`py-8 ${
            result.status === 'success'
              ? 'bg-green-50'
              : result.status === 'failed'
                ? 'bg-red-50'
                : result.status === 'error'
                  ? 'bg-yellow-50'
                  : 'bg-slate-50'
          }`}
        >
          {result.status === 'success' && (
            <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          )}
          {result.status === 'failed' && (
            <XCircle className="mx-auto h-16 w-16 text-red-500" />
          )}
          {result.status === 'error' && (
            <AlertTriangle className="mx-auto h-16 w-16 text-yellow-500" />
          )}
        </CardHeader>

        <CardContent className="p-6 space-y-3">
          {result.status === 'success' && (
            <>
              <h2 className="text-xl font-semibold text-green-600">
                Payment Successful!
              </h2>
              <p className="text-slate-600">
                Your booking (ID:{' '}
                <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">
                  {result.bookingId}
                </span>
                ) is confirmed.
              </p>
              <Separator className="my-4" />
              <div className="text-sm space-y-1 text-left text-slate-700">
                <div className="flex justify-between">
                  <span>Amount Paid:</span>
                  <span className="font-medium">
                    ₦{result.amount?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Reference:</span>
                  <span className="font-medium font-mono">
                    {result.bookingId}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-500 pt-3">
                A confirmation email with your e-ticket has been sent to{' '}
                <span className="font-medium">{result.customerEmail}</span>.
              </p>
            </>
          )}

          {result.status === 'failed' && (
            <>
              <h2 className="text-xl font-semibold text-red-600">
                Payment Failed
              </h2>
              <p className="text-slate-600">{result.message}</p>
              <p className="text-xs text-slate-500 pt-2">
                Your booking was not completed. Please attempt payment again. If
                issues persist, contact support.
              </p>
            </>
          )}

          {result.status === 'error' && (
            <>
              <h2 className="text-xl font-semibold text-yellow-600">
                Verification Error
              </h2>
              <p className="text-slate-600">{result.message}</p>
              <p className="text-xs text-slate-500 pt-2">
                We couldn&apos;t confirm your payment status automatically.
                Please contact support if you believe payment was made.
              </p>
            </>
          )}
        </CardContent>

        <CardFooter className="bg-slate-50/70 p-4 border-t">
          {result.status === 'success' && (
            <Button asChild className="w-full bg-[#96351e] hover:bg-[#dbb98f]">
              <Link href="/bookings">View My Bookings</Link>
            </Button>
          )}
          {result.status === 'failed' && (
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="w-full"
            >
              Try Payment Again
            </Button>
          )}
          {result.status === 'error' && (
            <Button asChild variant="secondary" className="w-full">
              <Link href="/">Go to Homepage</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
