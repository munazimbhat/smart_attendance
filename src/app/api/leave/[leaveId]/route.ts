import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ leaveId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { leaveId } = await params;
    const { status, rejectionReason } = await request.json();

    if (!["APPROVED", "REJECTED", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const leave = await prisma.leave.update({
      where: { id: leaveId },
      data: {
        status,
        approvedBy: (session.user as any).id,
        approvalDate: new Date(),
        rejectionReason: rejectionReason || null,
      },
    });

    return NextResponse.json(leave);
  } catch (error) {
    console.error("Update leave error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
