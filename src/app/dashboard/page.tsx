"use client";

import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import AdminDashboard from "./admin-dashboard";
import TeacherDashboard from "./teacher-dashboard";
import StudentDashboard from "./student-dashboard";
import HODDashboard from "./hod-dashboard";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const userRole = (session?.user as any)?.role;

  const renderDashboard = () => {
    if (status === "loading") {
      return <div className="p-8 text-center text-gray-600">Loading...</div>;
    }

    switch (userRole) {
      case "ADMIN":
        return <AdminDashboard />;
      case "HOD":
        return <HODDashboard />;
      case "TEACHER":
        return <TeacherDashboard />;
      case "STUDENT":
        return <StudentDashboard />;
      default:
        return <div className="p-8 text-center text-red-600">Unable to determine user role. Please log in again.</div>;
    }
  };

  return <DashboardLayout>{renderDashboard()}</DashboardLayout>;
}
