import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    if (userRole === "ADMIN") {
      // Admin sees all stats across the system
      const [totalUsers, totalClasses, attendanceRecords] = await Promise.all([
        prisma.user.count(),
        prisma.class.count(),
        prisma.attendance.findMany(),
      ]);

      const attendanceRate =
        attendanceRecords.length > 0
          ? (
              (attendanceRecords.filter((a) => a.status === "PRESENT").length /
                attendanceRecords.length) *
              100
            ).toFixed(1)
          : "0";

      return NextResponse.json({
        totalUsers,
        totalClasses,
        attendanceRate: `${attendanceRate}%`,
        securityAlerts: 0,
      });
    }

    if (userRole === "HOD") {
      // HOD sees stats for their department
      const hod = await prisma.user.findUnique({
        where: { id: userId },
        select: { department: true },
      });

      const [students, teachers, classes, attendanceRecords] = await Promise.all([
        prisma.user.count({
          where: { role: "STUDENT", department: hod?.department },
        }),
        prisma.user.count({
          where: { role: "TEACHER", department: hod?.department },
        }),
        prisma.class.count({
          where: { department: hod?.department },
        }),
        prisma.attendance.findMany({
          where: {
            class: {
              department: hod?.department,
            },
          },
        }),
      ]);

      const attendanceRate =
        attendanceRecords.length > 0
          ? (
              (attendanceRecords.filter((a) => a.status === "PRESENT").length /
                attendanceRecords.length) *
              100
            ).toFixed(1)
          : "0";

      return NextResponse.json({
        totalStudents: students,
        totalTeachers: teachers,
        totalClasses: classes,
        attendanceRate: `${attendanceRate}%`,
      });
    }

    if (userRole === "TEACHER") {
      // Teacher sees stats for their classes
      const [myClasses, attendanceRecords, pendingLeaves] = await Promise.all([
        prisma.class.findMany({
          where: { teacherId: userId },
          include: {
            studentClasses: true,
          },
        }),
        prisma.attendance.findMany({
          where: {
            class: {
              teacherId: userId,
            },
          },
        }),
        prisma.leave.count({
          where: {
            status: "PENDING",
            student: {
              studentClasses: {
                some: {
                  class: {
                    teacherId: userId,
                  },
                },
              },
            },
          },
        }),
      ]);

      const totalStudents = myClasses.reduce(
        (sum, cls) => sum + cls.studentClasses.length,
        0
      );

      const avgAttendance =
        attendanceRecords.length > 0
          ? (
              (attendanceRecords.filter((a) => a.status === "PRESENT").length /
                attendanceRecords.length) *
              100
            ).toFixed(0)
          : "0";

      return NextResponse.json({
        myClassesCount: myClasses.length,
        totalStudents,
        avgAttendance: `${avgAttendance}%`,
        pendingLeaves,
      });
    }

    if (userRole === "STUDENT") {
      // Student sees their personal stats
      const [myClasses, attendanceRecords] = await Promise.all([
        prisma.studentClass.findMany({
          where: { studentId: userId },
          include: {
            class: {
              select: {
                id: true,
                name: true,
                subject: true,
                teacher: { select: { firstName: true, lastName: true } },
              },
            },
          },
        }),
        prisma.attendance.findMany({
          where: { studentId: userId },
        }),
      ]);

      const classesWithAttendance = myClasses.map((sc) => {
        const classAttendance = attendanceRecords.filter(
          (a) => a.classId === sc.classId
        );
        const presentCount = classAttendance.filter(
          (a) => a.status === "PRESENT"
        ).length;
        const attendancePercent =
          classAttendance.length > 0
            ? Math.round((presentCount / classAttendance.length) * 100)
            : 0;

        return {
          id: sc.class.id,
          name: sc.class.name,
          subject: sc.class.subject,
          instructor: `${sc.class.teacher?.firstName} ${sc.class.teacher?.lastName}`,
          attendance: attendancePercent,
        };
      });

      const overallAttendance =
        attendanceRecords.length > 0
          ? (
              (attendanceRecords.filter((a) => a.status === "PRESENT").length /
                attendanceRecords.length) *
              100
            ).toFixed(0)
          : "0";

      return NextResponse.json({
        classes: classesWithAttendance,
        overallAttendance: `${overallAttendance}%`,
        classCount: myClasses.length,
      });
    }

    return NextResponse.json(
      { error: "Unknown role" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
