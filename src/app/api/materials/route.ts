import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Material from "@/models/Material";

export async function GET() {
  try {
    await connectDB();
    const materials = await Material.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ materials });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch materials" }, { status: 500 });
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

    const newMaterial = new Material(body);
    await newMaterial.save();

    return NextResponse.json({ message: "Material saved successfully", material: newMaterial });
  } catch (error) {
    console.error("Save Material Error:", error);
    return NextResponse.json({ error: "Failed to save material" }, { status: 500 });
  }
}
