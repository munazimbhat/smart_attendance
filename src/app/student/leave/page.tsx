"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { motion } from "framer-motion";
import { FileText, Plus, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useSession } from "next-auth/react";

export default function StudentLeavePage() {
  const { data: session } = useSession();
  const [leaveType, setLeaveType] = useState("CASUAL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [document, setDocument] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [leaveCount, setLeaveCount] = useState(0);

  useEffect(() => {
    if (session?.user) {
      fetchLeaves();
    }
  }, [session]);

  const fetchLeaves = async () => {
    try {
      const studentId = (session?.user as any).id;
      const res = await axios.get(`/api/leave?studentId=${studentId}`);
      setLeaves(res.data);

      const approvedCount = res.data.filter((l: any) => l.status === "APPROVED").length;
      setLeaveCount(approvedCount);
    } catch (error) {
      console.error("Failed to load leaves", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate || !reason) {
      toast.error("Please fill all required fields");
      return;
    }

    if (leaveCount >= 15) {
      toast.error("Maximum leave limit (15) reached.");
      return;
    }

    setLoading(true);
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      await axios.post("/api/leave", {
        leaveType,
        startDate,
        endDate,
        reason,
        numberOfDays: diffDays,
      });

      toast.success("Leave request submitted successfully!");
      setReason("");
      setStartDate("");
      setEndDate("");
      setDocument(null);
      fetchLeaves(); // Refresh the list
    } catch (error: any) {
      toast.error(error?.response?.data?.error || "Failed to submit leave request");
    } finally {
      setLoading(false);
    }
  };

  const limitReached = leaveCount >= 15;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto w-full">
        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`${
            limitReached
              ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
              : "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
          } rounded-lg p-4 flex items-start gap-3`}
        >
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${limitReached ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"}`} />
          <div>
            <p className={`font-semibold ${limitReached ? "text-red-800 dark:text-red-400" : "text-blue-800 dark:text-blue-400"}`}>
              📋 Leave Information
            </p>
            <p className={`text-sm mt-1 ${limitReached ? "text-red-700 dark:text-red-300" : "text-blue-700 dark:text-blue-300"}`}>
              You have taken <strong>{leaveCount}/15</strong> approved leaves this semester.
              {limitReached && " You cannot apply for any more leaves."}
            </p>
          </div>
        </motion.div>

        {/* Leave Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6"
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Request New Leave
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Leave Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Leave Type *
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                disabled={limitReached}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <option value="CASUAL">Casual Leave</option>
                <option value="MEDICAL">Medical Leave</option>
                <option value="PERSONAL">Personal Leave</option>
                <option value="EMERGENCY">Emergency Leave</option>
              </select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={limitReached}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={limitReached}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for Leave *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly explain the reason for your leave..."
                rows={4}
                disabled={limitReached}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                required
              />
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Supporting Document (Medical certificate, etc.)
              </label>
              <input
                type="file"
                onChange={(e) => setDocument(e.target.files?.[0] || null)}
                disabled={limitReached}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Max 5MB, PDF/JPG/PNG
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: limitReached ? 1 : 1.02 }}
              whileTap={{ scale: limitReached ? 1 : 0.98 }}
              type="submit"
              disabled={loading || limitReached}
              className={`w-full font-semibold py-2.5 rounded-lg transition ${
                limitReached
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {loading ? "Submitting..." : limitReached ? "Limit Reached" : "Submit Leave Request"}
            </motion.button>
          </form>
        </motion.div>

        {/* Recent Leave Requests */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6"
        >
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Your Leave Requests
          </h3>

          <div className="space-y-3">
            {leaves.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No leave requests yet.</p>
            ) : (
              leaves.map((leave) => (
                <div key={leave.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">
                      {leave.leaveType.toLowerCase()} Leave
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()} • {leave.numberOfDays} days
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                    leave.status === "APPROVED" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                    leave.status === "REJECTED" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                    "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                  }`}>
                    {leave.status === "APPROVED" ? "✓ Approved" : leave.status === "REJECTED" ? "✗ Rejected" : "⏳ Pending"}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
