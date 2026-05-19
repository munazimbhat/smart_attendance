"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Filter,
  Loader,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ReportsPage() {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<"attendance" | "students">("attendance");

  const [attendanceFilters, setAttendanceFilters] = useState({
    startDate: "",
    endDate: "",
    classId: "",
    format: "excel" as "excel" | "pdf",
  });

  const [studentFilters, setStudentFilters] = useState({
    classId: "",
    format: "excel" as "excel" | "pdf",
  });

  const userRole = (session?.user as any)?.role;

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/classes");
      setClasses(res.data);
    } catch (error) {
      console.error("Failed to load classes:", error);
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const handleExportAttendance = async () => {
    if (!attendanceFilters.startDate || !attendanceFilters.endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    if (userRole === "TEACHER" && !attendanceFilters.classId) {
      toast.error("Please select a class");
      return;
    }

    setExporting(true);
    try {
      const response = await axios.post(
        "/api/export/attendance",
        {
          startDate: attendanceFilters.startDate,
          endDate: attendanceFilters.endDate,
          classId: attendanceFilters.classId || null,
          format: attendanceFilters.format,
        },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `attendance_report.${attendanceFilters.format === "pdf" ? "pdf" : "xlsx"}`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  const handleExportStudents = async () => {
    if (userRole === "TEACHER" && !studentFilters.classId) {
      toast.error("Please select a class");
      return;
    }

    setExporting(true);
    try {
      const response = await axios.post(
        "/api/export/students",
        {
          classId: studentFilters.classId || null,
          format: studentFilters.format,
        },
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `students_list.${studentFilters.format === "pdf" ? "pdf" : "xlsx"}`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Report downloaded successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Reports & Exports</h2>
              <p className="text-blue-100 mt-1">
                Export attendance and student data as Excel or PDF
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-2 bg-white dark:bg-slate-900 rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
              activeTab === "attendance"
                ? "bg-blue-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            }`}
          >
            📊 Attendance Export
          </button>
          <button
            onClick={() => setActiveTab("students")}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold transition ${
              activeTab === "students"
                ? "bg-blue-600 text-white"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
            }`}
          >
            👥 Student List Export
          </button>
        </div>

        {/* Attendance Export Tab */}
        {activeTab === "attendance" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Export Attendance Records
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={attendanceFilters.startDate}
                  onChange={(e) =>
                    setAttendanceFilters({
                      ...attendanceFilters,
                      startDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={attendanceFilters.endDate}
                  onChange={(e) =>
                    setAttendanceFilters({
                      ...attendanceFilters,
                      endDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Class Filter */}
              {userRole === "TEACHER" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Class *
                  </label>
                  <select
                    value={attendanceFilters.classId}
                    onChange={(e) =>
                      setAttendanceFilters({
                        ...attendanceFilters,
                        classId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} - {cls.subject}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(userRole === "HOD" || userRole === "ADMIN") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Class (Optional)
                  </label>
                  <select
                    value={attendanceFilters.classId}
                    onChange={(e) =>
                      setAttendanceFilters({
                        ...attendanceFilters,
                        classId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- All Classes --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} - {cls.subject}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Format
                </label>
                <select
                  value={attendanceFilters.format}
                  onChange={(e) =>
                    setAttendanceFilters({
                      ...attendanceFilters,
                      format: e.target.value as "excel" | "pdf",
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="excel">Excel (.xlsx)</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportAttendance}
              disabled={exporting || loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Export Attendance Report
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Student Export Tab */}
        {activeTab === "students" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Export Student List
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Class Filter */}
              {userRole === "TEACHER" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Class *
                  </label>
                  <select
                    value={studentFilters.classId}
                    onChange={(e) =>
                      setStudentFilters({
                        ...studentFilters,
                        classId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- Select Class --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} - {cls.subject}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {(userRole === "HOD" || userRole === "ADMIN") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Class (Optional)
                  </label>
                  <select
                    value={studentFilters.classId}
                    onChange={(e) =>
                      setStudentFilters({
                        ...studentFilters,
                        classId: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- All Students --</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} - {cls.subject}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Format */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Format
                </label>
                <select
                  value={studentFilters.format}
                  onChange={(e) =>
                    setStudentFilters({
                      ...studentFilters,
                      format: e.target.value as "excel" | "pdf",
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="excel">Excel (.xlsx)</option>
                  <option value="pdf">PDF</option>
                </select>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportStudents}
              disabled={exporting || loading}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Export Student List
                </>
              )}
            </motion.button>
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
        >
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>💡 Tip:</strong> Teachers can export only their assigned classes.
            HOD and Admin can export department or all data. Choose Excel for spreadsheets
            or PDF for professional reports.
          </p>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
