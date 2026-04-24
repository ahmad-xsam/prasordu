import mongoose, { Schema, Document } from 'mongoose';

export interface IInventaris extends Document {
  namaBarang: string;
  merkType: string;
  kodeBarang: string;
  jumlah: number;
  harga: number;
  pengadaan: string;
  kondisi: string;
}

const InventarisSchema: Schema = new Schema({
  namaBarang: { type: String, required: true },
  merkType: { type: String, required: true },
  kodeBarang: { type: String, required: true },
  jumlah: { type: Number, required: true },
  harga: { type: Number, required: true },
  pengadaan: { type: String, required: true },
  kondisi: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Inventaris || mongoose.model<IInventaris>('Inventaris', InventarisSchema);
