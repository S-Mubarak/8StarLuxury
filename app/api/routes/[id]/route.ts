import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import Route, { ISegment } from '@/models/Route';
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
    const route = await Route.findById(id);
    if (!route) {
      return NextResponse.json({ message: 'Route not found' }, { status: 404 });
    }
    return NextResponse.json(route, { status: 200 });
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

    const updatedRoute = await Route.findByIdAndUpdate(
      id,
      { name, segments, isFeatured, imageUrl },
      { new: true, runValidators: true }
    );

    if (!updatedRoute) {
      return NextResponse.json({ message: 'Route not found' }, { status: 404 });
    }

    return NextResponse.json(updatedRoute, { status: 200 });
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

    // TODO: Add check - don't delete route if assigned to an upcoming trip.

    const deletedRoute = await Route.findByIdAndDelete(id);

    if (!deletedRoute) {
      return NextResponse.json({ message: 'Route not found' }, { status: 404 });
    }

    return NextResponse.json(
      { message: 'Route deleted successfully' },
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
