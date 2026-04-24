import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Anggota from '@/models/Anggota';

export async function GET() {
  try {
    await dbConnect();
    const anggota = await Anggota.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: anggota });
  } catch (error) {
    console.error("API GET Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const anggota = await Anggota.create(body);
    return NextResponse.json({ success: true, data: anggota }, { status: 201 });
  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json({ success: false, error: 'Failed to create data' }, { status: 400 });
  }
}
