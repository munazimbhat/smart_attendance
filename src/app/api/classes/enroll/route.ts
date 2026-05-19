import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const { studentId, classId } = await request.json();

    if (!studentId || !classId) {
      return NextResponse.json(
        { error: "studentId and classId are required" },
        { status: 400 }
      );
    }

    const enrollment = await prisma.studentClass.upsert({
      where: {
        studentId_classId: {
          studentId,
          classId,
        },
      },
      update: {},
      create: {
        studentId,
        classId,
      },
    });

    return NextResponse.json(enrollment, { status: 201 });
  } catch (error) {
    console.error("Enroll student error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
