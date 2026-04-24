import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/mongodb';
import Kehadiran from '@/models/Kehadiran';
// Ensure Anggota model is loaded for populate
import '@/models/Anggota'; 

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const semester = searchParams.get('semester');

    await dbConnect();
    
    let query = {};
    if (semester) {
      query = { semester: parseInt(semester) };
    }

    const kehadiran = await Kehadiran.find(query)
      .populate('anggotaId', 'nama kelas')
      .sort({ tanggal: -1, createdAt: -1 });
      
    return NextResponse.json({ success: true, data: kehadiran });
  } catch (error) {
    console.error("API GET Error (Kehadiran):", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const kehadiran = await Kehadiran.create(body);
    
    // Populate the newly created document before returning
    const populatedKehadiran = await Kehadiran.findById(kehadiran._id).populate('anggotaId', 'nama kelas');
    
    return NextResponse.json({ success: true, data: populatedKehadiran }, { status: 201 });
  } catch (error) {
    console.error("API POST Error (Kehadiran):", error);
    return NextResponse.json({ success: false, error: 'Failed to create data' }, { status: 400 });
  }
}
