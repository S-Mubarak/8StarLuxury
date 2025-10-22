import { Schema, model, models, Document } from 'mongoose';

export type CarType = 'sedan' | 'suv' | 'van' | 'compact' | 'luxury';
const carTypes: CarType[] = ['sedan', 'suv', 'van', 'compact', 'luxury'];
export interface IVehicle extends Document {
  name: string;
  plateNumber: string;
  capacity: number;
  amenities: string[];
  carType: CarType;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    name: {
      type: String,
      required: true,
    },
    plateNumber: {
      type: String,
      required: true,
      unique: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    carType: {
      type: String,
      enum: carTypes,
      required: true,
      default: 'suv',
    },
    amenities: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export default models.Vehicle || model<IVehicle>('Vehicle', VehicleSchema);
