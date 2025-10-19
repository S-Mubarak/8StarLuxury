import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Booking from '@/models/Booking';
import '@/models/Driver';
import '@/models/Route';
import '@/models/Trip';
import '@/models/User';
import '@/models/Vehicle';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

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

    const bookings = await Booking.find()
      .populate({
        path: 'trip',
        populate: [
          { path: 'route', select: 'name' },
          { path: 'vehicle', select: 'name plateNumber' },
          { path: 'driver', select: 'firstName lastName' },
        ],
      })
      .populate('markedAsPaidBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const totalCount = await Booking.countDocuments();

    return NextResponse.json(
      {
        data: bookings,
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
