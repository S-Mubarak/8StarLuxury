import dbConnect from '@/lib/dbConnect';
import AddOn from '@/models/AddOn';
import Booking from '@/models/Booking';
import { IRoute } from '@/models/Route';
import Trip from '@/models/Trip';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import { NextResponse } from 'next/server';

interface PassengerData {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  documentType: string;
  idNumber: string;
}

interface BookedAddOnData {
  _id: string;
  name: string;
  price: number;
  pricingType: 'per-passenger' | 'per-booking';
}

interface BookingRequestData {
  tripId: string;
  passengers: PassengerData[];
  bookedSegments: { origin: string; destination: string }[];
  seatNumbers: string[];
  bookedAddOns: BookedAddOnData[];
  totalCost: number;
}

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body: BookingRequestData = await request.json();

    const {
      tripId,
      passengers,
      bookedSegments,
      seatNumbers,
      bookedAddOns,
      totalCost,
    } = body;

    const passengerCount = passengers.length;

    if (
      !tripId ||
      !passengers ||
      passengerCount === 0 ||
      !bookedSegments ||
      !totalCost
    ) {
      return NextResponse.json(
        { message: 'Invalid booking data' },
        { status: 400 }
      );
    }

    const trip = await Trip.findById(tripId)
      .populate<{ route: IRoute }>('route')
      .populate('vehicle');

    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    if (
      trip.status !== 'scheduled' ||
      new Date(trip.departureTime) < new Date()
    ) {
      return NextResponse.json(
        { message: 'This trip is no longer available' },
        { status: 410 }
      );
    }

    const addOnIds = bookedAddOns.map((a) => a._id);
    const dbAddOns = await AddOn.find({
      _id: { $in: addOnIds },
      isActive: true,
    });

    const { segments } = trip.route;
    const fromOrigin = bookedSegments[0].origin;
    const toDestination = bookedSegments[bookedSegments.length - 1].destination;

    let segmentStartIndex = -1;
    let segmentEndIndex = -1;
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].origin === fromOrigin) segmentStartIndex = i;
      if (segments[i].destination === toDestination) segmentEndIndex = i;
    }

    if (
      segmentStartIndex === -1 ||
      segmentEndIndex === -1 ||
      segmentEndIndex < segmentStartIndex
    ) {
      return NextResponse.json(
        { message: 'Invalid route segments.' },
        { status: 400 }
      );
    }

    let serverSegmentPrice = 0;
    for (let i = segmentStartIndex; i <= segmentEndIndex; i++) {
      serverSegmentPrice += segments[i].cost;
    }
    const serverBasePrice = serverSegmentPrice * passengerCount;

    let serverAddOnPrice = 0;
    for (const dbAddOn of dbAddOns) {
      if (dbAddOn.pricingType === 'per-passenger') {
        serverAddOnPrice += dbAddOn.price * passengerCount;
      } else {
        serverAddOnPrice += dbAddOn.price;
      }
    }

    const serverTotalCost = serverBasePrice + serverAddOnPrice;

    if (Math.abs(serverTotalCost - totalCost) > 0.01) {
      console.error(
        `Price mismatch. Client: ${totalCost}, Server: ${serverTotalCost}`
      );
      return NextResponse.json(
        { message: `Price calculation error. Please try again.` },
        { status: 409 }
      );
    }

    if (serverTotalCost <= 0) {
      return NextResponse.json(
        { message: 'Total cost cannot be zero or negative.' },
        { status: 400 }
      );
    }

    const availableCapacity =
      (trip.vehicle as any).capacity - trip.bookedSeats.length;

    if (passengerCount > availableCapacity) {
      return NextResponse.json(
        {
          message: `Not enough seats available. Only ${availableCapacity} left.`,
        },
        { status: 409 }
      );
    }

    if (seatNumbers.length > 0) {
      const alreadyBooked = seatNumbers.some((seat) =>
        trip.bookedSeats.includes(seat)
      );
      if (alreadyBooked) {
        return NextResponse.json(
          {
            message:
              'One or more selected seats are no longer available. Please go back and re-select.',
          },
          { status: 409 }
        );
      }
    }

    const bookingId = `8SLT-${nanoid(6).toUpperCase()}`;

    const newBooking = new Booking({
      trip: tripId,
      bookingId: bookingId,
      passengers: passengers,
      bookedSegments: bookedSegments,
      seatNumbers: seatNumbers,
      bookedAddOns: dbAddOns.map((a) => ({ name: a.name, price: a.price })),
      totalCost: serverTotalCost,
      paymentStatus: 'pending',
      paymentMethod: 'paystack',
    });

    const savedBooking = await newBooking.save();

    const paystackResponse = await fetch(
      'https://api.paystack.co/transaction/initialize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: passengers[0].email,
          amount: Math.round(serverTotalCost * 100),
          reference: bookingId,
          metadata: {
            booking_db_id: savedBooking._id.toString(),
            booking_id: bookingId,
            trip_name: trip.route.name,
          },
          callback_url: `${process.env.NEXTAUTH_URL}/payment/verify`,
        }),
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status || !paystackData.data?.authorization_url) {
      console.error('Paystack Initialization Failed:', paystackData.message);

      await Booking.findByIdAndDelete(savedBooking._id);
      return NextResponse.json(
        {
          message:
            paystackData.message || 'Payment provider failed to initialize.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { url: paystackData.data.authorization_url },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Payment Initialization Error:', error);

    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json(
        { message: 'Validation Error', errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}
