import { Schema, model, models, Document } from 'mongoose';

export interface IVehicle extends Document {
  name: string;
  plateNumber: string;
  capacity: number;
  amenities: string[];
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
    amenities: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export default models.Vehicle || model<IVehicle>('Vehicle', VehicleSchema);
