import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Trip from '@/models/Trip';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const { route, vehicle, driver, departureTime, status, bookedSeats } = body;

    if (!route || !vehicle || !driver || !departureTime || !status) {
      return NextResponse.json(
        {
          message:
            'Route, vehicle, driver, departure time, and status are required',
        },
        { status: 400 }
      );
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    if (trip.bookedSeats.length > 0) {
      if (
        trip.route.toString() !== route ||
        trip.vehicle.toString() !== vehicle ||
        new Date(trip.departureTime).toISOString() !==
          new Date(departureTime).toISOString()
      ) {
        return NextResponse.json(
          {
            message:
              'Cannot change route, vehicle, or departure time for a trip with existing bookings. You can only change the status or driver.',
          },
          { status: 409 }
        );
      }
    }

    const updatedTrip = await Trip.findByIdAndUpdate(
      id,
      { route, vehicle, driver, departureTime, status, bookedSeats },
      { new: true, runValidators: true }
    );

    return NextResponse.json(updatedTrip, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const trip = await Trip.findById(id);
    if (trip && trip.bookedSeats.length > 0) {
      return NextResponse.json(
        {
          message:
            'Cannot delete a trip with existing bookings. Please cancel it instead.',
        },
        { status: 409 }
      );
    }

    const deletedTrip = await Trip.findByIdAndDelete(id);
    if (!deletedTrip) {
      return NextResponse.json({ message: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Trip deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
