import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { name, username, password, role } = await req.json();

    if (!name || !username || !password) {
      return NextResponse.json(
        { message: "Semua field harus diisi" },
        { status: 400 }
      );
    }

    await connectMongoDB();

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { message: "Username sudah digunakan" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      username,
      password: hashedPassword,
      role: role || "USER",
    });

    return NextResponse.json(
      { message: "User berhasil dibuat", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/users", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    await connectMongoDB();
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
