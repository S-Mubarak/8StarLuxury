import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Driver from '@/models/Driver';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
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
    });
    if (existingDriver) {
      return NextResponse.json(
        {
          message:
            'A driver with this phone number or license number already exists',
        },
        { status: 409 }
      );
    }

    const newDriver = new Driver({
      firstName,
      lastName,
      phoneNumber,
      licenseNumber,
    });
    const savedDriver = await newDriver.save();

    return NextResponse.json(savedDriver, { status: 201 });
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

    const drivers = await Driver.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    const totalCount = await Driver.countDocuments();

    return NextResponse.json(
      {
        data: drivers,
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
