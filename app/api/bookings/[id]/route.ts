import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Booking from '@/models/Booking';
import '@/models/Driver';
import '@/models/Route';
import '@/models/Trip';
import '@/models/User';
import '@/models/Vehicle';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
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

    const booking = await Booking.findById(id)
      .populate({
        path: 'trip',
        populate: [
          { path: 'route', select: 'name segments' },
          { path: 'vehicle', select: 'name plateNumber amenities' },
          { path: 'driver', select: 'firstName lastName' },
        ],
      })
      .populate('markedAsPaidBy', 'name email');

    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(booking, { status: 200 });
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
  const adminId = (session?.user as any)?.id;

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
    const { status } = body;

    if (!status || !['paid', 'cancelled'].includes(status)) {
      return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
    }

    const booking = await Booking.findById(id);
    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }

    const updateData: any = { paymentStatus: status };
    if (status === 'paid' && booking.paymentStatus === 'pending') {
      updateData.paymentMethod = 'manual';
      updateData.markedAsPaidBy = adminId;
    }

    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // TODO: Trigger email to user if status changed
    // if (status === 'paid' && booking.paymentStatus === 'pending') {
    //   await sendBookingConfirmationEmail(updatedBooking);
    // } else if (status === 'cancelled') {
    //   await sendCancellationEmail(updatedBooking);
    // }

    return NextResponse.json(updatedBooking, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
