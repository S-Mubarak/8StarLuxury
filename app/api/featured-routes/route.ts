import dbConnect from '@/lib/dbConnect';
import Route from '@/models/Route';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '6');

    const featuredRoutes = await Route.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(limit);

    return NextResponse.json(featuredRoutes, { status: 200 });
  } catch (error) {
    console.error('Error fetching featured routes:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
