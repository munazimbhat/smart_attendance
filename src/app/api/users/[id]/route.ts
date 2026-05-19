import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    
    if (role !== "ADMIN" && role !== "HOD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Delete in cascade - delete all related records first
    try {
      // Delete face registrations
      await prisma.faceRegistration.deleteMany({
        where: { userId: id },
      });

      // Delete attendance records
      await prisma.attendance.deleteMany({
        where: { studentId: id },
      });

      // Delete leave requests
      await prisma.leave.deleteMany({
        where: { studentId: id },
      });

      // Delete student class enrollments
      await prisma.studentClass.deleteMany({
        where: { studentId: id },
      });

      // If teacher, delete their classes
      await prisma.class.deleteMany({
        where: { teacherId: id },
      });

      // Delete the user
      await prisma.user.delete({
        where: { id },
      });

      return NextResponse.json({ message: "User deleted successfully" });
    } catch (cascadeError) {
      console.error("Cascade delete error:", cascadeError);
      return NextResponse.json(
        { error: "Failed to delete user. Please try removing associated data first." },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;
    
    if (role !== "ADMIN" && role !== "HOD") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    
    // Extract editable fields
    const { firstName, lastName, email, department, subject, semester } = body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        department,
        subject: subject || null,
        semester: semester ? Number(semester) : null,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        department: true,
        subject: true,
        semester: true,
        role: true,
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
