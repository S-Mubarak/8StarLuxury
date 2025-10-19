import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Vehicle from '@/models/Vehicle';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  //@ts-expect-error ???
  if (!(session?.user as any)?.role || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return NextResponse.json(
        { message: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(vehicle, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const session = await getServerSession(authOptions);
  //@ts-expect-error ???
  if (!(session?.user as any)?.role || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, plateNumber, capacity, amenities } = body;

    if (!name || !plateNumber || !capacity) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingVehicle = await Vehicle.findOne({
      plateNumber,
      _id: { $ne: id },
    });
    if (existingVehicle) {
      return NextResponse.json(
        { message: 'Another vehicle with this plate number already exists' },
        { status: 409 }
      );
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      { name, plateNumber, capacity, amenities },
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return NextResponse.json(
        { message: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedVehicle, { status: 200 });
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
  //@ts-expect-error ???

  if (!(session?.user as any)?.role || (session.user as any).role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid ID' }, { status: 400 });
    }

    const deletedVehicle = await Vehicle.findByIdAndDelete(id);

    if (!deletedVehicle) {
      return NextResponse.json(
        { message: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Vehicle deleted successfully' },
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
