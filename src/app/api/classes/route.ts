import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department");
    const semester = searchParams.get("semester");

    const where: any = {};
    if (department) where.department = department;
    if (semester) where.semester = parseInt(semester);

    // Filter by role
    const userRole = (session.user as any)?.role;
    const userId = (session.user as any)?.id;
    const userDepartment = (session.user as any)?.department;
    
    if (userRole === "TEACHER") {
      // Teachers see only their classes in their department
      where.teacherId = userId;
      where.department = userDepartment;
    } else if (userRole === "HOD") {
      // HODs see only their department's classes
      where.department = userDepartment;
    }
    // ADMIN sees all classes

    const classes = await prisma.class.findMany({
      where,
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        studentClasses: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(classes);
  } catch (error) {
    console.error("Get classes error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userRole = (session?.user as any)?.role;
    if (userRole !== "HOD" && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { name, section, subject, department, semester, teacherId } =
      await request.json();

    const newClass = await prisma.class.create({
      data: {
        name,
        section,
        subject,
        department,
        semester,
        teacherId,
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.error("Create class error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
