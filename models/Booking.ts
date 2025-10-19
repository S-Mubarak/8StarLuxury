import { Schema, model, models, Document } from 'mongoose';
import { ITrip } from './Trip';
import { IUser } from './User';

export interface ICustomer {
  title?: 'Mr' | 'Mrs' | 'Ms' | 'Miss';
  firstName: string;
  lastName: string;
  nationality?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth?: Date;
  documentType?: 'Passport' | 'NIN';
  idNumber?: string;
  phoneNumber: string;
  email: string;
}

export interface IBookedAddOn {
  name: string;
  price: number;
}

export interface IBooking extends Document {
  trip: Schema.Types.ObjectId | ITrip;
  bookingId: string;
  bookedSegments: {
    origin: string;
    destination: string;
  }[];

  passengers: ICustomer[];
  seatNumbers?: string[];

  bookedAddOns: IBookedAddOn[];
  totalCost: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'cancelled';
  paymentRef?: string;
  paymentMethod: 'paystack' | 'manual';
  markedAsPaidBy?: Schema.Types.ObjectId | IUser;
  createdAt: Date;
  updatedAt: Date;
}

const BookedAddOnSchema = new Schema<IBookedAddOn>(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
  },
  { _id: false }
);

const CustomerSchema = new Schema<ICustomer>(
  {
    title: { type: String, enum: ['Mr', 'Mrs', 'Ms', 'Miss'] },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    nationality: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    dateOfBirth: { type: Date },
    documentType: { type: String, enum: ['Passport', 'NIN'] },
    idNumber: { type: String },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true },
  },
  { _id: false }
);

const BookingSchema = new Schema<IBooking>(
  {
    trip: {
      type: Schema.Types.ObjectId,
      ref: 'Trip',
      required: true,
    },
    bookingId: {
      type: String,
      required: true,
      unique: true,
    },
    bookedSegments: [
      {
        origin: String,
        destination: String,
      },
    ],

    passengers: {
      type: [CustomerSchema],
      required: true,
      validate: [
        (val: ICustomer[]) => val.length > 0,
        'At least one passenger is required',
      ],
    },
    seatNumbers: {
      type: [String],
      default: [],
    },

    bookedAddOns: {
      type: [BookedAddOnSchema],
      default: [],
    },
    totalCost: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'cancelled'],
      default: 'pending',
    },
    paymentRef: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: ['paystack', 'manual'],
      default: 'paystack',
    },
    markedAsPaidBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  { timestamps: true }
);

export default models.Booking || model<IBooking>('Booking', BookingSchema);
