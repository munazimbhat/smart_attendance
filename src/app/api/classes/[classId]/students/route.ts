import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const students = await prisma.studentClass.findMany({
      where: { classId: classId },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return NextResponse.json(
      students.map((sc) => ({
        id: sc.student.id,
        email: sc.student.email,
        name: `${sc.student.firstName} ${sc.student.lastName}`,
        avatar: sc.student.avatar,
      }))
    );
  } catch (error) {
    console.error("Get class students error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
