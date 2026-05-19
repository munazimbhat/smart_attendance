"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

interface LeaveRequest {
  id: string;
  leaveType: string;
  reason: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  status: string;
  createdAt: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function TeacherLeavesPage() {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/leave");
      setLeaves(res.data);
    } catch (error) {
      console.error("Failed to fetch leaves:", error);
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await axios.patch(`/api/leave/${id}`, { status: "APPROVED" });
      toast.success("Leave approved!");
      setLeaves((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: "APPROVED" } : l))
      );
    } catch (error) {
      toast.error("Failed to approve leave");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await axios.patch(`/api/leave/${id}`, { status: "REJECTED" });
      toast.success("Leave rejected");
      setLeaves((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: "REJECTED" } : l))
      );
    } catch (error) {
      toast.error("Failed to reject leave");
    }
  };

  const filteredLeaves =
    filter === "ALL" ? leaves : leaves.filter((l) => l.status === filter);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-semibold">
            <CheckCircle className="w-4 h-4" /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-semibold">
            <XCircle className="w-4 h-4" /> Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm font-semibold">
            <Clock className="w-4 h-4" /> Pending
          </span>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl p-6 text-white"
        >
          <h2 className="text-2xl font-bold">Leave Requests</h2>
          <p className="text-orange-100 mt-1">
            Manage student leave applications
          </p>
        </motion.div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
                filter === f
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {f === "ALL" ? "All" : f.charAt(0) + f.slice(1).toLowerCase()}
              {f === "PENDING" && leaves.filter((l) => l.status === "PENDING").length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {leaves.filter((l) => l.status === "PENDING").length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Leave List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-slate-900 rounded-lg shadow-sm"
        >
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : filteredLeaves.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No leave requests found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredLeaves.map((leave) => (
                <motion.div
                  key={leave.id}
                  layout
                  className="p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-slate-800 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-0">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {leave.student?.firstName} {leave.student?.lastName}
                        </p>
                        {getStatusBadge(leave.status)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        <span className="font-medium">{leave.leaveType}</span> •{" "}
                        {new Date(leave.startDate).toLocaleDateString()} —{" "}
                        {new Date(leave.endDate).toLocaleDateString()} •{" "}
                        {leave.numberOfDays} day(s)
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{leave.reason}</p>
                    </div>

                    {leave.status === "PENDING" && (
                      <div className="flex gap-2 sm:ml-4 flex-shrink-0">
                        <button
                          onClick={() => handleApprove(leave.id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(leave.id)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
