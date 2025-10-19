import { Schema, model, models, Document } from 'mongoose';
import { IRoute } from './Route';
import { IVehicle } from './Vehicle';
import { IDriver } from './Driver';

export interface ITrip extends Document {
  route: Schema.Types.ObjectId | IRoute;
  vehicle: Schema.Types.ObjectId | IVehicle;
  driver: Schema.Types.ObjectId | IDriver;
  departureTime: Date;
  bookedSeats: string[];
  status: 'scheduled' | 'departed' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema = new Schema<ITrip>(
  {
    route: {
      type: Schema.Types.ObjectId,
      ref: 'Route',
      required: true,
    },
    vehicle: {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    departureTime: {
      type: Date,
      required: true,
    },
    bookedSeats: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['scheduled', 'departed', 'completed', 'cancelled'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

export default models.Trip || model<ITrip>('Trip', TripSchema);
