import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/mongodb';
import MateriPramuka from '@/models/MateriPramuka';

export async function GET(request: Request, { params }: { params: { bab: string } }) {
  try {
    await dbConnect();
    const materi = await MateriPramuka.findOne({ bab: parseInt(params.bab) }).lean();
    if (!materi) {
      return NextResponse.json({ success: false, error: 'Materi tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: materi });
  } catch (error) {
    console.error("API GET Materi by BAB Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 400 });
  }
}
