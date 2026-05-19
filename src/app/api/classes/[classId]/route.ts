import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Update a class
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    
    if (role !== "ADMIN" && role !== "HOD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { classId } = await params;
    const { name, section, subject, semester, teacherId } = await request.json();

    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: {
        name,
        section,
        subject,
        semester,
        teacherId,
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error("Update class error:", error);
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    );
  }
}

// Delete a class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    
    if (role !== "ADMIN" && role !== "HOD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { classId } = await params;

    // Delete student enrollments first
    await prisma.studentClass.deleteMany({
      where: { classId },
    });

    // Delete attendance records for this class
    await prisma.attendance.deleteMany({
      where: {
        studentClass: {
          classId,
        },
      },
    });

    // Delete the class
    await prisma.class.delete({
      where: { id: classId },
    });

    return NextResponse.json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Delete class error:", error);
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    );
  }
}
