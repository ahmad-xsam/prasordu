import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import LaporanKegiatan from "@/models/LaporanKegiatan";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 403 });
    }

    const { id } = params;
    const body = await req.json();

    await connectDB();

    const updatedLaporan = await LaporanKegiatan.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedLaporan) {
      return NextResponse.json({ error: "Data laporan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "Berhasil memperbarui laporan", laporan: updatedLaporan });
  } catch (error: any) {
    console.error("PUT /api/laporan/[id] error:", error);
    return NextResponse.json({ error: "Gagal memperbarui laporan" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 403 });
    }

    const { id } = params;
    await connectDB();

    const deleted = await LaporanKegiatan.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Data laporan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ message: "Berhasil menghapus laporan" });
  } catch (error: any) {
    console.error("DELETE /api/laporan/[id] error:", error);
    return NextResponse.json({ error: "Gagal menghapus laporan" }, { status: 500 });
  }
}
