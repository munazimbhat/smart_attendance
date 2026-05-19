import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId } = await params;

    // Get total distinct dates the student has attendance records for
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: studentId,
      },
    });

    const presentDays = attendanceRecords.filter((r) => r.status === "PRESENT").length;
    const absentDays = attendanceRecords.filter((r) => r.status === "ABSENT").length;
    const lateDays = attendanceRecords.filter((r) => r.status === "LATE").length;

    // For simplicity, total classes is the sum of records
    const totalClasses = presentDays + absentDays + lateDays;

    const percentage = totalClasses > 0 ? ((presentDays + lateDays) / totalClasses) * 100 : 0;

    return NextResponse.json({
      totalClasses,
      presentDays,
      absentDays,
      lateDays,
      percentage,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
