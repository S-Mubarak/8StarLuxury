'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Loader2, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PendingBookingData {
  tripId: string;
  passengers: any[];
  bookedSegments: {
    origin: string;
    destination: string;
    mode?: 'road' | 'air';
    cost?: number;
  }[];
  seatNumbers: string[];
  bookedAddOns: {
    name: string;
    price: number;
    pricingType?: 'per-passenger' | 'per-booking';
  }[];
  totalCost: number;

  tripDetails?: {
    routeName: string;
    departureTime: string;
  };
}

export default function PaymentPage() {
  const [bookingData, setBookingData] = useState<PendingBookingData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    const storedData = localStorage.getItem('pendingBooking');
    if (storedData) {
      try {
        const parsedData: PendingBookingData = JSON.parse(storedData);
        setBookingData(parsedData);
      } catch (e: any) {
        console.error(e);

        setError('Could not load booking details. Please try booking again.');
        toast.error('Error loading booking details.');
      }
    } else {
      setError('No booking details found. Please start a new booking.');
      toast.error('Booking session expired or not found.');
    }
    setIsDataLoading(false);
  }, []);

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
        headers: { 'Content-Type': 'application/json' },
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

  const passengerCount = bookingData?.passengers?.length || 0;
  /* const basePrice = useMemo(() => {
    if (!bookingData) return 0;
    return (
      bookingData.bookedSegments.reduce(
        (sum, seg) => sum + (seg.cost || 0),
        0
      ) * passengerCount
    );
  }, [bookingData, passengerCount]);

  const addonsPrice = useMemo(() => {
    if (!bookingData) return 0;
    return bookingData.bookedAddOns.reduce((total, addon) => {
      return (
        total +
        (addon.pricingType === 'per-passenger'
          ? addon.price * passengerCount
          : addon.price)
      );
    }, 0);
  }, [bookingData, passengerCount]); */

  return (
    <main className="flex min-h-[80vh] flex-col items-center justify-center p-6 bg-slate-50">
      <Card className="w-full max-w-lg shadow-lg bg-white rounded-lg">
        <CardHeader className="text-center border-b pb-4">
          <CardTitle className="text-2xl font-semibold">
            Confirm Payment
          </CardTitle>
          <CardDescription>
            Final review of your booking before payment.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {error && (
            <div
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded"
              role="alert"
            >
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}
          {isDataLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              <p className="ml-3 text-slate-500">Loading booking details...</p>
            </div>
          ) : bookingData ? (
            <>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">
                    Your Itinerary
                  </h3>
                  <div className="space-y-1.5 text-sm text-muted-foreground border-l-2 border-slate-200 pl-3 ml-1">
                    {bookingData.bookedSegments.map((seg, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span>{seg.origin}</span>
                        <ArrowRight className="h-3 w-3 text-slate-400" />
                        <span>{seg.destination}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passengers</span>
                    <span className="font-medium">{passengerCount}</span>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />
              <div className="flex justify-between items-center text-xl font-bold text-slate-900">
                <span>Total Amount</span>
                <span>₦{bookingData.totalCost.toLocaleString()}</span>
              </div>
            </>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-3 bg-slate-50/70 p-6 border-t rounded-b-lg">
          <Button
            className="w-full bg-[#96351e] hover:bg-[#dbb98f] text-white font-semibold text-base h-12 rounded-md shadow transition duration-150 ease-in-out"
            size="lg"
            onClick={handlePayment}
            disabled={isLoading || !bookingData || !!error}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Lock className="mr-2 h-5 w-5" />
            )}
            Pay ₦{bookingData?.totalCost.toLocaleString() ?? '...'} Securely
          </Button>
          <p className="text-xs text-muted-foreground text-center px-4">
            You will be redirected to Paystack&apos;s secure checkout to
            complete your payment.
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
