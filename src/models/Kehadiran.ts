import mongoose, { Schema, Document } from 'mongoose';

export interface IKehadiran extends Document {
  tanggal: Date;
  anggotaId: mongoose.Types.ObjectId;
  status: string;
  semester: number;
}

const KehadiranSchema: Schema = new Schema({
  tanggal: { type: Date, required: true, index: true },
  anggotaId: { type: Schema.Types.ObjectId, ref: 'Anggota', required: true, index: true },
  status: { type: String, required: true, enum: ['HADIR', 'SAKIT', 'IZIN', 'ALPA'] },
  semester: { type: Number, required: true, index: true },
}, {
  timestamps: true,
});

KehadiranSchema.index({ tanggal: -1, createdAt: -1 });

export default mongoose.models.Kehadiran || mongoose.model<IKehadiran>('Kehadiran', KehadiranSchema);
