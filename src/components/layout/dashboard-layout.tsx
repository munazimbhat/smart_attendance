"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Users,
  Calendar,
  FileText,
  LogOut,
  Sun,
  Moon,
  Settings,
  Bell,
  Clock,
  BookOpen,
  UserPlus,
  Camera,
} from "lucide-react";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { ProfileModal } from "@/components/profile-modal";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    // Open sidebar by default on desktop
    if (window.innerWidth >= 768) {
      setSidebarOpen(true);
    }
  }, []);

  const userRole = (session?.user as any)?.role;

  // Navigation items based on role
  const getNavItems = () => {
    const baseItems = [{ label: "Dashboard", href: "/dashboard", icon: Home }];

    const roleItems: Record<string, any[]> = {
      HOD: [
        { label: "Attendance", href: "/teacher/attendance", icon: Clock },
        { label: "Add Class", href: "/hod/add-class", icon: BookOpen },
        { label: "Manage Classes", href: "/hod/manage-classes", icon: BookOpen },
        { label: "Add Teacher", href: "/hod/add-teacher", icon: UserPlus },
        { label: "Add Student", href: "/hod/add-student", icon: Users },
        { label: "Bulk Import", href: "/hod/bulk-import", icon: Users },
        { label: "Register Student Face", href: "/hod/register-student-face", icon: Camera },
        { label: "Manage Users", href: "/hod/manage-users", icon: Users },
        { label: "Reports", href: "/teacher/reports", icon: FileText },
        { label: "Leave Requests", href: "/teacher/leaves", icon: FileText },
      ],
      TEACHER: [
        { label: "Attendance", href: "/teacher/attendance", icon: Clock },
        { label: "Classes", href: "/teacher/classes", icon: BookOpen },
        { label: "Students", href: "/teacher/students", icon: Users },
        { label: "Register Student", href: "/teacher/register", icon: Users },
        { label: "Reports", href: "/teacher/reports", icon: FileText },
        { label: "Leave Requests", href: "/teacher/leaves", icon: FileText },
      ],
      STUDENT: [
        { label: "Attendance", href: "/student/attendance", icon: Clock },
        { label: "Leave Request", href: "/student/leave", icon: FileText },
      ],
    };

    return [...baseItems, ...(roleItems[userRole] || [])];
  };

  const navItems = getNavItems();

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
    toast.success("Logged out successfully");
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        className={`
          fixed inset-y-0 left-0 z-50 transform
          ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}
          md:relative md:translate-x-0 ${sidebarOpen ? "md:w-64" : "md:w-20"}
          bg-white dark:bg-slate-900 shadow-lg transition-all duration-300 flex flex-col
        `}
      >
        {/* Logo */}
        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold">SA</span>
            </div>
            {sidebarOpen && (
              <span className="font-bold text-gray-900 dark:text-white whitespace-nowrap">Smart Attendance</span>
            )}
          </Link>
          <button 
            className="md:hidden text-gray-500"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive(item.href)
                    ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            {sidebarOpen && <span className="text-sm font-medium">Theme</span>}
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
            {sidebarOpen && <span className="text-sm font-medium">Collapse</span>}
          </button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Bar */}
        <div className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-xs md:max-w-md">
              {navItems.find((item) => isActive(item.href))?.label || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="relative p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hidden sm:block">
              <Bell className="w-6 h-6" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-4 border-l border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setProfileModalOpen(true)}
                className="hidden sm:flex flex-col items-end hover:opacity-80 transition"
              >
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{userRole}</p>
              </button>
              <button
                onClick={() => setProfileModalOpen(true)}
                className="hover:opacity-80 transition"
              >
                <img
                  src={
                    (session?.user as any)?.avatar ||
                    `https://ui-avatars.com/api/?name=${session?.user?.name}&background=0D8ABC&color=fff`
                  }
                  alt={session?.user?.name || "User"}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full"
                />
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">{children}</div>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />
    </div>
  );
}
