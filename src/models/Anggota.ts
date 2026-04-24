import mongoose, { Schema, Document } from 'mongoose';

export interface IAnggota extends Document {
  nama: string;
  tanggalLahir: Date;
  kelas: string;
  jabatan: string;
}

const AnggotaSchema: Schema = new Schema({
  nama: { type: String, required: true, index: true },
  tanggalLahir: { type: Date, required: true },
  kelas: { type: String, required: true, index: true },
  jabatan: { type: String, required: true },
}, {
  timestamps: true,
});

AnggotaSchema.index({ createdAt: -1 });

export default mongoose.models.Anggota || mongoose.model<IAnggota>('Anggota', AnggotaSchema);
