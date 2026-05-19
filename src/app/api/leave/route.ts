import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leaveType, reason, startDate, endDate, numberOfDays, documentUrl } =
      await request.json();

    const studentId = (session.user as any).id;

    // Check leave limit (max 15 per semester)
    const leaveCount = await prisma.leave.count({
      where: {
        studentId,
        status: "APPROVED",
      },
    });

    if (leaveCount >= 15) {
      return NextResponse.json(
        { error: "Maximum leave limit (15) reached" },
        { status: 400 }
      );
    }

    const leave = await prisma.leave.create({
      data: {
        studentId,
        leaveType,
        reason,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        numberOfDays,
        documentUrl,
        status: "PENDING",
      },
    });

    return NextResponse.json(leave, { status: 201 });
  } catch (error) {
    console.error("Create leave error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const studentId = searchParams.get("studentId");

    const where: any = {};
    if (status) where.status = status;
    if (studentId) where.studentId = studentId;

    const leaves = await prisma.leave.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leaves);
  } catch (error) {
    console.error("Get leaves error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
