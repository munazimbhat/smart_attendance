import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Hash demo passwords
  const hashedPassword = await bcrypt.hash("Demo@123", 10);

  // Create departments
  await Promise.all([
    prisma.department_Info.upsert({
      where: { name: "CSE" },
      update: {},
      create: { name: "CSE" },
    }),
    prisma.department_Info.upsert({
      where: { name: "ECE" },
      update: {},
      create: { name: "ECE" },
    }),
  ]);

  // Create users
  void await prisma.user.upsert({
    where: { email: "admin@demo" },
    update: {},
    create: {
      email: "admin@demo",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      department: "CSE",
    },
  });

  void await prisma.user.upsert({
    where: { email: "hod@demo" },
    update: {},
    create: {
      email: "hod@demo",
      password: hashedPassword,
      firstName: "Dr. Smith",
      lastName: "HOD",
      role: "HOD",
      department: "CSE",
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: "teacher@demo" },
    update: {},
    create: {
      email: "teacher@demo",
      password: hashedPassword,
      firstName: "Prof.",
      lastName: "Johnson",
      role: "TEACHER",
      department: "CSE",
    },
  });

  const students = await Promise.all([
    prisma.user.upsert({
      where: { email: "student1@demo" },
      update: {},
      create: {
        email: "student1@demo",
        password: hashedPassword,
        firstName: "John",
        lastName: "Doe",
        role: "STUDENT",
        department: "CSE",
      },
    }),
    prisma.user.upsert({
      where: { email: "student2@demo" },
      update: {},
      create: {
        email: "student2@demo",
        password: hashedPassword,
        firstName: "Jane",
        lastName: "Smith",
        role: "STUDENT",
        department: "CSE",
      },
    }),
    prisma.user.upsert({
      where: { email: "student3@demo" },
      update: {},
      create: {
        email: "student3@demo",
        password: hashedPassword,
        firstName: "Mike",
        lastName: "Wilson",
        role: "STUDENT",
        department: "CSE",
      },
    }),
  ]);

  // Create classes
  const class1 = await prisma.class.upsert({
    where: {
      name_section_subject_department: {
        name: "CSE-A",
        section: "A",
        subject: "Python Programming",
        department: "CSE",
      },
    },
    update: {},
    create: {
      name: "CSE-A",
      section: "A",
      subject: "Python Programming",
      department: "CSE",
      semester: 3,
      teacherId: teacher.id,
    },
  });

  // Enroll students in classes
  await Promise.all([
    prisma.studentClass.upsert({
      where: {
        studentId_classId: {
          studentId: students[0].id,
          classId: class1.id,
        },
      },
      update: {},
      create: {
        studentId: students[0].id,
        classId: class1.id,
      },
    }),
    prisma.studentClass.upsert({
      where: {
        studentId_classId: {
          studentId: students[1].id,
          classId: class1.id,
        },
      },
      update: {},
      create: {
        studentId: students[1].id,
        classId: class1.id,
      },
    }),
    prisma.studentClass.upsert({
      where: {
        studentId_classId: {
          studentId: students[2].id,
          classId: class1.id,
        },
      },
      update: {},
      create: {
        studentId: students[2].id,
        classId: class1.id,
      },
    }),
  ]);

  // Create timetable entries
  const now = new Date();
  const startTime = new Date(now);
  startTime.setHours(10, 0, 0);
  const endTime = new Date(now);
  endTime.setHours(11, 0, 0);

  await prisma.timetable.upsert({
    where: {
      classId_teacherId_dayOfWeek_startTime: {
        classId: class1.id,
        teacherId: teacher.id,
        dayOfWeek: now.getDay(),
        startTime,
      },
    },
    update: {},
    create: {
      classId: class1.id,
      teacherId: teacher.id,
      dayOfWeek: now.getDay(),
      startTime,
      endTime,
      room: "Lab-101",
      building: "Computer Science",
    },
  });

  // Create sample attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await Promise.all([
    prisma.attendance.upsert({
      where: {
        studentId_classId_date: {
          studentId: students[0].id,
          classId: class1.id,
          date: today,
        },
      },
      update: {},
      create: {
        studentId: students[0].id,
        classId: class1.id,
        date: today,
        status: "PRESENT",
        confidence: 0.95,
        method: "FACE_RECOGNITION",
        checkInTime: new Date(),
      },
    }),
  ]);

  console.log("✅ Database seeded successfully!");
  console.log(`\n📊 Created:
    - 1 Admin user
    - 1 HOD user
    - 1 Teacher user
    - 3 Student users
    - 1 Class (CSE-A)
    - 3 Student enrollments
    - 1 Timetable entry
    - 1 Attendance record
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
