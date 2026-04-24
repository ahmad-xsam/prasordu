import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Inventaris from '@/models/Inventaris';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await request.json();
    const data = await Inventaris.findByIdAndUpdate(params.id, body, { new: true, runValidators: true });
    if (!data) return NextResponse.json({ success: false, error: 'Data not found' }, { status: 404 });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update data' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const deleted = await Inventaris.deleteOne({ _id: params.id });
    if (!deleted) return NextResponse.json({ success: false, error: 'Data not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete data' }, { status: 400 });
  }
}
