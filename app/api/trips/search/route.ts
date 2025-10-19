import dbConnect from '@/lib/dbConnect';
import '@/models/Driver';
import '@/models/Route';
import { IRoute } from '@/models/Route';
import Trip from '@/models/Trip';
import '@/models/Vehicle';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!from || !to) {
    return NextResponse.json(
      { message: "Missing 'from' or 'to' query parameters" },
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    const allFutureTrips = await Trip.find({
      status: 'scheduled',
      departureTime: { $gt: new Date() },
    }).populate([
      { path: 'route' },
      { path: 'vehicle', select: 'name amenities' },
      { path: 'driver', select: 'firstName lastName' },
    ]);

    const matchingTrips = allFutureTrips.filter((trip) => {
      const route = trip.route as IRoute;
      if (!route || !route.segments) return false;

      const segments = route.segments;
      let fromIndex = -1;

      for (let i = 0; i < segments.length; i++) {
        if (segments[i].origin === from) {
          fromIndex = i;
          break;
        }
      }

      if (fromIndex === -1) return false;

      for (let i = fromIndex; i < segments.length; i++) {
        if (segments[i].destination === to) {
          return true;
        }
      }

      return false;
    });

    return NextResponse.json(matchingTrips, { status: 200 });
  } catch (error) {
    console.error('Error searching trips:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
