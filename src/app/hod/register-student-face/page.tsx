"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { motion } from "framer-motion";
import { Camera, Users } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaceRegistrationComponent } from "@/components/face-registration";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  registrationNumber?: string;
}

export default function RegisterStudentFacePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Get all users with role STUDENT, filtered by HOD's department
      const res = await axios.get("/api/users?role=STUDENT");
      setStudents(res.data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleRegistered = () => {
    toast.success("Face registered successfully!");
    setSelectedStudent(null);
    setSearchTerm("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center gap-3">
            <Camera className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Register Student Face</h2>
              <p className="text-purple-100 mt-1">
                Capture and register student faces for attendance recognition
              </p>
            </div>
          </div>
        </motion.div>

        {selectedStudent ? (
          // Face Registration Component
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm"
          >
            <div className="mb-6">
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                ← Back to Student Selection
              </button>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-3">
                Registering: {selectedStudent.firstName} {selectedStudent.lastName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedStudent.email}
              </p>
            </div>

            <FaceRegistrationComponent
              studentId={selectedStudent.id}
              studentName={`${selectedStudent.firstName} ${selectedStudent.lastName}`}
              onRegistered={handleRegistered}
            />
          </motion.div>
        ) : (
          // Student Selection
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Student List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm"
            >
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  Select a Student
                </h3>
                <input
                  type="text"
                  placeholder="Search by name, email, or registration number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  Loading students...
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  {searchTerm ? "No students found matching your search" : "No students available"}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredStudents.map((student) => (
                    <motion.button
                      key={student.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedStudent(student)}
                      className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition text-left"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-700 dark:text-purple-400 font-bold text-sm flex-shrink-0">
                          {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white truncate">
                            {student.firstName} {student.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {student.email}
                          </p>
                        </div>
                      </div>
                      {student.registrationNumber && (
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          ID: {student.registrationNumber}
                        </p>
                      )}
                      <button className="mt-3 w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg font-medium transition">
                        Register Face
                      </button>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
