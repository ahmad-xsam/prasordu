import mongoose, { Schema, Document } from "mongoose";

export interface ILaporanKegiatan extends Document {
  hariTanggal: string;
  uraianKegiatan: string;
  foto1?: string;
  foto2?: string;
  bulan: string;
  tahunPelajaran: string;
  urutan: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const LaporanKegiatanSchema = new Schema<ILaporanKegiatan>(
  {
    hariTanggal: { type: String, required: true },
    uraianKegiatan: { type: String, required: true },
    foto1: { type: String, default: "" },
    foto2: { type: String, default: "" },
    bulan: { type: String, default: "AGUSTUS" },
    tahunPelajaran: { type: String, default: "2026-2027" },
    urutan: { type: Number, default: 0 },
    createdBy: { type: String, default: "Admin" },
  },
  { timestamps: true }
);

export default mongoose.models.LaporanKegiatan ||
  mongoose.model<ILaporanKegiatan>("LaporanKegiatan", LaporanKegiatanSchema);
