'use client';

import { format, startOfDay } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowRight, Loader2, Truck, Wifi } from 'lucide-react';

type PopulatedTrip = {
  _id: string;
  departureTime: string;
  status: string;
  bookedSeats: string[];
  route: {
    _id: string;
    name: string;
    segments: {
      origin: string;
      destination: string;
      cost: number;
      mode: 'road' | 'air';
    }[];
  };
  vehicle: {
    _id: string;
    name: string;
    amenities: string[];
  };
  driver: {
    _id: string;
    firstName: string;
    lastName: string;
  };
};

export default function SearchResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const [allMatchingTrips, setAllMatchingTrips] = useState<PopulatedTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (!from || !to) return;

    const fetchTrips = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/trips/search?from=${from}&to=${to}`);
        if (!res.ok) throw new Error('No trips found for this route.');
        const data = await res.json();
        setAllMatchingTrips(data);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrips();
  }, [from, to]);

  const availableDates = useMemo(() => {
    return allMatchingTrips.map((trip) =>
      startOfDay(new Date(trip.departureTime))
    );
  }, [allMatchingTrips]);

  const tripsForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return allMatchingTrips.filter((trip) => {
      return (
        startOfDay(new Date(trip.departureTime)).getTime() ===
        selectedDate.getTime()
      );
    });
  }, [selectedDate, allMatchingTrips]);

  const calculateTripPrice = (trip: PopulatedTrip) => {
    const { segments } = trip.route;
    let startIndex = -1;
    let endIndex = -1;

    for (let i = 0; i < segments.length; i++) {
      if (segments[i].origin === from) startIndex = i;
      if (segments[i].destination === to) endIndex = i;
    }

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
      return 0;
    }

    let totalCost = 0;
    for (let i = startIndex; i <= endIndex; i++) {
      totalCost += segments[i].cost;
    }
    return totalCost;
  };

  const handleBookNow = (tripId: string) => {
    router.push(`/book/${tripId}?from=${from}&to=${to}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-lg text-muted-foreground">
          Searching for trips from {from} to {to}...
        </p>
      </div>
    );
  }

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold">Available Trips</h1>
      <p className="text-xl text-muted-foreground mb-6">
        From <span className="text-blue-600 font-semibold">{from}</span> to{' '}
        <span className="text-blue-600 font-semibold">{to}</span>
      </p>

      {allMatchingTrips.length === 0 ? (
        <Card className="flex flex-col items-center p-8">
          <AlertCircle className="h-16 w-16 text-yellow-500" />
          <h2 className="mt-4 text-2xl font-semibold">No Trips Found</h2>
          <p className="mt-2 text-muted-foreground">
            We couldn&apos;t find any scheduled trips for this route.
          </p>
          <Button onClick={() => router.push('/')} className="mt-6">
            Try Another Search
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col justify-center items-center">
            <div className="h-full ">
              <h2 className="text-xl font-semibold mb-3">Select a Date</h2>

              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                fromDate={new Date()}
                modifiers={{
                  available: availableDates,
                }}
                modifiersClassNames={{
                  available: 'bg-blue-600 text-white rounded-full',
                }}
                disabled={(date) => {
                  return (
                    date < startOfDay(new Date()) ||
                    !availableDates.some(
                      (d) => d.getTime() === startOfDay(date).getTime()
                    )
                  );
                }}
              />
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-xl font-semibold mb-3">
              {selectedDate
                ? `Trips for ${format(selectedDate, 'PPP')}`
                : 'Please select a date'}
            </h2>

            {!selectedDate ? (
              <Card className="flex items-center justify-center p-12">
                <p className="text-muted-foreground">
                  Select an available date on the calendar to see trips.
                </p>
              </Card>
            ) : tripsForSelectedDate.length === 0 ? (
              <Card className="flex items-center justify-center p-12">
                <p className="text-muted-foreground">
                  No trips found for this date (this shouldn&apos;t happen).
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {tripsForSelectedDate.map((trip) => {
                  const price = calculateTripPrice(trip);

                  const getAmenityIcon = (amenity: string) => {
                    if (amenity.toLowerCase().includes('wifi'))
                      return <Wifi className="h-4 w-4 mr-1 text-blue-500" />;
                    if (amenity.toLowerCase().includes('ac'))
                      return (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1 text-blue-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.33 6.33a.75.75 0 011.06-1.06L10 9.94l4.61-4.67a.75.75 0 111.06 1.06L11.06 11l4.61 4.61a.75.75 0 11-1.06 1.06L10 12.06l-4.61 4.61a.75.75 0 01-1.06-1.06L8.94 11 4.33 6.33z"
                            clipRule="evenodd"
                          />
                        </svg>
                      );
                    if (amenity.toLowerCase().includes('refreshment'))
                      return (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1 text-blue-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 3a1 1 0 01.993.883L11 4v1.172l4.243-4.243a1 1 0 111.414 1.414L12.414 6.5H14a1 1 0 01.993.883L15 7.5v3a1 1 0 01-.883.993L14 11.5h-1.586l4.243 4.243a1 1 0 11-1.414 1.414L11 12.914V16a1 1 0 01-.883.993L10 17a1 1 0 01-.993-.883L9 16v-3.086l-4.243 4.243a1 1 0 11-1.414-1.414L7.586 11.5H6a1 1 0 01-.993-.883L5 10.5v-3a1 1 0 01.883-.993L6 6.5h1.586L3.343 2.257A1 1 0 014.757.843L9 5.086V4a1 1 0 01.883-.993L10 3zm0 5.5a2 2 0 100 4 2 2 0 000-4z" />
                        </svg>
                      );

                    return null;
                  };

                  return (
                    <Card
                      key={trip._id}
                      className="overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="flex-1 p-4 sm:p-5">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <CardTitle className="text-xl font-bold text-slate-900">
                                {format(
                                  new Date(trip.departureTime),
                                  'h:mm a'
                                )}{' '}
                              </CardTitle>
                              <CardDescription className="text-sm">
                                Driver: {trip.driver.firstName}{' '}
                                {trip.driver.lastName}
                              </CardDescription>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-xs mt-1 capitalize"
                            >
                              {trip.status}
                            </Badge>
                          </div>

                          <div className="text-sm text-slate-600 space-y-1 mt-3">
                            <div className="flex items-center">
                              <Truck className="h-4 w-4 mr-2 flex-shrink-0" />
                              <span className="font-medium text-slate-800">
                                {trip.vehicle.name}
                              </span>
                            </div>
                            {trip.vehicle.amenities.length > 0 && (
                              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 pt-1">
                                {trip.vehicle.amenities.map((amenity) => (
                                  <span
                                    key={amenity}
                                    className="flex items-center text-xs text-slate-500"
                                  >
                                    {getAmenityIcon(amenity)} {amenity}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="bg-slate-50/70 p-4 sm:p-5 sm:w-48 flex flex-col items-start sm:items-end justify-between border-t sm:border-t-0 sm:border-l border-slate-200">
                          <div className="text-left sm:text-right w-full">
                            <p className="text-sm text-slate-500 mb-0.5">
                              Price per seat
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                              ₦{price.toLocaleString()}
                            </p>
                          </div>
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 mt-3"
                            size="sm"
                            onClick={() => handleBookNow(trip._id)}
                          >
                            Book Seat <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
