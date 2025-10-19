import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Route, { ISegment } from '@/models/Route';
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
    const { name, segments, isFeatured, imageUrl } = body;

    if (
      !name ||
      !imageUrl ||
      !segments ||
      !Array.isArray(segments) ||
      segments.length === 0
    ) {
      return NextResponse.json(
        { message: 'Missing required fields or empty segments' },
        { status: 400 }
      );
    }

    for (const segment of segments as ISegment[]) {
      if (
        !segment.origin ||
        !segment.destination ||
        segment.cost == null ||
        !segment.mode
      ) {
        return NextResponse.json(
          { message: 'Invalid segment data' },
          { status: 400 }
        );
      }
    }

    const existingRoute = await Route.findOne({ name });
    if (existingRoute) {
      return NextResponse.json(
        { message: 'A route with this name already exists' },
        { status: 409 }
      );
    }

    const newRoute = new Route({ name, segments, isFeatured, imageUrl });
    const savedRoute = await newRoute.save();

    return NextResponse.json(savedRoute, { status: 201 });
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

    const routes = await Route.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
    const totalCount = await Route.countDocuments();

    return NextResponse.json(
      {
        data: routes,
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
