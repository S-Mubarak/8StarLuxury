import dbConnect from '@/lib/dbConnect';
import Booking from '@/models/Booking';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Payment reference is missing',
      },
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const verifyData = await verifyResponse.json();

    console.log('Paystack Verify Response:', verifyData);

    if (
      !verifyData.status ||
      !verifyData.data ||
      verifyData.data.status !== 'success'
    ) {
      return NextResponse.json(
        {
          status: 'failed',
          message:
            verifyData.data?.gateway_response ||
            verifyData.message ||
            'Payment not successful',
        },
        { status: 200 }
      );
    }

    const booking = await Booking.findOne({ bookingId: reference });

    if (!booking) {
      console.error(`Booking not found for reference: ${reference}`);
      return NextResponse.json(
        {
          status: 'error',
          message: 'Booking not found. Please contact support.',
        },
        { status: 404 }
      );
    }

    if (booking.paymentStatus !== 'paid') {
      console.warn(
        `Paystack verified, but DB status is '${booking.paymentStatus}' for ${reference}. Updating now...`
      );

      booking.paymentStatus = 'paid';
      booking.paymentRef = reference;
      await booking.save();

      try {
        await fetch(`${process.env.NEXTAUTH_URL}/api/send-ticket`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bookingId: reference }),
        });
        console.log(`📧 Confirmation email sent for: ${reference}`);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail verification if email fails
      }
    }

    return NextResponse.json(
      {
        status: 'success',
        message: 'Payment verified successfully',
        bookingId: reference,
        amount: verifyData.data.amount / 100,
        customerEmail: verifyData.data.customer?.email,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Payment Verification Error:', error);

    return NextResponse.json(
      {
        status: 'error',
        message: 'Could not verify payment. Please contact support.',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
