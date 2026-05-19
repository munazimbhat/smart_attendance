"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, ChevronUp, Users, Edit, Trash2, X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface ClassInfo {
  id: string;
  name: string;
  section: string;
  subject: string;
  department: string;
  semester: number;
  teacherId?: string;
  teacher?: Teacher;
  studentClasses?: {
    student: Student;
  }[];
}

export default function ManageClassesPage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ClassInfo>>({});
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/classes");
      setClasses(res.data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      toast.error("Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await axios.get("/api/teachers");
      setTeachers(res.data);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
    }
  };

  const toggleExpand = (classId: string) => {
    setExpandedClassId(expandedClassId === classId ? null : classId);
  };

  const startEdit = (cls: ClassInfo) => {
    setEditingId(cls.id);
    setEditForm({
      name: cls.name,
      section: cls.section,
      subject: cls.subject,
      semester: cls.semester,
      teacherId: cls.teacherId,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    if (!editForm.name || !editForm.section || !editForm.subject) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const res = await axios.put(`/api/classes/${editingId}`, {
        name: editForm.name,
        section: editForm.section,
        subject: editForm.subject,
        semester: editForm.semester,
        teacherId: editForm.teacherId,
      });
      toast.success("Class updated successfully");
      setClasses(classes.map(c => (c.id === editingId ? res.data : c)));
      cancelEdit();
    } catch (error) {
      toast.error("Failed to update class");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the class "${name}"? This will also remove all enrollments.`)) return;
    
    try {
      await axios.delete(`/api/classes/${id}`);
      toast.success("Class deleted successfully");
      setClasses(classes.filter(c => c.id !== id));
    } catch (error) {
      toast.error("Failed to delete class");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Manage Classes</h2>
              <p className="text-teal-100 mt-1">
                View all classes, assigned teachers, and enrolled students
              </p>
            </div>
          </div>
        </motion.div>

        {/* Edit Modal */}
        <AnimatePresence>
          {editingId && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={cancelEdit}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">Edit Class</h3>
                  <button onClick={cancelEdit} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Class Name *</label>
                    <input
                      type="text"
                      value={editForm.name || ""}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Section *</label>
                    <input
                      type="text"
                      value={editForm.section || ""}
                      onChange={(e) => setEditForm({ ...editForm, section: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject *</label>
                    <input
                      type="text"
                      value={editForm.subject || ""}
                      onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Semester</label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={editForm.semester || 1}
                      onChange={(e) => setEditForm({ ...editForm, semester: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign Teacher</label>
                    <select
                      value={editForm.teacherId || ""}
                      onChange={(e) => setEditForm({ ...editForm, teacherId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select a teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={cancelEdit}
                      className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Classes List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-8 text-center text-gray-500">
              Loading classes...
            </div>
          ) : classes.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-8 text-center text-gray-500">
              No classes found. You can add one from the "Add Class" tab.
            </div>
          ) : (
            classes.map((cls) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden"
              >
                {/* Class Header Row */}
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div 
                    className="flex-1 cursor-pointer hover:opacity-75 transition"
                    onClick={() => toggleExpand(cls.id)}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {cls.name} (Section {cls.section})
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400">
                        Semester {cls.semester}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <p><span className="font-medium text-gray-700 dark:text-gray-300">Subject:</span> {cls.subject}</p>
                      <p><span className="font-medium text-gray-700 dark:text-gray-300">Department:</span> {cls.department}</p>
                      <p>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Teacher:</span>{" "}
                        {cls.teacher ? `${cls.teacher.firstName} ${cls.teacher.lastName}` : "Unassigned"}
                      </p>
                      <p>
                        <span className="font-medium text-gray-700 dark:text-gray-300">Enrolled:</span>{" "}
                        {cls.studentClasses?.length || 0} students
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(cls)}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg transition font-medium text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cls.id, cls.name)}
                      className="flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg transition font-medium text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                    <button
                      onClick={() => toggleExpand(cls.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg transition font-medium text-sm"
                    >
                      <Users className="w-4 h-4" />
                      View Students
                      {expandedClassId === cls.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Students List */}
                <AnimatePresence>
                  {expandedClassId === cls.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-slate-800/30 overflow-hidden"
                    >
                      <div className="p-5">
                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">Enrolled Students</h4>
                        
                        {(!cls.studentClasses || cls.studentClasses.length === 0) ? (
                          <p className="text-sm text-gray-500 italic">No students are currently enrolled in this class.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {cls.studentClasses.map((sc) => (
                              <div 
                                key={sc.student.id}
                                className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 flex items-center gap-3"
                              >
                                <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center text-teal-700 dark:text-teal-400 font-bold text-sm">
                                  {sc.student.firstName.charAt(0)}{sc.student.lastName.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">
                                    {sc.student.firstName} {sc.student.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                                    {sc.student.email}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
