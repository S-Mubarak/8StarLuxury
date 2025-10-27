import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Trip from '@/models/Trip';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import '@/models/Route';
import '@/models/Vehicle';
import '@/models/Driver';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const body = await request.json();
    const { route, vehicle, driver, departureTime, status } = body;

    if (!route || !vehicle || !driver || !departureTime) {
      return NextResponse.json(
        { message: 'Route, vehicle, driver, and departure time are required' },
        { status: 400 }
      );
    }

    const newTrip = new Trip({
      route,
      vehicle,
      driver,
      departureTime,
      status: status || 'scheduled',
    });

    const savedTrip = await newTrip.save();

    return NextResponse.json(savedTrip, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const trips = await Trip.find()
      .populate('route', 'name')
      .populate('vehicle', 'name plateNumber')
      .populate('driver', 'firstName lastName')
      .sort({ departureTime: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const totalCount = await Trip.countDocuments();

    return NextResponse.json(
      {
        data: trips,
        pagination: {
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          limit,
        },
      },
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
