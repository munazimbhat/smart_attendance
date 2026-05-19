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

    const { startDate, endDate, classId, format } = await request.json();

    // Build query based on role
    let whereCondition: any = {};

    if (startDate || endDate) {
      whereCondition.date = {};
      if (startDate) whereCondition.date.gte = new Date(startDate);
      if (endDate) whereCondition.date.lte = new Date(endDate);
    }

    if (classId) {
      whereCondition.classId = classId;
    }

    // Role-based filtering
    if (userRole === "TEACHER") {
      whereCondition.class = { teacherId: userId };
    } else if (userRole === "HOD") {
      whereCondition.class = { department: userDepartment };
    }

    const attendanceRecords = await prisma.attendance.findMany({
      where: whereCondition,
      include: {
        student: { select: { id: true, firstName: true, lastName: true, email: true } },
        class: { select: { id: true, name: true, subject: true } },
      },
      orderBy: [{ date: "desc" }, { student: { firstName: "asc" } }],
    });

    // Format data
    const formattedData = attendanceRecords.map((record) => ({
      Date: new Date(record.date).toLocaleDateString(),
      "Student Name": `${record.student.firstName} ${record.student.lastName}`,
      Email: record.student.email,
      Class: record.class.name,
      Subject: record.class.subject,
      Status: record.status,
      Confidence: record.confidence ? `${record.confidence.toFixed(2)}%` : "N/A",
      Method: record.method,
      Remarks: record.remarks || "-",
    }));

    if (format === "pdf") {
      return generatePDF(formattedData);
    } else {
      return generateExcel(formattedData);
    }
  } catch (error) {
    console.error("Export attendance error:", error);
    return NextResponse.json(
      { error: "Failed to export attendance" },
      { status: 500 }
    );
  }
}

function generateExcel(data: any[]) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Attendance");

  // Style header row
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const address = XLSX.utils.encode_col(C) + "1";
    ws[address].fill = { fgColor: { rgb: "4F46E5" } };
    ws[address].font = { bold: true, color: { rgb: "FFFFFF" } };
  }

  // Set column widths
  ws["!cols"] = [
    { wch: 12 },
    { wch: 20 },
    { wch: 25 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
  ];

  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  return new NextResponse(buffer, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="attendance_${new Date().toISOString().split("T")[0]}.xlsx"`,
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
  doc.text("Attendance Report", pageWidth / 2, yPosition, { align: "center" });

  yPosition += 10;
  doc.setFontSize(10);
  doc.setFont(undefined, "normal");
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 15, yPosition);

  yPosition += 10;

  // Table data
  const columns = [
    "Date",
    "Student Name",
    "Email",
    "Class",
    "Subject",
    "Status",
    "Confidence",
    "Method",
    "Remarks",
  ];

  const rows = data.map((item) => [
    item.Date,
    item["Student Name"],
    item.Email,
    item.Class,
    item.Subject,
    item.Status,
    item.Confidence,
    item.Method,
    item.Remarks,
  ]);

  // Simple table without autotable
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
      doc.text(String(cell).substring(0, 20), 15 + colIdx * cellWidth + 1, yPosition + 5, {
        maxWidth: cellWidth - 2,
      });
    });
    yPosition += cellHeight;
  });

  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="attendance_${new Date().toISOString().split("T")[0]}.pdf"`,
    },
  });
}
