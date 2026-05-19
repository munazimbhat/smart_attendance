import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function POST(request: NextRequest) {
  try {
    const { registrationNumber } = await request.json();

    if (!registrationNumber || registrationNumber.trim() === "") {
      return NextResponse.json(
        { error: "Registration number is required" },
        { status: 400 }
      );
    }

    // Find user by registration number
    const user = await prisma.user.findUnique({
      where: { registrationNumber: registrationNumber.trim() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this registration number" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`,
    });
  } catch (error) {
    console.error("Identify error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
