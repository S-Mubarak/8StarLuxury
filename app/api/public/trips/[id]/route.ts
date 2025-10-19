import dbConnect from '@/lib/dbConnect';
import '@/models/Route';
import Trip from '@/models/Trip';
import '@/models/Vehicle';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  await dbConnect();

  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid Trip ID' }, { status: 400 });
    }

    const trip = await Trip.findById(id)
      .populate('route')
      .populate('vehicle', 'name amenities capacity bookedSeats');

    if (!trip || trip.status !== 'scheduled') {
      return NextResponse.json(
        { message: 'Trip not found or is no longer available' },
        { status: 404 }
      );
    }

    const tripData = trip.toObject();
    tripData.vehicle.bookedSeats = trip.bookedSeats;

    return NextResponse.json(tripData, { status: 200 });
  } catch (error) {
    console.error('Error fetching public trip:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
