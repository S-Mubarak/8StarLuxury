import * as React from 'react';
import { IBooking } from '@/models/Booking';

interface EmailProps {
  booking: IBooking;
}

export const BookingConfirmationTicket: React.FC<Readonly<EmailProps>> = ({
  booking,
}) => {
  const leadPassenger = booking.passengers[0];
  const departureTime = new Date(booking.trip.departureTime);

  return (
    <div>
      <h1>Booking Confirmation - {booking.bookingId}</h1>
      <p>Dear {leadPassenger.firstName},</p>
      <p>
        Thank you for booking with 8 Star Luxury Travels! Your trip is
        confirmed.
      </p>
      <hr />
      <h2>Trip Details</h2>
      <p>
        <strong>Route:</strong> {booking.trip.route.name} (
        {booking.bookedSegments[0].origin} to{' '}
        {booking.bookedSegments[booking.bookedSegments.length - 1].destination})
      </p>
      <p>
        <strong>Departure:</strong>{' '}
        {departureTime.toLocaleString('en-US', {
          dateStyle: 'full',
          timeStyle: 'short',
        })}
      </p>
      <p>
        <strong>Vehicle:</strong> {booking.trip.vehicle.name} (
        {(booking.trip.vehicle as any).plateNumber}){' '}
        {/* Adjust type if needed */}
      </p>
      {booking.seatNumbers && booking.seatNumbers.length > 0 && (
        <p>
          <strong>Seat(s):</strong> {booking.seatNumbers.join(', ')}
        </p>
      )}
      <hr />
      <h2>Passenger(s)</h2>
      {booking.passengers.map((p: any, index: number) => (
        <p key={index}>
          {p.firstName} {p.lastName}{' '}
          {booking.seatNumbers?.[index]
            ? `(Seat: ${booking.seatNumbers[index]})`
            : ''}
        </p>
      ))}
      <hr />
      <h2>Payment Summary</h2>
      <p>
        <strong>Total Cost:</strong> ₦{booking.totalCost.toLocaleString()}
      </p>
      <p>
        <strong>Status:</strong> {booking.paymentStatus}
      </p>
      <p>
        <strong>Booking ID:</strong> {booking.bookingId}
      </p>
      <hr />
      <p>We look forward to travelling with you!</p>
      <p>
        Best Regards,
        <br />8 Star Luxury Travels Team
      </p>
    </div>
  );
};

export default BookingConfirmationTicket;
