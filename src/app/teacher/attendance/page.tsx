"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { FaceAttendanceComponent } from "@/components/face-attendance";
import { motion } from "framer-motion";
import { Clock, AlertCircle, CheckCircle, Users } from "lucide-react";
import { timetableApi, classesApi } from "@/lib/api";
import toast from "react-hot-toast";

import { useSession } from "next-auth/react";

export default function TeacherAttendancePage() {
  const { data: session } = useSession();
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [currentClass, setCurrentClass] = useState<any>(null);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAttendance, setMarkingAttendance] = useState(false);

  useEffect(() => {
    fetchCurrentClass();
  }, []);

  const fetchCurrentClass = async () => {
    try {
      setLoading(true);
      const urlParams = new URLSearchParams(window.location.search);
      const classId = urlParams.get("classId");

      const allClasses = await classesApi.getAll();
      
      // If the user is a teacher, only show their classes. If HOD/ADMIN, show all.
      const userRole = (session?.user as any)?.role;
      const userId = (session?.user as any)?.id;
      
      let filteredClasses = allClasses;
      if (userRole === "TEACHER" && userId) {
        filteredClasses = allClasses.filter((c: any) => c.teacherId === userId);
      }
      
      setAvailableClasses(filteredClasses);

      if (classId) {
        const selectedClass = filteredClasses.find((c: any) => c.id === classId);
        if (selectedClass) {
          handleClassSelection(selectedClass);
        }
      }
    } catch (error) {
      console.error("Failed to fetch class:", error);
      toast.error("Failed to load class information");
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelection = async (selectedClass: any) => {
    setCurrentClass(selectedClass);
    try {
      setLoading(true);
      const students = await classesApi.getStudents(selectedClass.id);
      setAttendanceList(students || []);
    } catch (error) {
      toast.error("Failed to load students for this class");
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceMarked = (studentId: string) => {
    setAttendanceList((prev) =>
      prev.map((student) =>
        student.id === studentId ? { ...student, marked: true } : student
      )
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Class Info */}
        {currentClass && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{currentClass.subject}</h2>
                <p className="text-blue-100 mt-1">
                  {currentClass.section} • {currentClass.room} • {currentClass.time}
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold">{attendanceList.length}</p>
                <p className="text-blue-100">Students</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Class Selection UI */}
        {!currentClass && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Select a Class</h2>
              <p className="text-gray-500 mt-2">Which class and semester are you taking attendance for?</p>
            </div>

            {availableClasses.length === 0 ? (
              <div className="text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-gray-500">No classes assigned to you.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableClasses.map((cls) => (
                  <button
                    key={cls.id}
                    onClick={() => handleClassSelection(cls)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-500 hover:ring-1 hover:ring-blue-500 transition text-left"
                  >
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">
                      {cls.subject}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {cls.name} (Section {cls.section})
                    </p>
                    <div className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                      Semester {cls.semester}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {loading && <div className="text-center py-8">Loading...</div>}

        {!loading && currentClass && (
          <>
            {/* Face Detection Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                📸 Face Recognition Attendance
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Students will show their face to the camera and attendance will be automatically marked with a confidence score.
              </p>

              <FaceAttendanceComponent
                  classId={currentClass?.id || "default"}
                  onAttendanceMarked={handleAttendanceMarked}
                />
            </motion.div>

            {/* Attendance List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Attendance Status
              </h3>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {attendanceList.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={`https://ui-avatars.com/api/?name=${student.name}`}
                        alt={student.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {student.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {student.email}
                        </p>
                      </div>
                    </div>

                    {student.marked ? (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-semibold"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Present
                      </motion.div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-400 rounded-lg text-sm">
                        Waiting...
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
