import dbConnect from '@/lib/dbConnect';
import Route from '@/models/Route';
import { NextResponse } from 'next/server';

export async function GET() {
  await dbConnect();
  try {
    const origins = await Route.distinct('segments.origin');

    return NextResponse.json(origins.sort(), { status: 200 });
  } catch (error) {
    console.error('Error fetching origins:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
