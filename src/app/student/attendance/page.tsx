"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { motion } from "framer-motion";
import { AlertCircle, TrendingUp, Calendar } from "lucide-react";
import { attendanceApi } from "@/lib/api";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

import { useSession } from "next-auth/react";

export default function StudentAttendancePage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchAttendanceStats();
    }
  }, [session]);

  const fetchAttendanceStats = async () => {
    try {
      setLoading(true);
      const studentId = (session?.user as any)?.id;
      if (!studentId) return;
      const response = await attendanceApi.getStats(studentId);
      setStats(response);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      toast.error("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const attendancePercentage = stats?.percentage || 0;
  const isLowAttendance = attendancePercentage < 75;

  const chartData = [
    { name: "Present", value: stats?.presentDays || 0, fill: "#10b981" },
    { name: "Absent", value: stats?.absentDays || 0, fill: "#ef4444" },
    { name: "Late", value: stats?.lateDays || 0, fill: "#f59e0b" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Alert for Low Attendance */}
        {isLowAttendance && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 rounded-lg p-4 flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-800 dark:text-red-400">
                ⚠️ Low Attendance Alert
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Your attendance ({attendancePercentage}%) is below the required 75%. Contact your teacher or request a leave if needed.
              </p>
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="text-center py-12">Loading attendance data...</div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6"
              >
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Attendance %
                </p>
                <p className={`text-3xl font-bold mt-2 ${
                  attendancePercentage >= 75
                    ? "text-green-600"
                    : "text-red-600"
                }`}>
                  {attendancePercentage.toFixed(1)}%
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6"
              >
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Total Classes
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {stats?.totalClasses || 0}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6"
              >
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Days Present
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats?.presentDays || 0}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6"
              >
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Days Absent
                </p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {stats?.absentDays || 0}
                </p>
              </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Attendance Distribution */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Attendance Distribution
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Monthly Trend */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Monthly Attendance
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { month: "Jan", present: 20, absent: 3 },
                      { month: "Feb", present: 18, absent: 5 },
                      { month: "Mar", present: 21, absent: 2 },
                      { month: "Apr", present: 19, absent: 4 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="present" fill="#10b981" />
                    <Bar dataKey="absent" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
