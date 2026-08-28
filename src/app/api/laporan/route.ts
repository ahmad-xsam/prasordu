import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import LaporanKegiatan from "@/models/LaporanKegiatan";

export async function GET() {
  try {
    await connectDB();
    const laporanList = await LaporanKegiatan.find({}).sort({ urutan: 1, createdAt: 1 });
    return NextResponse.json({ laporan: laporanList });
  } catch (error: any) {
    console.error("GET /api/laporan error:", error);
    return NextResponse.json({ error: "Gagal mengambil data laporan" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 403 });
    }

    const body = await req.json();
    const { hariTanggal, uraianKegiatan, foto1, foto2, bulan, tahunPelajaran, urutan } = body;

    if (!hariTanggal || !uraianKegiatan) {
      return NextResponse.json({ error: "Hari/Tanggal dan Uraian Kegiatan wajib diisi" }, { status: 400 });
    }

    await connectDB();

    const newLaporan = await LaporanKegiatan.create({
      hariTanggal,
      uraianKegiatan,
      foto1: foto1 || "",
      foto2: foto2 || "",
      bulan: bulan || "AGUSTUS",
      tahunPelajaran: tahunPelajaran || "2026-2027",
      urutan: typeof urutan === "number" ? urutan : 0,
      createdBy: (session.user as any)?.username || session.user?.name || "Admin",
    });

    return NextResponse.json({ message: "Berhasil menambahkan laporan kegiatan", laporan: newLaporan }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/laporan error:", error);
    return NextResponse.json({ error: "Gagal menambahkan laporan" }, { status: 500 });
  }
}
