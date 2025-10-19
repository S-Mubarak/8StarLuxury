'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Bus,
  Check,
  CreditCard,
  Info,
  Loader2,
  PlusCircle,
  Trash2,
  User,
  Users,
} from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import SeatSelection from '@/components/user/SeatSelection';

import { IAddOn } from '@/models/AddOn';
type PopulatedTrip = any;

const passengerSchema = z.object({
  //@ts-expect-error ???
  title: z.enum(['Mr', 'Mrs', 'Ms', 'Miss'], {
    required_error: 'Title is required.',
  }),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email').optional(),
  phoneNumber: z.string().min(10, 'Invalid phone').optional(),
  nationality: z.string().optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  dateOfBirth: z.string().optional(),
  //@ts-expect-error ???
  documentType: z.enum(['Passport', 'NIN'], {
    required_error: 'ID type is required.',
  }),
  idNumber: z.string().min(5, 'ID number is required'),
});

const bookingFormSchema = z.object({
  passengers: z
    .array(passengerSchema)
    .min(1, 'At least one passenger is required')
    .refine(
      (passengers) => passengers[0].email && passengers[0].email.length > 0,
      {
        message: 'Email is required for the lead passenger.',
        path: ['passengers', 0, 'email'],
      }
    )
    .refine(
      (passengers) =>
        passengers[0].phoneNumber && passengers[0].phoneNumber.length > 0,
      {
        message: 'Phone Number is required for the lead passenger.',
        path: ['passengers', 0, 'phoneNumber'],
      }
    ),
});
type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function BookPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { tripId } = params;
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const [trip, setTrip] = useState<PopulatedTrip | null>(null);
  const [addons, setAddons] = useState<IAddOn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [passengerCount, setPassengerCount] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<IAddOn[]>([]);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      passengers: [
        {
          title: undefined,
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          documentType: undefined,
          idNumber: '',
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'passengers',
  });

  useEffect(() => {
    if (!tripId || !from || !to) {
      toast.error('Invalid booking link.');
      router.push('/');
      return;
    }
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [tripRes, addonsRes] = await Promise.all([
          fetch(`/api/public/trips/${tripId}`),
          fetch(`/api/addons?active=true&limit=1000`),
        ]);
        if (!tripRes.ok) throw new Error('Trip not available.');
        if (!addonsRes.ok) throw new Error('Could not load add-ons.');
        const tripData = await tripRes.json();
        const addonsData = await addonsRes.json();

        const availableCapacity =
          tripData.vehicle.capacity - (tripData.bookedSeats?.length || 0);
        if (availableCapacity <= 0) {
          throw new Error('This trip is fully booked.');
        }

        setTrip({ ...tripData, availableCapacity });
        setAddons(addonsData.data);
      } catch (error: any) {
        toast.error(error.message);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [tripId, from, to, router]);

  const handlePassengerCountChange = (value: string) => {
    const count = parseInt(value, 10);
    setPassengerCount(count);

    const currentCount = fields.length;
    if (count > currentCount) {
      for (let i = currentCount; i < count; i++) {
        append({
          title: 'Mr',
          firstName: '',
          lastName: '',
          email: '',
          phoneNumber: '',
          documentType: 'NIN',
          idNumber: '',
        });
      }
    } else if (count < currentCount) {
      for (let i = currentCount - 1; i >= count; i--) {
        remove(i);
      }
    }
    setSelectedSeats([]);
  };

  const segmentPrice = useMemo(() => {
    if (!trip || !from || !to) return 0;
    const { segments } = trip.route;
    let startIndex = -1,
      endIndex = -1;
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].origin === from) startIndex = i;
      if (segments[i].destination === to) endIndex = i;
    }
    if (startIndex === -1 || endIndex === -1) return 0;
    let totalCost = 0;
    for (let i = startIndex; i <= endIndex; i++) {
      totalCost += segments[i].cost;
    }
    return totalCost;
  }, [trip, from, to]);
  const basePrice = segmentPrice * passengerCount;
  const addonsPrice = useMemo(() => {
    let total = 0;
    for (const addon of selectedAddOns) {
      total +=
        addon.pricingType === 'per-passenger'
          ? addon.price * passengerCount
          : addon.price;
    }
    return total;
  }, [selectedAddOns, passengerCount]);
  const totalPrice = basePrice + addonsPrice;

  const isRoadTrip = useMemo(() => {
    if (!trip) return false;
    const { segments } = trip.route;
    let startIndex = -1,
      endIndex = -1;
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].origin === from) startIndex = i;
      if (segments[i].destination === to) endIndex = i;
    }
    if (startIndex === -1 || endIndex === -1) return false;
    for (let i = startIndex; i <= endIndex; i++) {
      if (segments[i].mode === 'road') return true;
    }
    return false;
  }, [trip, from, to]);

  const toggleAddOn = (addon: IAddOn) => {
    setSelectedAddOns((prev) =>
      prev.find((a) => a._id === addon._id)
        ? prev.filter((a) => a._id !== addon._id)
        : [...prev, addon]
    );
  };
  const handleSeatSelect = (seatId: string) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((s) => s !== seatId);
      }
      if (prev.length < passengerCount) {
        return [...prev, seatId];
      }
      toast.warning(`You can only select ${passengerCount} seat(s).`);
      return prev;
    });
  };

  const onSubmit = (values: BookingFormValues) => {
    if (isRoadTrip && selectedSeats.length !== passengerCount) {
      toast.error(`Please select exactly ${passengerCount} seat(s).`);
      return;
    }
    const finalPassengers = values.passengers.map((p, index) =>
      index === 0
        ? p
        : { ...p, email: p.email || 'N/A', phoneNumber: p.phoneNumber || 'N/A' }
    );
    const bookingData = {
      tripId: trip._id,
      passengers: finalPassengers,
      bookedSegments: trip.route.segments
        .slice(
          trip.route.segments.findIndex((s: any) => s.origin === from),
          trip.route.segments.findIndex((s: any) => s.destination === to) + 1
        )
        .map((s: any) => ({ origin: s.origin, destination: s.destination })),
      seatNumbers: selectedSeats || [],
      bookedAddOns: selectedAddOns.map((a) => ({
        _id: a._id,
        name: a.name,
        price: a.price,
        pricingType: a.pricingType,
      })),
      totalCost: totalPrice,
    };
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    toast.success('Proceeding to payment...');
    router.push('/payment');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
        <p className="mt-4 text-lg text-muted-foreground">
          Loading your trip...
        </p>
      </div>
    );
  }

  if (!trip) return null;

  const maxPassengers = Math.min(trip.availableCapacity, 5);

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-slate-50 rounded-lg shadow-inner">
      <div className="lg:col-span-2 space-y-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle>Passengers</CardTitle>
              <CardDescription>Select the number of travelers.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">
              How many passengers?
            </label>
            <Select
              value={passengerCount.toString()}
              onValueChange={handlePassengerCountChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxPassengers }, (_, i) => i + 1).map(
                  (count) => (
                    <SelectItem key={count} value={count.toString()}>
                      {count} Passenger{count > 1 ? 's' : ''}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Maximum {maxPassengers} passengers for this trip. Available seats:
              {trip.availableCapacity}
            </p>
          </CardContent>
        </Card>
        {isRoadTrip && (
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
              <Bus className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Seat Selection</CardTitle>
                <CardDescription>
                  Choose preferred seats for your journey.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <SeatSelection
                capacity={trip.vehicle.capacity}
                bookedSeats={trip.vehicle.bookedSeats}
                selectedSeats={selectedSeats}
                onSeatSelect={handleSeatSelect}
                passengerCount={passengerCount}
              />
            </CardContent>
          </Card>
        )}
        {addons.length > 0 && (
          <Card className="bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-4">
              <PlusCircle className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Enhance Your Trip</CardTitle>
                <CardDescription>
                  Optional services and packages.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addons.map((addon) => (
                <Card
                  key={addon._id as string}
                  className={`flex items-start justify-between p-4 border rounded-lg transition-colors hover:bg-slate-50 ${selectedAddOns.some((a) => a._id === addon._id) ? 'border-blue-500 ring-1 ring-blue-500' : 'border-slate-200'}`}
                >
                  <div className="pr-4 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{addon.name}</h4>

                      {selectedAddOns.some((a) => a._id === addon._id) && (
                        <Check className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {addon.description}
                    </p>
                    <p className="text-sm font-bold text-blue-600 mt-2">
                      ₦{addon.price.toLocaleString()}
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        ({addon.pricingType.replace('-', ' ')})
                      </span>
                    </p>
                  </div>
                  <Checkbox
                    className="mt-1"
                    onCheckedChange={() => toggleAddOn(addon)}
                    checked={selectedAddOns.some((a) => a._id === addon._id)}
                    aria-label={`Select ${addon.name}`}
                  />
                </Card>
              ))}
            </CardContent>
          </Card>
        )}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Info className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-semibold">Passenger Details</h2>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {fields.map((field, index) => (
                <Card
                  key={field.id}
                  className="bg-white shadow-sm overflow-hidden"
                >
                  <CardHeader className="flex flex-row items-center justify-between bg-slate-50 p-4 border-b">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-slate-600" />
                      Passenger {index + 1}
                      {index === 0 && (
                        <Badge variant="outline">Lead Booker</Badge>
                      )}
                    </CardTitle>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 h-8 px-2"
                        onClick={() =>
                          handlePassengerCountChange(
                            (passengerCount - 1).toString()
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Remove
                      </Button>
                    )}
                  </CardHeader>
                  <CardContent className="p-5 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`passengers.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Mr">Mr</SelectItem>
                                <SelectItem value="Mrs">Mrs</SelectItem>
                                <SelectItem value="Ms">Ms</SelectItem>
                                <SelectItem value="Miss">Miss</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`passengers.${index}.firstName`}
                        render={({ field }) => (
                          <FormItem className="sm:col-span-2">
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name={`passengers.${index}.lastName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Separator className="my-4" />
                    <p className="text-sm font-medium text-slate-700">
                      Contact Details
                    </p>
                    <FormDescription className="text-xs">
                      {index === 0
                        ? 'Your e-ticket will be sent here.'
                        : 'Optional for other passengers.'}
                    </FormDescription>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`passengers.${index}.email`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email {index === 0 && '*'}</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="john.doe@example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`passengers.${index}.phoneNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Phone Number {index === 0 && '*'}
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="08012345678"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Separator className="my-4" />
                    <p className="text-sm font-medium text-slate-700">
                      Identity
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`passengers.${index}.documentType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Document Type *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select ID" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Passport">
                                  Passport
                                </SelectItem>
                                <SelectItem value="NIN">NIN</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`passengers.${index}.idNumber`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>ID Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="1234567890" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Separator className="my-4" />
                    <p className="text-sm font-medium text-slate-700">
                      Other Details (Optional)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name={`passengers.${index}.nationality`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nationality</FormLabel>
                            <FormControl>
                              <Input placeholder="Nigerian" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`passengers.${index}.gender`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`passengers.${index}.dateOfBirth`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </form>
          </Form>
        </div>
      </div>

      <div className="lg:col-span-1 h-full">
        <Card className="sticky top-24 bg-white shadow-md">
          <CardHeader className="border-b pb-4">
            <CardTitle className="text-xl">Booking Summary</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="pb-3 border-b border-dashed">
              <h4 className="font-semibold text-slate-800">
                {trip.route.name}
              </h4>
              <p className="text-sm text-muted-foreground">
                {from} → {to}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date(trip.departureTime).toLocaleString('en-US', {
                  dateStyle: 'full',
                  timeStyle: 'short',
                })}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Passengers</span>
                <span className="font-medium">{passengerCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base Price</span>
                <span className="font-medium">
                  ₦{segmentPrice.toLocaleString()} x {passengerCount}
                </span>
              </div>
              <div className="flex justify-between font-semibold">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-slate-800">
                  ₦{basePrice.toLocaleString()}
                </span>
              </div>
            </div>
            {selectedAddOns.length > 0 && (
              <div className="space-y-2 text-sm pt-3 border-t border-dashed">
                <h5 className="font-medium text-slate-700">
                  Selected Add-Ons:
                </h5>
                {selectedAddOns.map((addon) => (
                  <div
                    key={addon._id as string}
                    className="flex justify-between"
                  >
                    <span className="text-muted-foreground">{addon.name}</span>
                    <span className="font-medium">
                      + ₦
                      {(addon.pricingType === 'per-passenger'
                        ? addon.price * passengerCount
                        : addon.price
                      ).toLocaleString()}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold pt-1">
                  <span className="text-muted-foreground">Add-ons Total</span>
                  <span className="font-medium text-slate-800">
                    ₦{addonsPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
            <Separator className="my-3" />
            <div className="flex justify-between items-center text-lg font-bold text-slate-900">
              <span>Grand Total</span>
              <span>₦{totalPrice.toLocaleString()}</span>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-5">
            <Button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 h-11 text-base"
              size="lg"
              onClick={form.handleSubmit(onSubmit)}
              disabled={form.formState.isSubmitting || isLoading}
            >
              {form.formState.isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" /> Proceed to Payment
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
