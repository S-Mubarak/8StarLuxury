import { Schema, model, models, Document } from 'mongoose';

export interface ISegment {
  origin: string;
  destination: string;
  cost: number;
  mode: 'road' | 'air';
  durationEstimate?: string;
}

export interface IRoute extends Document {
  name: string;
  segments: ISegment[];
  isFeatured: boolean;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const SegmentSchema = new Schema<ISegment>(
  {
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    cost: { type: Number, required: true },
    mode: { type: String, enum: ['road', 'air'], required: true },
    durationEstimate: { type: String },
  },
  { _id: false }
);

const RouteSchema = new Schema<IRoute>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    segments: [SegmentSchema],
    isFeatured: {
      type: Boolean,
      default: false,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default models.Route || model<IRoute>('Route', RouteSchema);
