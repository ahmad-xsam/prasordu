import { NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, phone, password } = await req.json();

    if (!firstName || !email || !password) {
      return NextResponse.json(
        { message: "First Name, Email, and Password are required." },
        { status: 400 }
      );
    }

    const name = `${firstName} ${lastName || ""}`.trim();

    await connectMongoDB();

    const existingUser = await User.findOne({ username: email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already registered." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      username: email, // Using email as username
      password: hashedPassword,
      role: "USER", // Default role
    });

    return NextResponse.json(
      { message: "User registered successfully." },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during registration:", error);
    return NextResponse.json(
      { message: "An error occurred during registration." },
      { status: 500 }
    );
  }
}
