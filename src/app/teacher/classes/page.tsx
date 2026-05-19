"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { motion } from "framer-motion";
import { BookOpen, Users, CheckCircle } from "lucide-react";
import { classesApi } from "@/lib/api";
import toast from "react-hot-toast";

interface ClassInfo {
  id: string;
  name: string;
  section: string;
  subject: string;
  department: string;
  semester: number;
  teacher?: {
    firstName: string;
    lastName: string;
  };
  studentClasses?: any[];
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const data = await classesApi.getAll();
      setClasses(data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">My Classes</h2>
              <p className="text-emerald-100 mt-1">
                View and manage your assigned classes
              </p>
            </div>
          </div>
        </motion.div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading classes...</div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No classes assigned yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls, index) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition"
              >
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                  <h3 className="text-lg font-bold text-white">{cls.subject}</h3>
                  <p className="text-blue-100 text-sm">
                    {cls.name} • Section {cls.section}
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Department</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {cls.department}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Semester</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {cls.semester}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Students</span>
                    <span className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                      <Users className="w-4 h-4" />
                      {cls.studentClasses?.length || 0}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <a
                      href={`/teacher/attendance?classId=${cls.id}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Take Attendance
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
