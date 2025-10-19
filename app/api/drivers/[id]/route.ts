import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Driver from '@/models/Driver';
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
    const { firstName, lastName, phoneNumber, licenseNumber } = body;

    if (!firstName || !lastName || !phoneNumber || !licenseNumber) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingDriver = await Driver.findOne({
      $or: [{ phoneNumber }, { licenseNumber }],
      _id: { $ne: id },
    });
    if (existingDriver) {
      return NextResponse.json(
        {
          message:
            'Another driver with this phone or license number already exists',
        },
        { status: 409 }
      );
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
      id,
      { firstName, lastName, phoneNumber, licenseNumber },
      { new: true, runValidators: true }
    );

    if (!updatedDriver) {
      return NextResponse.json(
        { message: 'Driver not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedDriver, { status: 200 });
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

    // TODO: Add check - don't delete driver if assigned to an upcoming trip.

    const deletedDriver = await Driver.findByIdAndDelete(id);

    if (!deletedDriver) {
      return NextResponse.json(
        { message: 'Driver not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Driver deleted successfully' },
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
