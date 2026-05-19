"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Users, FileText, BookOpen, UserPlus, Settings } from "lucide-react";
import Link from "next/link";
import axios from "axios";

export default function HODDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    attendanceRate: "0%",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get("/api/dashboard/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    { label: "Total Students", value: stats.totalStudents, icon: Users, bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400" },
    { label: "Total Teachers", value: stats.totalTeachers, icon: Users, bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400" },
    { label: "Classes", value: stats.totalClasses, icon: BarChart, bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-400" },
    { label: "Attendance Rate", value: stats.attendanceRate, icon: FileText, bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400" },
  ];

  const quickLinks = [
    { label: "Add Class", href: "/hod/add-class", icon: BookOpen, gradient: "from-teal-600 to-emerald-600" },
    { label: "Add Teacher", href: "/hod/add-teacher", icon: UserPlus, gradient: "from-purple-600 to-pink-600" },
    { label: "Add Student", href: "/hod/add-student", icon: Users, gradient: "from-cyan-600 to-blue-600" },
    { label: "Manage Classes", href: "/hod/manage-classes", icon: BarChart, gradient: "from-blue-600 to-indigo-600" },
  ];

  return (
    <div className="space-y-5">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-5 sm:p-8 text-white"
      >
        <h1 className="text-xl sm:text-3xl font-bold mb-1 sm:mb-2">Welcome Back, HOD!</h1>
        <p className="text-blue-100 text-sm sm:text-base">
          Manage your department's attendance and leave system
        </p>
      </motion.div>

      {/* Stats Grid - 2 on mobile, 4 on desktop */}
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

      {/* Quick Links - 2 on mobile, 4 on desktop */}
      <div>
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link key={index} href={link.href}>
                <motion.div
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`bg-gradient-to-br ${link.gradient} rounded-xl p-4 sm:p-5 text-white cursor-pointer shadow-lg hover:shadow-xl transition-shadow`}
                >
                  <Icon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-3" />
                  <h4 className="font-bold text-sm sm:text-base">{link.label}</h4>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
