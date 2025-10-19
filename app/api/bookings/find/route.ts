import dbConnect from '@/lib/dbConnect';
import Booking from '@/models/Booking';
import '@/models/Driver';
import '@/models/Route';
import '@/models/Trip';
import '@/models/Vehicle';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { identifier } = await request.json();

    if (
      !identifier ||
      typeof identifier !== 'string' ||
      identifier.trim() === ''
    ) {
      return NextResponse.json(
        { message: 'Search identifier is required' },
        { status: 400 }
      );
    }

    const trimmedIdentifier = identifier.trim();

    const query = {
      paymentStatus: 'paid',
      $or: [
        { bookingId: trimmedIdentifier },
        { 'passengers.email': trimmedIdentifier },
        { 'passengers.phoneNumber': trimmedIdentifier },
      ],
    };

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({
        path: 'trip',
        populate: [
          { path: 'route', select: 'name segments' },
          { path: 'vehicle', select: 'name plateNumber' },
        ],
      })
      .select(
        'bookingId passengers bookedSegments seatNumbers bookedAddOns totalCost trip createdAt paymentStatus'
      )
      .lean();

    if (!bookings || bookings.length === 0) {
      return NextResponse.json(
        { message: 'No matching bookings found.' },
        { status: 404 }
      );
    }

    return NextResponse.json(bookings, { status: 200 });
  } catch (error: any) {
    console.error('Find Booking API Error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}
