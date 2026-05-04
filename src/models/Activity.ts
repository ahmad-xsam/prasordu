import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  title: string;
  description?: string;
  date: Date;
  type: 'ACADEMIC' | 'SCOUT' | 'OTHER';
  createdBy: string;
}

const ActivitySchema = new Schema<IActivity>({
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  type: { type: String, enum: ['ACADEMIC', 'SCOUT', 'OTHER'], default: 'SCOUT' },
  createdBy: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);
