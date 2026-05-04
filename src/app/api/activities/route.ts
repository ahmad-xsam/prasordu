import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Activity from "@/models/Activity";

export async function GET() {
  try {
    await connectDB();
    const activities = await Activity.find({}).sort({ date: 1 });
    return NextResponse.json({ activities });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
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
    
    const activity = await Activity.create({
      ...body,
      createdBy: session.user?.email
    });

    return NextResponse.json({ message: "Activity created", activity });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
