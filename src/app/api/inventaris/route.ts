import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Inventaris from '@/models/Inventaris';

export async function GET() {
  try {
    await dbConnect();
    const data = await Inventaris.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch data' }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const data = await Inventaris.create(body);
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create data' }, { status: 400 });
  }
}
