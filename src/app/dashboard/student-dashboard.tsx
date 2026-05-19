"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Clock, AlertCircle, FileText } from "lucide-react";
import axios from "axios";

export default function StudentDashboard() {
  const [dashboardData, setDashboardData] = useState({
    classes: [],
    overallAttendance: "0%",
    classCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/dashboard/stats");
      setDashboardData(res.data);
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const classes = dashboardData.classes || [];

  const getAttendanceColor = (attendance: number) => {
    if (attendance >= 75) return "text-green-600 dark:text-green-400";
    if (attendance >= 50) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getBarColor = (attendance: number) => {
    if (attendance >= 75) return "bg-green-500";
    if (attendance >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-5">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-5 sm:p-6 text-white"
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Welcome to Smart Attendance</h2>
        <p className="text-blue-100 text-sm sm:text-base mb-4">
          Stay on top of your attendance to meet the 75% requirement.
        </p>
        <Link
          href="/student/attendance"
          className="inline-block px-5 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition text-sm"
        >
          Mark Attendance Now
        </Link>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/student/leave">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 sm:p-5 cursor-pointer hover:shadow-lg transition border border-gray-100 dark:border-gray-800"
          >
            <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600 mb-2 sm:mb-3" />
            <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">Request Leave</h4>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">Submit your leave request</p>
          </motion.div>
        </Link>

        <Link href="/student/attendance">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 sm:p-5 cursor-pointer hover:shadow-lg transition border border-gray-100 dark:border-gray-800"
          >
            <Clock className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 mb-2 sm:mb-3" />
            <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">View Attendance</h4>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 hidden sm:block">Check your attendance record</p>
          </motion.div>
        </Link>
      </div>

      {/* Classes Grid */}
      <div>
        <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white mb-3">My Classes</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {classes.map((cls, index) => (
            <motion.div
              key={cls.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-4 sm:p-5 hover:shadow-lg transition border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 mr-2">
                  <h4 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white leading-tight">{cls.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{cls.subject}</p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{cls.instructor}</p>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Attendance</span>
                  <span className={`font-bold text-sm ${getAttendanceColor(cls.attendance)}`}>{cls.attendance}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${getBarColor(cls.attendance)}`} style={{ width: `${cls.attendance}%` }} />
                </div>
              </div>

              {cls.attendance < 75 && (
                <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-700 dark:text-yellow-400 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  Below required attendance
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
