import { useState, useCallback, useEffect } from "react";
import { attendanceApi } from "@/lib/api";

export function useAttendanceStats(studentId: string, classId?: string) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceApi.getStats(studentId, classId);
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch attendance stats");
    } finally {
      setLoading(false);
    }
  }, [studentId, classId]);

  useEffect(() => {
    if (studentId) {
      fetchStats();
    }
  }, [studentId, classId, fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}

export function useAttendanceList(classId: string, date?: string) {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await attendanceApi.getByClass(classId, date);
      setAttendance(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch attendance");
    } finally {
      setLoading(false);
    }
  }, [classId, date]);

  useEffect(() => {
    if (classId) {
      fetchAttendance();
    }
  }, [classId, date, fetchAttendance]);

  return { attendance, loading, error, refetch: fetchAttendance };
}
