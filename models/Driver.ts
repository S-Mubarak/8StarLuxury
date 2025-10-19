import { Schema, model, models, Document } from 'mongoose';

export interface IDriver extends Document {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  licenseNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export default models.Driver || model<IDriver>('Driver', DriverSchema);
