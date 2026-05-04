import mongoose, { Schema, Document } from "mongoose";

export interface IMissionResult extends Document {
  fullName: string;
  squadName: string;
  squadType: 'Putra' | 'Putri';
  weaponName: string;
  levelNumber: number;
  score: number;
  completedAt: Date;
}

const MissionResultSchema = new Schema<IMissionResult>({
  fullName: { type: String, required: true },
  squadName: { type: String, required: true },
  squadType: { type: String, enum: ['Putra', 'Putri'], required: true },
  weaponName: { type: String, required: true },
  levelNumber: { type: Number, required: true },
  score: { type: Number, required: true },
  completedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.MissionResult || mongoose.model<IMissionResult>("MissionResult", MissionResultSchema);
