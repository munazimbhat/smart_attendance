"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Edit, Trash2, X, Check, Search } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  subject?: string;
  semester?: number;
  role: string;
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<User>>({});

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const url = roleFilter === "ALL" ? "/api/users" : `/api/users?role=${roleFilter}`;
      const res = await axios.get(url);
      setUsers(res.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${name}?`)) return;
    
    try {
      await axios.delete(`/api/users/${id}`);
      toast.success("User deleted successfully");
      setUsers(users.filter(u => u.id !== id));
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const startEdit = (user: User) => {
    setEditingId(user.id);
    setEditForm(user);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    try {
      const res = await axios.put(`/api/users/${editingId}`, editForm);
      toast.success("User updated successfully");
      setUsers(users.map(u => (u.id === editingId ? res.data : u)));
      setEditingId(null);
    } catch (error) {
      toast.error("Failed to update user");
    }
  };

  const filteredUsers = users.filter((user) => {
    const search = searchTerm.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(search) ||
      user.lastName.toLowerCase().includes(search) ||
      user.email.toLowerCase().includes(search) ||
      user.department?.toLowerCase().includes(search)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Manage Users</h2>
              <p className="text-blue-100 mt-1">
                View, edit, or remove teachers and students
              </p>
            </div>
          </div>
        </motion.div>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Filter Role:</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Users</option>
              <option value="TEACHER">Teachers</option>
              <option value="STUDENT">Students</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-700 whitespace-nowrap">
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">Name</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">Role</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">Email</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">Department</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">Subject (Teacher)</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300">Semester</th>
                  <th className="px-6 py-4 text-sm font-bold text-gray-700 dark:text-gray-300 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading users...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No users found.</td>
                  </tr>
                ) : (
                  <AnimatePresence>
                    {filteredUsers.map((user) => {
                      const isEditing = editingId === user.id;

                      return (
                        <motion.tr
                          key={user.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition"
                        >
                          {/* Name Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={editForm.firstName || ""}
                                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                                  className="w-24 px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600 text-sm"
                                />
                                <input
                                  type="text"
                                  value={editForm.lastName || ""}
                                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                                  className="w-24 px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600 text-sm"
                                />
                              </div>
                            ) : (
                              <div className="font-semibold text-gray-900 dark:text-white">
                                {user.firstName} {user.lastName}
                              </div>
                            )}
                          </td>

                          {/* Role Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              user.role === 'TEACHER' 
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            }`}>
                              {user.role}
                            </span>
                          </td>

                          {/* Email Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <input
                                type="email"
                                value={editForm.email || ""}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                className="w-48 px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600 text-sm"
                              />
                            ) : (
                              <div className="text-sm text-gray-600 dark:text-gray-400">{user.email}</div>
                            )}
                          </td>

                          {/* Department Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editForm.department || ""}
                                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                                className="w-32 px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600 text-sm"
                              />
                            ) : (
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.department}</div>
                            )}
                          </td>

                          {/* Subject Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing && user.role === "TEACHER" ? (
                              <input
                                type="text"
                                value={editForm.subject || ""}
                                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                                className="w-32 px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600 text-sm"
                              />
                            ) : (
                              <div className="text-sm text-gray-600 dark:text-gray-400">{user.subject || "-"}</div>
                            )}
                          </td>

                          {/* Semester Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {isEditing && user.role === "TEACHER" ? (
                              <input
                                type="number"
                                min="1"
                                max="10"
                                value={editForm.semester || ""}
                                onChange={(e) => setEditForm({ ...editForm, semester: e.target.value ? Number(e.target.value) : undefined })}
                                className="w-20 px-2 py-1 border rounded dark:bg-slate-800 dark:border-gray-600 text-sm"
                              />
                            ) : (
                              <div className="text-sm text-gray-600 dark:text-gray-400">{user.semester || "-"}</div>
                            )}
                          </td>

                          {/* Actions Column */}
                          <td className="px-6 py-4 text-right whitespace-nowrap">
                            {isEditing ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={saveEdit}
                                  className="p-1.5 bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition"
                                  title="Save"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg transition"
                                  title="Cancel"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => startEdit(user)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition"
                                  title="Edit User"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(user.id, `${user.firstName} ${user.lastName}`)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                                  title="Delete User"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
