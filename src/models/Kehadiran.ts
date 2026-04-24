import mongoose, { Schema, Document } from 'mongoose';

export interface IKehadiran extends Document {
  tanggal: Date;
  anggotaId: mongoose.Types.ObjectId;
  status: string;
  semester: number;
}

const KehadiranSchema: Schema = new Schema({
  tanggal: { type: Date, required: true },
  anggotaId: { type: Schema.Types.ObjectId, ref: 'Anggota', required: true },
  status: { type: String, required: true, enum: ['HADIR', 'SAKIT', 'IZIN', 'ALPA'] },
  semester: { type: Number, required: true, enum: [1, 2] },
}, {
  timestamps: true,
});

export default mongoose.models.Kehadiran || mongoose.model<IKehadiran>('Kehadiran', KehadiranSchema);
