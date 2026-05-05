import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/mongodb';
import Kehadiran from '@/models/Kehadiran';

export async function GET() {
  try {
    await dbConnect();

    // Use aggregation to sum up jumlahNabung grouped by anggotaId
    const totals = await Kehadiran.aggregate([
      {
        $group: {
          _id: "$anggotaId",
          totalNabung: { $sum: "$jumlahNabung" }
        }
      }
    ]);

    // Convert array of {_id, totalNabung} to a map for easy lookup on client
    // e.g., { "64abcd...": 150000, "64bcde...": 50000 }
    const totalsMap: Record<string, number> = {};
    totals.forEach(item => {
      if (item._id) {
        totalsMap[item._id.toString()] = item.totalNabung;
      }
    });

    return NextResponse.json({ success: true, data: totalsMap });
  } catch (error) {
    console.error("API GET Error (Tabungan Totals):", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tabungan totals' }, { status: 400 });
  }
}
