import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import AddOn from '@/models/AddOn';
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
    const { name, description, price, icon, isActive, pricingType } = body;

    if (!name || !description || price == null || !pricingType) {
      return NextResponse.json(
        { message: 'Name, description, price, and pricing type are required' },
        { status: 400 }
      );
    }

    const newAddOn = new AddOn({
      name,
      description,
      price,
      icon: icon || undefined,
      isActive: isActive ?? true,
      pricingType,
    });

    const savedAddOn = await newAddOn.save();

    return NextResponse.json(savedAddOn, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '1000');
    const skip = (page - 1) * limit;

    const showActiveOnly = searchParams.get('active') === 'true';
    const filter = showActiveOnly ? { isActive: true } : {};

    if (!showActiveOnly) {
      const session = await getServerSession(authOptions);
      if ((session?.user as any)?.role !== 'admin') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
    }

    const addons = await AddOn.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const totalCount = await AddOn.countDocuments(filter);

    return NextResponse.json(
      {
        data: addons,
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
