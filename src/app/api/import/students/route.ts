import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authConfig } from "@/lib/auth-config";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import Papa from "papaparse";

interface StudentRow {
  firstName?: string;
  lastName?: string;
  email?: string;
  registrationNumber?: string;
  department?: string;
  semester?: string;
  password?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role;
    const userDepartment = (session.user as any).department;

    // Only HOD and ADMIN can bulk import
    if (userRole !== "HOD" && userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Only HOD and ADMIN can bulk import students" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const csvText = await file.text();
    const parsed = Papa.parse<StudentRow>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, ""),
    });

    if (parsed.errors.length > 0) {
      return NextResponse.json(
        { error: "Invalid CSV format", details: parsed.errors },
        { status: 400 }
      );
    }

    const rows = parsed.data;

    // Validate and prepare data
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      created: [] as any[],
    };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // +2 for header and 1-based indexing

      try {
        // Validate required fields
        if (!row.firstname || !row.lastname || !row.email) {
          results.errors.push(
            `Row ${rowNum}: Missing required fields (First Name, Last Name, Email)`
          );
          results.failed++;
          continue;
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
          results.errors.push(`Row ${rowNum}: Invalid email format`);
          results.failed++;
          continue;
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: row.email },
        });

        if (existingUser) {
          results.errors.push(`Row ${rowNum}: Email already exists`);
          results.failed++;
          continue;
        }

        // Use provided department or HOD's department
        const studentDepartment = row.department || userDepartment;

        // Hash password (default: Demo@123)
        const password = row.password || "Demo@123";
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create student
        const student = await prisma.user.create({
          data: {
            firstName: row.firstname.trim(),
            lastName: row.lastname.trim(),
            email: row.email.trim(),
            password: hashedPassword,
            role: "STUDENT",
            department: studentDepartment,
            semester: row.semester ? parseInt(row.semester) : 1,
            registrationNumber: row.registrationnumber?.trim() || null,
            isActive: true,
          },
        });

        results.success++;
        results.created.push({
          id: student.id,
          email: student.email,
          name: `${student.firstName} ${student.lastName}`,
        });
      } catch (error) {
        results.errors.push(
          `Row ${rowNum}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        results.failed++;
      }
    }

    return NextResponse.json({
      message: `Import completed: ${results.success} successful, ${results.failed} failed`,
      ...results,
    });
  } catch (error) {
    console.error("Bulk import error:", error);
    return NextResponse.json(
      { error: "Failed to process import" },
      { status: 500 }
    );
  }
}
