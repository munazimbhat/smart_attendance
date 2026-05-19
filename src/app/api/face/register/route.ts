import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, embedding, imageUrl } = await request.json();

    if (!userId || !embedding) {
      return NextResponse.json(
        { error: "userId and embedding are required" },
        { status: 400 }
      );
    }

    // Upsert the face registration for the student
    const faceRegistration = await prisma.faceRegistration.upsert({
      where: { userId },
      update: {
        embedding,
        imageUrl: imageUrl || null,
        quality: 95.0,
        registeredAt: new Date(),
      },
      create: {
        userId,
        embedding,
        imageUrl: imageUrl || null,
        quality: 95.0,
      },
    });

    return NextResponse.json(
      { success: true, id: faceRegistration.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Face register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
