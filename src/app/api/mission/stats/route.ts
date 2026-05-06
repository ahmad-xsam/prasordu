import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import MissionResult from '@/models/MissionResult';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await dbConnect();
    
    // Count total users
    const totalUsers = await User.countDocuments({ role: 'USER' });
    
    // Count users who have completed at least one mission
    const playersObj = await MissionResult.aggregate([
      { $group: { _id: "$fullName" } },
      { $count: "count" }
    ]);
    
    const playersCount = playersObj.length > 0 ? playersObj[0].count : 0;
    
    const percentage = totalUsers > 0 ? Math.round((playersCount / totalUsers) * 100) : 0;

    return NextResponse.json({ 
      success: true, 
      data: {
        totalUsers,
        playersCount,
        percentage
      } 
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem" },
      { status: 500 }
    );
  }
}
