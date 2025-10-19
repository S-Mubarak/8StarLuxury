'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  AlertCircle,
  Armchair,
  Bus,
  CalendarDays,
  Loader2,
  Search,
  Ticket,
  User,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

type FoundBooking = {
  _id: string;
  bookingId: string;
  createdAt: string;
  totalCost: number;
  paymentStatus: string;
  passengers: { firstName: string; lastName: string }[];
  bookedSegments: { origin: string; destination: string }[];
  seatNumbers?: string[];
  trip: {
    departureTime: string;
    route: { name: string };
    vehicle: { name: string; plateNumber: string };
  };
};

const formSchema = z.object({
  identifier: z
    .string()
    .min(3, 'Please enter your Booking ID, Email, or Phone Number.'),
});
type FormValues = z.infer<typeof formSchema>;

export default function FindBookingPage() {
  const [foundBookings, setFoundBookings] = useState<FoundBooking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { identifier: '' },
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setSearched(true);
    setFoundBookings([]);
    try {
      const response = await fetch('/api/bookings/find', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: values.identifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          toast.info(
            data.message || 'No paid bookings found matching your search.'
          );

          setFoundBookings([]);
        } else {
          throw new Error(data.message || 'Failed to find bookings.');
        }
      } else {
        setFoundBookings(data);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-[80vh] flex-col items-center p-6 bg-slate-50">
      <Card className="w-full max-w-lg mb-8 shadow-md bg-white rounded-lg">
        <CardHeader className="text-center border-b pb-4">
          {' '}
          <CardTitle className="text-2xl font-semibold">
            Find Your Booking
          </CardTitle>
          <CardDescription>
            Enter your Booking ID, Email, or Phone Number below.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {' '}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              {' '}
              <FormField
                control={form.control}
                name="identifier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700">
                      Booking ID / Email / Phone
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="h-11 text-base"
                        placeholder="e.g., YK-ABC123 or user@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Search className="mr-2 h-5 w-5" />
                )}
                Search Bookings
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex flex-col items-center text-slate-500 mt-8">
          {' '}
          <Loader2 className="h-8 w-8 animate-spin mb-2" />
          <p>Searching for your booking...</p>
        </div>
      )}

      {!isLoading && searched && foundBookings.length === 0 && (
        <Card className="w-full max-w-lg p-6 flex flex-col items-center text-center shadow-md bg-yellow-50 border-l-4 border-yellow-400 rounded-lg">
          <AlertCircle className="h-12 w-12 text-yellow-500 mb-3" />
          <h2 className="text-xl font-semibold text-yellow-800">
            No Bookings Found
          </h2>
          <p className="text-yellow-700 mt-1">
            We couldn&apos;t find any paid bookings matching your search. Please
            double-check your input or contact support for assistance.
          </p>
        </Card>
      )}

      {!isLoading && foundBookings.length > 0 && (
        <div className="w-full max-w-3xl space-y-6">
          {' '}
          <h2 className="text-2xl font-semibold text-center mb-4 text-slate-800">
            {' '}
            Found {foundBookings.length} Booking(s)
          </h2>
          {foundBookings.map((booking) => (
            <BookingResultCard key={booking._id} booking={booking} />
          ))}
        </div>
      )}
    </main>
  );
}

interface BookingCardProps {
  booking: FoundBooking;
}

function BookingResultCard({ booking }: BookingCardProps) {
  const leadPassenger = booking.passengers[0];
  const departureTime = new Date(booking.trip.departureTime);

  const getStatusVariant = (
    status: string
  ): 'default' | 'destructive' | 'outline' | 'secondary' | 'success' => {
    switch (status) {
      case 'paid':
        return 'success';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="shadow-md overflow-hidden bg-white rounded-lg border border-slate-200">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 border-b flex flex-row justify-between items-center space-y-0">
        {' '}
        <div>
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Ticket className="h-5 w-5 text-blue-600" />
            Booking ID:{' '}
            <span className="font-mono text-blue-700">{booking.bookingId}</span>
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Booked on:{' '}
            {format(new Date(booking.createdAt), 'EEE, MMM d, yyyy')}{' '}
          </CardDescription>
        </div>
        <Badge
          //@ts-expect-error ???
          variant={getStatusVariant(booking.paymentStatus)}
          className="capitalize text-xs"
        >
          {booking.paymentStatus}
        </Badge>
      </CardHeader>
      <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        {' '}
        <div className="space-y-2 text-sm">
          <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-slate-500" /> Trip Details
          </h4>
          <div className="flex justify-between">
            <span className="text-slate-500">Route:</span>
            <span className="font-medium text-slate-800 text-right">
              {booking.trip.route.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Path:</span>
            <span className="font-medium text-slate-800 text-right">
              {booking.bookedSegments[0].origin} →{' '}
              {
                booking.bookedSegments[booking.bookedSegments.length - 1]
                  .destination
              }
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Departure:</span>
            <span className="font-medium text-slate-800 text-right">
              {departureTime.toLocaleString('en-US', {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Vehicle:</span>
            <span className="font-medium text-slate-800 text-right flex items-center gap-1 justify-end">
              <Bus className="h-4 w-4 text-slate-400" />{' '}
              {booking.trip.vehicle.name}
            </span>
          </div>
          {booking.seatNumbers && booking.seatNumbers.length > 0 && (
            <div className="flex justify-between">
              <span className="text-slate-500">Seat(s):</span>
              <span className="font-medium text-slate-800 text-right flex items-center gap-1 justify-end">
                <Armchair className="h-4 w-4 text-slate-400" />{' '}
                {booking.seatNumbers.join(', ')}
              </span>
            </div>
          )}
        </div>
        <div className="space-y-2 text-sm">
          <h4 className="font-semibold text-slate-700 mb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-slate-500" /> Passenger Details
          </h4>
          <div className="flex justify-between">
            <span className="text-slate-500">Lead Booker:</span>
            <span className="font-medium text-slate-800 text-right">
              {leadPassenger.firstName} {leadPassenger.lastName}
            </span>
          </div>
          {booking.passengers.length > 1 && (
            <div className="flex justify-between">
              <span className="text-slate-500">Total Pax:</span>
              <span className="font-medium text-slate-800 text-right">
                {booking.passengers.length}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-slate-50/70 p-4 flex justify-end items-center border-t">
        {' '}
        <span className="text-sm text-slate-600 mr-2">Total Paid:</span>
        <span className="text-lg font-bold text-slate-900">
          ₦{booking.totalCost.toLocaleString()}
        </span>
      </CardFooter>
    </Card>
  );
}
