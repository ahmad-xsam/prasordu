import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import dbConnect from '@/lib/mongodb';
import Kehadiran from '@/models/Kehadiran';

export async function GET() {
  try {
    await dbConnect();

    const leaderboard = await Kehadiran.aggregate([
      {
        $group: {
          _id: "$anggotaId",
          totalNabung: { $sum: "$jumlahNabung" }
        }
      },
      {
        $lookup: {
          from: "anggotas", // Mongoose pluralizes model name "Anggota" to "anggotas"
          localField: "_id",
          foreignField: "_id",
          as: "anggotaInfo"
        }
      },
      {
        $unwind: "$anggotaInfo"
      },
      {
        $project: {
          _id: 1,
          nama: "$anggotaInfo.nama",
          kelas: "$anggotaInfo.kelas",
          totalNabung: 1
        }
      },
      {
        $sort: { totalNabung: -1 }
      },
      {
        $limit: 3
      }
    ]);

    return NextResponse.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error("API GET Error (Tabungan Leaderboard):", error);
    return NextResponse.json({ success: false, error: 'Failed to fetch tabungan leaderboard' }, { status: 500 });
  }
}
