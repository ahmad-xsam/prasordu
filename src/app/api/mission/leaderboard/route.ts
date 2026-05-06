import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MissionResult from '@/models/MissionResult';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    
    // Aggregate to get sum of score per user
    const leaderboard = await MissionResult.aggregate([
      {
        $group: {
          _id: "$fullName",
          totalScore: { $sum: "$score" },
          missionsCompleted: { $sum: 1 },
          lastCompleted: { $max: "$completedAt" }
        }
      },
      {
        $project: {
          _id: 0,
          fullName: "$_id",
          totalScore: 1,
          missionsCompleted: 1,
          lastCompleted: 1
        }
      },
      {
        $sort: { totalScore: -1, lastCompleted: -1 }
      }
    ]);

    return NextResponse.json({ success: true, data: leaderboard });
  } catch (error) {
    console.error("Leaderboard error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem" },
      { status: 500 }
    );
  }
}
