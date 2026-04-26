import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/mongodb';
import Kehadiran from '@/models/Kehadiran';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const body = await request.json();
    const kehadiran = await Kehadiran.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    }).populate('anggotaId', 'nama kelas').lean();
    
    if (!kehadiran) {
      return NextResponse.json({ success: false, error: 'Data not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: kehadiran });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update data' }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    const deletedKehadiran = await Kehadiran.deleteOne({ _id: params.id });
    if (!deletedKehadiran) {
      return NextResponse.json({ success: false, error: 'Data not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete data' }, { status: 400 });
  }
}
