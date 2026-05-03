import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import GameLevel from "@/models/GameLevel";

export async function GET() {
  try {
    await connectDB();
    const levels = await GameLevel.find({}).sort({ levelNumber: 1 });
    return NextResponse.json({ levels });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch levels" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    await connectDB();

    // Upsert level based on levelNumber
    const level = await GameLevel.findOneAndUpdate(
      { levelNumber: body.levelNumber },
      { ...body },
      { new: true, upsert: true }
    );

    return NextResponse.json({ message: "Level saved successfully", level });
  } catch (error) {
    console.error("Save Level Error:", error);
    return NextResponse.json({ error: "Failed to save level" }, { status: 500 });
  }
}
