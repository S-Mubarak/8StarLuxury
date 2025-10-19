import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import dbConnect from '@/lib/dbConnect';
import AddOn from '@/models/AddOn';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

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
    const { name, description, price, icon, isActive, pricingType } = body;

    if (
      !name ||
      !description ||
      price == null ||
      isActive == null ||
      !pricingType
    ) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    const updatedAddOn = await AddOn.findByIdAndUpdate(
      id,
      { name, description, price, icon, isActive, pricingType },
      { new: true, runValidators: true }
    );

    if (!updatedAddOn) {
      return NextResponse.json(
        { message: 'Add-on not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedAddOn, { status: 200 });
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

    const deletedAddOn = await AddOn.findByIdAndDelete(id);

    if (!deletedAddOn) {
      return NextResponse.json(
        { message: 'Add-on not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: 'Add-on deleted successfully' },
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
