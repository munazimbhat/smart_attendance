import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth-config";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userDepartment = (session.user as any).department;
    const userId = session.user.id;

    const { classId, department, format } = await request.json();

    // Build query based on role
    let whereCondition: any = {};

    // Role-based filtering
    if (userRole === "TEACHER") {
      whereCondition.studentClasses = {
        some: { class: { teacherId: userId } },
      };
      if (classId) {
        whereCondition.studentClasses = {
          some: { classId },
        };
      }
    } else if (userRole === "HOD") {
      if (classId) {
        whereCondition.studentClasses = {
          some: { classId },
        };
      } else {
        whereCondition.department = userDepartment;
      }
    } else if (userRole === "ADMIN") {
      if (department) {
        whereCondition.department = department;
      }
      if (classId) {
        whereCondition.studentClasses = {
          some: { classId },
        };
      }
    }

    // Only get STUDENT role users
    whereCondition.role = "STUDENT";

    const students = await prisma.user.findMany({
      where: whereCondition,
      include: {
        studentClasses: {
          include: { class: { select: { name: true, subject: true } } },
        },
      },
      orderBy: { firstName: "asc" },
    });

    // Format data
    const formattedData = students.map((student) => ({
      "First Name": student.firstName,
      "Last Name": student.lastName,
      Email: student.email,
      "Registration Number": student.registrationNumber || "-",
      Department: student.department,
      Semester: student.semester || "-",
      Classes: student.studentClasses.map((sc) => sc.class.name).join(", ") || "-",
      "Joined Date": new Date(student.createdAt).toLocaleDateString(),
      Status: student.isActive ? "Active" : "Inactive",
    }));

    if (format === "pdf") {
      return generatePDF(formattedData);
    } else {
      return generateExcel(formattedData);
    }
  } catch (error) {
    console.error("Export students error:", error);
    return NextResponse.json(
      { error: "Failed to export students" },
      { status: 500 }
    );
  }
}

function generateExcel(data: any[]) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Students");

  // Style header row
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + "1";
    ws[address].fill = { fgColor: { rgb: "4F46E5" } };
    ws[address].font = { bold: true, color: { rgb: "FFFFFF" } };
  }

  // Set column widths
  ws["!cols"] = [
    { wch: 15 },
    { wch: 15 },
    { wch: 25 },
    { wch: 18 },
    { wch: 15 },
    { wch: 10 },
    { wch: 25 },
    { wch: 15 },
    { wch: 10 },
  ];

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="students_${new Date().toISOString().split("T")[0]}.xlsx"`,
    },
  });
}

function generatePDF(data: any[]) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 15;

  // Title
  doc.setFontSize(16);
  doc.setFont(undefined, "bold");
  doc.text("Student List Report", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, yPosition);

  yPosition += 10;

  // Table data
  const columns = [
    "First Name",
    "Last Name",
    "Email",
    "Reg. Number",
    "Department",
    "Sem",
    "Classes",
    "Joined",
    "Status",
  ];

  const rows = data.map((item) => [
    item["First Name"],
    item["Last Name"],
    item.Email,
    item["Registration Number"],
    item.Department,
    item.Semester,
    item.Classes,
    item["Joined Date"],
    item.Status,
  ]);

  // Simple table
  const cellWidth = (pageWidth - 20) / columns.length;
  const cellHeight = 7;

  // Header
  doc.setFont(undefined, "bold");
  doc.setFillColor(79, 70, 229);
  doc.setTextColor(255, 255, 255);

  columns.forEach((col, idx) => {
    doc.rect(15 + idx * cellWidth, yPosition, cellWidth, cellHeight, "F");
    doc.text(col, 15 + idx * cellWidth + 1, yPosition + 5, { maxWidth: cellWidth - 2 });
  });

  yPosition += cellHeight;
  doc.setTextColor(0, 0, 0);

  // Rows
  rows.forEach((row, rowIdx) => {
    if (yPosition + cellHeight > pageHeight - 10) {
      doc.addPage();
      yPosition = 15;
    }

    row.forEach((cell, colIdx) => {
      if (rowIdx % 2 === 0) {
        doc.setFillColor(240, 240, 240);
      }
      doc.rect(15 + colIdx * cellWidth, yPosition, cellWidth, cellHeight, "F");
      doc.setFontSize(8);
      doc.text(String(cell).substring(0, 15), 15 + colIdx * cellWidth + 1, yPosition + 5, {
        maxWidth: cellWidth - 2,
      });
    });
    yPosition += cellHeight;
  });

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="students_${new Date().toISOString().split("T")[0]}.pdf"`,
    },
  });
}
