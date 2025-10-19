import dbConnect from '@/lib/dbConnect';
import Route from '@/models/Route';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from');

  if (!from) {
    return NextResponse.json(
      { message: "Missing 'from' query parameter" },
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    const routes = await Route.find({ 'segments.origin': from });

    const destinations = new Set<string>();

    routes.forEach((route) => {
      let startIndex = -1;

      for (let i = 0; i < route.segments.length; i++) {
        if (route.segments[i].origin === from) {
          startIndex = i;
          break;
        }
      }

      if (startIndex !== -1) {
        for (let i = startIndex; i < route.segments.length; i++) {
          destinations.add(route.segments[i].destination);
        }
      }
    });

    return NextResponse.json(Array.from(destinations).sort(), { status: 200 });
  } catch (error) {
    console.error('Error fetching destinations:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
