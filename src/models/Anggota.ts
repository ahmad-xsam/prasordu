import mongoose, { Schema, Document } from 'mongoose';

export interface IAnggota extends Document {
  nta?: string;
  nama: string;
  jenisKelamin: 'Putra' | 'Putri';
  tempatLahir: string;
  tanggalLahir: Date;
  agama: string;
  kelas: string;
  jabatan: string;
  namaOrangtua: string;
  pekerjaanOrangtua: string;
  alamat: string;
  tanggalMasuk: Date;
  keterangan?: string;
  namaRegu: string;
}

const AnggotaSchema: Schema = new Schema({
  nta: { type: String },
  nama: { type: String, required: true, index: true },
  jenisKelamin: { type: String, enum: ['Putra', 'Putri'], default: 'Putra', required: true },
  tempatLahir: { type: String, required: true, default: '-' },
  tanggalLahir: { type: Date, required: true },
  agama: { type: String, required: true, default: 'Islam' },
  kelas: { type: String, required: true, index: true },
  jabatan: { type: String, required: true },
  namaOrangtua: { type: String, required: true, default: '-' },
  pekerjaanOrangtua: { type: String, required: true, default: '-' },
  alamat: { type: String, required: true, default: '-' },
  tanggalMasuk: { type: Date, required: true, default: Date.now },
  keterangan: { type: String },
  namaRegu: { type: String, default: '-' },
}, {
  timestamps: true,
});

AnggotaSchema.index({ createdAt: -1 });

export default mongoose.models.Anggota || mongoose.model<IAnggota>('Anggota', AnggotaSchema);
