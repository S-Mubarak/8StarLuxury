import BookingConfirmationTicket from '@/emails/BookingConfirmationTicket';
import dbConnect from '@/lib/dbConnect';
import Booking from '@/models/Booking';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

import '@/models/Driver';
import '@/models/Route';
import '@/models/Trip';
import '@/models/Vehicle';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || 'onboarding@resend.dev';
const FROM_NAME = 'Acme';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { message: 'Booking ID is required' },
        { status: 400 }
      );
    }

    const booking = await Booking.findOne({ bookingId: bookingId })
      .populate({
        path: 'trip',
        populate: [
          { path: 'route', select: 'name segments' },
          { path: 'vehicle', select: 'name plateNumber capacity amenities' },
          { path: 'driver', select: 'firstName lastName phoneNumber' },
        ],
      })
      .lean();

    if (!booking) {
      return NextResponse.json(
        { message: 'Booking not found' },
        { status: 404 }
      );
    }
    //@ts-expect-error ???

    if (booking.paymentStatus !== 'paid') {
      return NextResponse.json(
        { message: 'Cannot send ticket for unpaid booking.' },
        { status: 400 }
      );
    }
    //@ts-expect-error ???

    const leadPassenger = booking.passengers[0];
    const toEmail = leadPassenger.email;

    if (!toEmail || !toEmail.includes('@')) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      );
    }
    //@ts-expect-error ???

    const subject = `Booking Confirmed - ${booking.bookingId} | ${FROM_NAME}`;

    console.log(`Sending email to: ${toEmail} for booking: ${bookingId}`);

    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [toEmail],
      subject: subject,
      //@ts-expect-error ???

      react: BookingConfirmationTicket({ booking }),

      reply_to: 'support@8starluxury.com',
    });

    if (error) {
      console.error('Resend Error:', error);
      return NextResponse.json(
        {
          message: 'Failed to send email',
          error: error.message,
          details: error,
        },
        { status: 500 }
      );
    }

    console.log('✅ Email sent successfully:', data);

    return NextResponse.json(
      {
        message: 'Email sent successfully',
        emailId: data?.id,
        to: toEmail,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Send Email API Error:', error);

    if (error instanceof mongoose.Error.CastError) {
      return NextResponse.json(
        { message: 'Invalid Booking ID format' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: 'Internal Server Error',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
