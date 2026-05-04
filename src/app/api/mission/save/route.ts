import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MissionResult from "@/models/MissionResult";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, squadName, squadType, weaponName, levelNumber, score } = body;

    if (!fullName || !squadName || !levelNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectDB();
    
    const result = await MissionResult.create({
      fullName,
      squadName,
      squadType,
      weaponName,
      levelNumber,
      score,
      completedAt: new Date()
    });

    return NextResponse.json({ message: "Mission result saved", result });
  } catch (error) {
    console.error("Save Mission Result Error:", error);
    return NextResponse.json({ error: "Failed to save result" }, { status: 500 });
  }
}
