'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PendingBookingData {
  tripId: string;
  passengers: any[];
  bookedSegments: { origin: string; destination: string }[];
  seatNumbers: string[];
  bookedAddOns: { name: string; price: number }[];
  totalCost: number;
}

export default function PaymentPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<PendingBookingData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedData = localStorage.getItem('pendingBooking');
    if (storedData) {
      try {
        const parsedData: PendingBookingData = JSON.parse(storedData);
        setBookingData(parsedData);
      } catch (e: any) {
        setError('Could not load booking details. Please try booking again.');
        toast.error('Error loading booking details.');
        console.error('Payment Page Load Error:', e);
      }
    } else {
      setError('No booking details found. Please start a new booking.');
      toast.error('Booking session expired or not found.');
    }
  }, [router]);

  const handlePayment = async () => {
    if (!bookingData) {
      toast.error('Booking details are missing.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Payment initialization failed.');
      }

      localStorage.removeItem('pendingBooking');

      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error('Could not get payment URL.');
      }
    } catch (err: any) {
      console.error('Payment Error:', err);
      setError(err.message || 'An unexpected error occurred.');
      toast.error(err.message || 'Payment failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center p-6 bg-slate-50">
      {' '}
      <Card className="w-full max-w-md shadow-lg bg-white rounded-lg">
        {' '}
        <CardHeader className="text-center border-b pb-4">
          {' '}
          <CardTitle className="text-2xl font-semibold">
            Confirm Payment
          </CardTitle>
          <CardDescription>Review your booking summary below.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {' '}
          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded" /* Style Update: Alert styling */
              role="alert"
            >
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          {
            bookingData ? (
              <>
                <div>
                  <h3 className="font-semibold text-lg mb-2 text-slate-700">
                    {' '}
                    Booking Summary
                  </h3>
                  <div className="space-y-1 text-sm">
                    {' '}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Passengers</span>
                      <span className="font-medium">
                        {bookingData.passengers.length}
                      </span>
                    </div>
                    {bookingData.seatNumbers &&
                      bookingData.seatNumbers.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Seats</span>
                          <span className="font-medium">
                            {bookingData.seatNumbers.join(', ')}
                          </span>
                        </div>
                      )}
                    {bookingData.bookedAddOns &&
                      bookingData.bookedAddOns.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Add-ons</span>
                          <span className="font-medium">
                            {bookingData.bookedAddOns.length} selected
                          </span>
                        </div>
                      )}
                  </div>
                </div>
                <Separator className="my-4" />{' '}
                <div className="flex justify-between items-center text-xl font-bold text-slate-900">
                  {' '}
                  <span>Total Amount</span>
                  <span>₦{bookingData.totalCost.toLocaleString()}</span>
                </div>
              </>
            ) : !error ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />{' '}
                <p className="ml-3 text-slate-500">
                  {' '}
                  Loading booking details...
                </p>
              </div>
            ) : null /* Error message is shown */
          }
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-3 bg-slate-50/70 p-6 border-t rounded-b-lg">
          {' '}
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base h-12 rounded-md shadow transition duration-150 ease-in-out" /* Style Update: Applied blue color and other styles */
            size="lg"
            onClick={handlePayment}
            disabled={isLoading || !bookingData || !!error}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> /* Style Update: Larger spinner */
            ) : (
              <Lock className="mr-2 h-5 w-5" /> /* Style Update: Larger icon */
            )}
            Pay ₦{bookingData?.totalCost.toLocaleString() ?? '...'} Securely
          </Button>
          <p className="text-xs text-muted-foreground text-center px-4">
            {' '}
            You will be redirected to Paystack&apos;s secure checkout to
            complete your payment.
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
