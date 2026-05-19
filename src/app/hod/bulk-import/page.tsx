"use client";

import { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { motion } from "framer-motion";
import {
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Users,
  Loader,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
  created: Array<{ id: string; email: string; name: string }>;
}

export default function BulkImportPage() {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [fileName, setFileName] = useState("");

  const userRole = (session?.user as any)?.role;

  // Check authorization
  if (userRole !== "HOD" && userRole !== "ADMIN") {
    return (
      <DashboardLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center"
        >
          <AlertCircle className="w-12 h-12 mx-auto text-red-600 mb-3" />
          <h2 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">
            Access Denied
          </h2>
          <p className="text-red-700 dark:text-red-300">
            Only HOD and Admin can bulk import students
          </p>
        </motion.div>
      </DashboardLayout>
    );
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".csv")) {
      toast.error("Please select a CSV file");
      return;
    }

    setFileName(file.name);
    setResult(null);
  };

  const handleImport = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Please select a file");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/import/students", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(response.data);
      toast.success(response.data.message);
    } catch (error) {
      console.error("Import error:", error);
      toast.error("Failed to import students");
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `firstName,lastName,email,registrationNumber,department,semester,password
John,Doe,john.doe@university.edu,S2024001,CSE,1,Demo@123
Jane,Smith,jane.smith@university.edu,S2024002,CSE,1,Demo@123
Bob,Johnson,bob.johnson@university.edu,S2024003,ECE,2,Demo@123`;

    const blob = new Blob([template], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("Template downloaded!");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white"
        >
          <div className="flex items-center gap-3">
            <Upload className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Bulk Student Import</h2>
              <p className="text-purple-100 mt-1">
                Import multiple students from CSV file
              </p>
            </div>
          </div>
        </motion.div>

        {/* Instructions Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6"
        >
          <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-3">
            📋 How to Use
          </h3>
          <ol className="space-y-2 text-sm text-blue-700 dark:text-blue-300 list-decimal list-inside">
            <li>Download the CSV template below</li>
            <li>Fill in your student data with required fields</li>
            <li>Upload the CSV file to bulk import all students</li>
            <li>View results showing successful and failed imports</li>
          </ol>
        </motion.div>

        {/* Main Upload Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-8"
        >
          {/* Download Template */}
          <div className="mb-8 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={downloadTemplate}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg font-semibold transition text-gray-700 dark:text-gray-300"
            >
              <Download className="w-5 h-5" />
              Download Template
            </motion.button>
          </div>

          {/* File Input */}
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 hover:border-blue-500 dark:hover:border-blue-400 transition text-center cursor-pointer group"
            >
              <Upload className="w-12 h-12 mx-auto text-gray-400 group-hover:text-blue-500 transition mb-3" />
              <p className="text-gray-700 dark:text-gray-300 font-semibold mb-1">
                Click to select CSV file
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {fileName || "No file selected"}
              </p>
            </button>
          </div>

          {/* Import Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleImport}
            disabled={uploading || !fileName}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Import Students
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3"
              >
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-400">
                    ✅ Successful
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                    {result.success}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className={`rounded-lg p-4 flex items-start gap-3 border ${
                  result.failed === 0
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                    : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                }`}
              >
                <AlertCircle
                  className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                    result.failed === 0
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                />
                <div>
                  <p
                    className={`font-semibold ${
                      result.failed === 0
                        ? "text-blue-800 dark:text-blue-400"
                        : "text-red-800 dark:text-red-400"
                    }`}
                  >
                    {result.failed === 0 ? "✨ No Errors" : "❌ Failed"}
                  </p>
                  <p
                    className={`text-2xl font-bold mt-1 ${
                      result.failed === 0
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {result.failed}
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Success List */}
            {result.created.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-600" />
                  Created Students ({result.created.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.created.map((student, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg"
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {student.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {student.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Error List */}
            {result.errors.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-slate-900 rounded-lg shadow-sm p-6"
              >
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Errors ({result.errors.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {result.errors.map((error, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg"
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {error}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* New Import Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setResult(null);
                setFileName("");
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className="w-full py-3 px-4 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition"
            >
              Import Another File
            </motion.button>
          </motion.div>
        )}

        {/* CSV Format Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6"
        >
          <h3 className="font-semibold text-yellow-800 dark:text-yellow-400 mb-3">
            📝 CSV Format Requirements
          </h3>
          <div className="space-y-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p>
              <strong>Required columns:</strong> firstName, lastName, email
            </p>
            <p>
              <strong>Optional columns:</strong> registrationNumber, department,
              semester, password
            </p>
            <p>
              <strong>Default values:</strong> department uses your department,
              semester defaults to 1, password defaults to "Demo@123"
            </p>
            <p className="mt-3">
              <strong>Example:</strong>
              <br />
              <code className="bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded mt-1 block font-mono text-xs">
                firstName,lastName,email,registrationNumber,department,semester
                <br />
                John,Doe,john@example.com,S2024001,CSE,1
              </code>
            </p>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
