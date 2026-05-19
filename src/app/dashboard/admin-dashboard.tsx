"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart, Users, FileText, AlertCircle } from "lucide-react";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalClasses: 0,
    attendanceRate: "0%",
    securityAlerts: 0,
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

  const statsGrid = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "blue" },
    { label: "Classes", value: stats.totalClasses, icon: BarChart, color: "green" },
    { label: "Attendance Rate", value: stats.attendanceRate, icon: FileText, color: "purple" },
    { label: "Security Alerts", value: stats.securityAlerts, icon: AlertCircle, color: "red" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome Back, Admin!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Here's what's happening in your system today
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsGrid.map((stat, index) => {
          const Icon = stat.icon;
          const colorMap: Record<string, string> = {
            blue: "from-blue-500 to-blue-600",
            green: "from-green-500 to-green-600",
            purple: "from-purple-500 to-purple-600",
            red: "from-red-500 to-red-600",
          };

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-xl shadow-sm hover:shadow-lg transition p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-16 h-16 rounded-lg bg-gradient-to-br ${
                    colorMap[stat.color as keyof typeof colorMap]
                  } flex items-center justify-center`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
