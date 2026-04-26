import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/mongodb';
import MateriPramuka from '@/models/MateriPramuka';

export async function GET() {
  try {
    await dbConnect();
    const materi = await MateriPramuka.find({}).sort({ bab: 1 }).lean();
    return NextResponse.json({ success: true, data: materi });
  } catch (error) {
    console.error("API GET Materi Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Check if bab already exists
    const existing = await MateriPramuka.findOne({ bab: body.bab });
    if (existing) {
      return NextResponse.json({ success: false, error: 'BAB ini sudah ada' }, { status: 400 });
    }

    const materi = await MateriPramuka.create(body);
    return NextResponse.json({ success: true, data: materi }, { status: 201 });
  } catch (error: any) {
    console.error("API POST Materi Error:", error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to create data' }, { status: 400 });
  }
}
