import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/dbConnect';
import Booking from '@/models/Booking';
import Trip from '@/models/Trip';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    const hash = crypto
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY as string)
      .update(body)
      .digest('hex');

    if (hash !== signature) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { message: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);
    console.log('Paystack Webhook Event:', event.event);

    if (event.event === 'charge.success') {
      const { reference, amount } = event.data;

      const booking = await Booking.findOne({ bookingId: reference });

      if (!booking) {
        console.error(`Booking not found for reference: ${reference}`);
        return NextResponse.json(
          { message: 'Booking not found' },
          { status: 404 }
        );
      }

      const expectedAmount = Math.round(booking.totalCost * 100);
      if (amount !== expectedAmount) {
        console.error(
          `Amount mismatch: Expected ${expectedAmount}, got ${amount}`
        );
        return NextResponse.json(
          { message: 'Amount mismatch' },
          { status: 400 }
        );
      }

      if (booking.paymentStatus !== 'paid') {
        booking.paymentStatus = 'paid';
        booking.paymentRef = reference;
        await booking.save();

        const trip = await Trip.findById(booking.trip);
        if (trip && booking.seatNumbers && booking.seatNumbers.length > 0) {
          const newSeats = booking.seatNumbers.filter(
            (seat) => !trip.bookedSeats.includes(seat)
          );
          if (newSeats.length > 0) {
            trip.bookedSeats.push(...newSeats);
            await trip.save();
          }
        }

        console.log(`✅ Payment confirmed for booking: ${reference}`);

        try {
          await fetch(`${process.env.NEXTAUTH_URL}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId: reference }),
          });
          console.log(`📧 Confirmation email sent for: ${reference}`);
        } catch (emailError) {
          console.error('Failed to send email:', emailError);
        }
      }

      return NextResponse.json({ message: 'Webhook processed' });
    }

    if (event.event === 'charge.failed') {
      const { reference } = event.data;

      const booking = await Booking.findOne({ bookingId: reference });
      if (booking && booking.paymentStatus === 'pending') {
        booking.paymentStatus = 'failed';
        await booking.save();
        console.log(`❌ Payment failed for booking: ${reference}`);
      }

      return NextResponse.json({ message: 'Webhook processed' });
    }

    return NextResponse.json({ message: 'Event not handled' });
  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json(
      { message: 'Webhook processing failed', error: error.message },
      { status: 500 }
    );
  }
}
