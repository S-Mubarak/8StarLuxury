import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Vehicle from '@/models/Vehicle';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  //@ts-expect-error ???
  if (!(session?.user as any)?.role || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const body = await request.json();
    const { name, plateNumber, capacity, amenities } = body;

    if (!name || !plateNumber || !capacity) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingVehicle = await Vehicle.findOne({ plateNumber });
    if (existingVehicle) {
      return NextResponse.json(
        { message: 'A vehicle with this plate number already exists' },
        { status: 409 }
      );
    }

    const newVehicle = new Vehicle({
      name,
      plateNumber,
      capacity,
      amenities: amenities || [],
    });

    const savedVehicle = await newVehicle.save();

    return NextResponse.json(savedVehicle, { status: 201 });
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

  //@ts-expect-error ???
  if (!(session?.user as any)?.role || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const vehicles = await Vehicle.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const totalCount = await Vehicle.countDocuments();

    return NextResponse.json(
      {
        data: vehicles,
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
