import { Schema, model, models, Document } from 'mongoose';

export interface IAddOn extends Document {
  name: string;
  description: string;
  price: number;
  icon?: string;
  pricingType: 'per-passenger' | 'per-booking';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddOnSchema = new Schema<IAddOn>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    icon: {
      type: String,
    },
    pricingType: {
      type: String,
      enum: ['per-passenger', 'per-booking'],
      default: 'per-booking',
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default models.AddOn || model<IAddOn>('AddOn', AddOnSchema);
