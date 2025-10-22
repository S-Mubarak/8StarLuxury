'use client';

import { format, startOfDay } from 'date-fns';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  AlertCircle,
  ArrowRight,
  Bus,
  Loader2,
  Plane,
  Truck,
  Wifi,
} from 'lucide-react';

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
        setAllMatchingTrips([]);
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
    let startIndex = -1,
      endIndex = -1;
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].origin === from) startIndex = i;
      if (segments[i].destination === to) endIndex = i;
    }
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) return 0;
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
    <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6">
      {' '}
      <div>
        <h1 className="text-3xl font-bold">Available Trips</h1>
        <p className="text-xl text-muted-foreground mb-6">
          From <span className="text-blue-600 font-semibold">{from}</span> to{' '}
          <span className="text-blue-600 font-semibold">{to}</span>
        </p>
      </div>
      {allMatchingTrips.length === 0 ? (
        <Card className="flex flex-col items-center p-8 mt-8 border-dashed">
          <AlertCircle className="h-16 w-16 text-yellow-500" />
          <h2 className="mt-4 text-2xl font-semibold">No Trips Found</h2>
          <p className="mt-2 text-muted-foreground">
            We couldn&apos;t find any scheduled trips for this route.
          </p>
          <Button
            onClick={() => router.push('/')}
            className="mt-6 bg-slate-800 hover:bg-slate-700"
          >
            Try Another Search
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="sticky top-24 shadow-sm">
              {' '}
              <CardHeader>
                <CardTitle className="text-xl">Select a Date</CardTitle>
              </CardHeader>
              <CardContent className="p-2 flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  fromDate={new Date()}
                  modifiers={{ available: availableDates }}
                  modifiersClassNames={{
                    available:
                      'bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-700 rounded-md',
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
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">
              {selectedDate
                ? `Trips for ${format(selectedDate, 'PPP')}`
                : 'Please select an available date'}
            </h2>

            {!selectedDate ? (
              <Card className="flex items-center justify-center p-12 border-dashed">
                <p className="text-muted-foreground text-center">
                  Select a highlighted date on the calendar to see available
                  trips.
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {tripsForSelectedDate.map((trip) => {
                  const price = calculateTripPrice(trip);

                  const allSegments = trip.route.segments;
                  let startIndex = -1;
                  let endIndex = -1;
                  for (let i = 0; i < allSegments.length; i++) {
                    if (allSegments[i].origin === from) startIndex = i;
                    if (allSegments[i].destination === to) endIndex = i;
                  }
                  const relevantSegments =
                    startIndex !== -1 &&
                    endIndex !== -1 &&
                    endIndex >= startIndex
                      ? allSegments.slice(startIndex, endIndex + 1)
                      : [];

                  const getAmenityIcon = (amenity: string) => {
                    if (amenity.toLowerCase().includes('wifi'))
                      return <Wifi className="h-3 w-3 mr-1.5 text-blue-500" />;

                    return null;
                  };
                  const getModeIcon = (mode: string) => {
                    return mode === 'road' ? (
                      <Truck className="h-5 w-5 mr-2 flex-shrink-0 text-slate-500" />
                    ) : (
                      <Plane className="h-5 w-5 mr-2 flex-shrink-0 text-slate-500" />
                    );
                  };

                  return (
                    <Card
                      key={trip._id}
                      className="overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="flex-1 p-4 sm:p-5">
                          <div className="flex justify-between items-start mb-4 border-b pb-3">
                            <div>
                              <CardTitle className="text-xl font-bold text-slate-900">
                                {format(new Date(trip.departureTime), 'h:mm a')}{' '}
                                Departure
                              </CardTitle>
                              {relevantSegments.some(
                                (seg) => seg.mode === 'road'
                              ) && (
                                <CardDescription className="text-sm mt-1">
                                  Driver: {trip.driver.firstName}{' '}
                                  {trip.driver.lastName}
                                </CardDescription>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4 mt-4">
                            <h4 className="text-sm font-semibold text-slate-700">
                              Your Journey:
                            </h4>
                            {relevantSegments.map((segment, index) => (
                              <div
                                key={index}
                                className="pl-3 border-l-2 border-slate-200 relative"
                              >
                                <div className="absolute -left-[5.5px] top-1 h-2.5 w-2.5 rounded-full bg-slate-400 ring-4 ring-white"></div>
                                <div className="flex items-center text-sm font-medium text-slate-800 mb-1">
                                  {getModeIcon(segment.mode)}
                                  <span>{segment.origin}</span>
                                  <ArrowRight className="h-3 w-3 mx-1.5 text-slate-400" />
                                  <span>{segment.destination}</span>
                                </div>
                                {segment.mode === 'road' && (
                                  <div className="text-xs text-slate-600 pl-8 space-y-1">
                                    <div className="flex items-center">
                                      <Bus className="h-4 w-4 mr-1.5 flex-shrink-0 text-slate-500" />
                                      Vehicle: {trip.vehicle.name}
                                    </div>
                                    {trip.vehicle.amenities.length > 0 && (
                                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                                        {trip.vehicle.amenities.map(
                                          (amenity) => (
                                            <span
                                              key={amenity}
                                              className="flex items-center text-slate-500"
                                            >
                                              {getAmenityIcon(amenity)}{' '}
                                              {amenity}
                                            </span>
                                          )
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                                {segment.mode === 'air' && (
                                  <div className="text-xs text-slate-600 pl-8">
                                    <p>
                                      Flight segment details will be provided
                                      upon booking confirmation.
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-slate-50/70 p-4 sm:p-5 sm:w-52 flex flex-col items-start sm:items-end justify-between border-t sm:border-t-0 sm:border-l border-slate-200">
                          <div className="text-left sm:text-right w-full">
                            <p className="text-sm text-slate-500 mb-0.5">
                              Price per person
                            </p>
                            <p className="text-3xl font-bold text-blue-600">
                              ₦{price.toLocaleString()}
                            </p>
                          </div>
                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
                            onClick={() => handleBookNow(trip._id)}
                          >
                            Book Now <ArrowRight className="h-4 w-4 ml-2" />
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
