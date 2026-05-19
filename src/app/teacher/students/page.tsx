"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { FaceRegistrationComponent } from "@/components/face-registration";
import { motion } from "framer-motion";
import { Users, UserPlus, CheckCircle, Search } from "lucide-react";
import { classesApi } from "@/lib/api";
import toast from "react-hot-toast";

interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  registered?: boolean;
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Fetch all classes and get students from them
      const classes = await classesApi.getAll();
      const allStudents: Student[] = [];
      const seenIds = new Set<string>();

      for (const cls of classes) {
        try {
          const classStudents = await classesApi.getStudents(cls.id);
          for (const s of classStudents) {
            if (!seenIds.has(s.id)) {
              seenIds.add(s.id);
              allStudents.push(s);
            }
          }
        } catch {
          // Class may have no students, skip
        }
      }

      setStudents(allStudents);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleRegistered = () => {
    // Mark this student as registered in the local list
    if (selectedStudent) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === selectedStudent.id ? { ...s, registered: true } : s
        )
      );
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center gap-3">
            <UserPlus className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Student Face Registration</h2>
              <p className="text-indigo-100 mt-1">
                Register student faces for attendance recognition
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Students ({students.length})
            </h3>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading students...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No students found</div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition text-left ${
                      selectedStudent?.id === student.id
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=0D8ABC&color=fff`}
                      alt={student.name}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                        {student.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {student.email}
                      </p>
                    </div>
                    {student.registered && (
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Face Registration Area */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6"
          >
            {selectedStudent ? (
              <>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Registering: {selectedStudent.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  {selectedStudent.email}
                </p>
                <FaceRegistrationComponent
                  key={selectedStudent.id}
                  studentId={selectedStudent.id}
                  studentName={selectedStudent.name}
                  onRegistered={handleRegistered}
                />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <UserPlus className="w-16 h-16 mb-4" />
                <p className="text-lg font-semibold">Select a Student</p>
                <p className="text-sm mt-1">
                  Choose a student from the list to register their face
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
