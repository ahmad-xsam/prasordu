import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    await connectMongoDB();
    
    // Check if any user exists
    const usersCount = await User.countDocuments();
    if (usersCount > 0) {
      return NextResponse.json({ message: "Sistem sudah diinisialisasi." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const admin = await User.create({
      name: "Super Admin",
      username: "admin",
      password: hashedPassword,
      role: "ADMIN",
    });

    return NextResponse.json(
      { message: "Admin pertama berhasil dibuat", username: "admin", password: "admin123" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat setup" },
      { status: 500 }
    );
  }
}
