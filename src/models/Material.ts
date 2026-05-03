import mongoose, { Schema, Document } from "mongoose";

export interface IMaterial extends Document {
  title: string;
  category: string;
  imageUrl: string;
  content: string;
}

const MaterialSchema = new Schema<IMaterial>({
  title: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String },
  content: { type: String, required: true }
}, { timestamps: true });

export default mongoose.models.Material || mongoose.model<IMaterial>("Material", MaterialSchema);
