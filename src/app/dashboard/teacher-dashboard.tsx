"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Users, AlertCircle, BookOpen, ArrowRight, UserPlus, FileText, Camera } from "lucide-react";
import { classesApi } from "@/lib/api";
import axios from "axios";

export default function TeacherDashboard() {
  const [stats, setStats] = useState({
    myClassesCount: 0,
    totalStudents: 0,
    avgAttendance: "0%",
    pendingLeaves: 0,
  });
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    fetchClasses();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get("/api/dashboard/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await axios.get("/api/classes");
      setClasses(res.data);
    } catch (error) {
      console.error("Failed to load classes:", error);
    }
  };

  const statsData = [
    { label: "My Classes", value: stats.myClassesCount, icon: BookOpen, bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400" },
    { label: "Total Students", value: stats.totalStudents, icon: Users, bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400" },
    { label: "Avg Attendance", value: stats.avgAttendance, icon: Clock, bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-400" },
    { label: "Pending Leaves", value: stats.pendingLeaves, icon: AlertCircle, bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400" },
  ];

  const quickActions = [
    { label: "Take Attendance", description: "Face recognition", href: "/teacher/attendance", icon: Camera, gradient: "from-blue-600 to-indigo-600" },
    { label: "Register Student", description: "Add a new student", href: "/teacher/register", icon: UserPlus, gradient: "from-emerald-600 to-teal-600" },
    { label: "Register Faces", description: "Capture embeddings", href: "/teacher/students", icon: Users, gradient: "from-purple-600 to-pink-600" },
    { label: "View Reports", description: "Attendance reports", href: "/teacher/reports", icon: FileText, gradient: "from-orange-500 to-amber-600" },
  ];

  return (
    <div className="space-y-5">
      {/* Stats Grid - 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statsData.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4"
            >
              <div className="flex items-center justify-between">
                <div className="min-w-0 mr-2">
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{stat.label}</p>
                  <p className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg ${stat.bg} ${stat.text} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions - 2 cols on mobile, 4 on desktop */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link key={index} href={action.href}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`bg-gradient-to-br ${action.gradient} rounded-xl p-4 sm:p-5 text-white cursor-pointer shadow-lg hover:shadow-xl transition-shadow`}
                >
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" />
                  <h4 className="font-bold text-sm sm:text-base leading-tight">{action.label}</h4>
                  <p className="text-xs opacity-80 mt-1 hidden sm:block">{action.description}</p>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Classes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 sm:p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">My Classes</h3>
          <Link href="/teacher/classes" className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : classes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No classes assigned</div>
        ) : (
          <div className="space-y-3">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white">{cls.subject}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {cls.name} • Sec {cls.section} • {cls.studentClasses?.length || 0} students
                  </p>
                </div>
                <Link
                  href={`/teacher/attendance?classId=${cls.id}`}
                  className="flex-shrink-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium text-center"
                >
                  Start Attendance
                </Link>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
