import axios, { AxiosError } from "axios";
import { toast } from "react-hot-toast";

const API_BASE_URL = "/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ============= AUTH ENDPOINTS =============

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
  },
  register: async (data: any) => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },
  getProfile: async () => {
    const response = await apiClient.get("/auth/profile");
    return response.data;
  },
};

// ============= USER ENDPOINTS =============

export const usersApi = {
  getAll: async (role?: string, department?: string) => {
    const params = new URLSearchParams();
    if (role) params.append("role", role);
    if (department) params.append("department", department);
    const response = await apiClient.get(`/users?${params}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post("/users", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/users/${id}`);
  },
};

// ============= FACE REGISTRATION ENDPOINTS =============

export const faceApi = {
  register: async (userId: string, embedding: string, imageUrl?: string) => {
    const response = await apiClient.post("/face/register", {
      userId,
      embedding,
      imageUrl,
    });
    return response.data;
  },
  getFaceData: async (userId: string) => {
    const response = await apiClient.get(`/face/${userId}`);
    return response.data;
  },
  recognize: async (embedding: string) => {
    const response = await apiClient.post("/face/recognize", { embedding });
    return response.data;
  },
};

// ============= CLASS ENDPOINTS =============

export const classesApi = {
  getAll: async (department?: string) => {
    const params = new URLSearchParams();
    if (department) params.append("department", department);
    const response = await apiClient.get(`/classes?${params}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/classes/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post("/classes", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/classes/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/classes/${id}`);
  },
  getByTeacher: async (teacherId: string) => {
    const response = await apiClient.get(`/classes/teacher/${teacherId}`);
    return response.data;
  },
  getStudents: async (classId: string) => {
    const response = await apiClient.get(`/classes/${classId}/students`);
    return response.data;
  },
};

// ============= ATTENDANCE ENDPOINTS =============

export const attendanceApi = {
  getByClass: async (classId: string, date?: string) => {
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    const response = await apiClient.get(`/attendance/class/${classId}?${params}`);
    return response.data;
  },
  getByStudent: async (studentId: string, classId?: string) => {
    const params = new URLSearchParams();
    if (classId) params.append("classId", classId);
    const response = await apiClient.get(`/attendance/student/${studentId}?${params}`);
    return response.data;
  },
  mark: async (studentId: string, classId: string, status: string, confidence?: number) => {
    const response = await apiClient.post("/attendance/mark", {
      studentId,
      classId,
      status,
      confidence,
      date: new Date().toISOString(),
    });
    return response.data;
  },
  getStats: async (studentId: string, classId?: string) => {
    const params = new URLSearchParams();
    if (classId) params.append("classId", classId);
    const response = await apiClient.get(`/attendance/stats/${studentId}?${params}`);
    return response.data;
  },
};

// ============= LEAVE ENDPOINTS =============

export const leaveApi = {
  getAll: async (status?: string, studentId?: string) => {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    if (studentId) params.append("studentId", studentId);
    const response = await apiClient.get(`/leaves?${params}`);
    return response.data;
  },
  getById: async (id: string) => {
    const response = await apiClient.get(`/leaves/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post("/leaves", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/leaves/${id}`, data);
    return response.data;
  },
  approve: async (id: string) => {
    const response = await apiClient.patch(`/leaves/${id}/approve`, {});
    return response.data;
  },
  reject: async (id: string, reason: string) => {
    const response = await apiClient.patch(`/leaves/${id}/reject`, { reason });
    return response.data;
  },
};

// ============= TIMETABLE ENDPOINTS =============

export const timetableApi = {
  getByClass: async (classId: string) => {
    const response = await apiClient.get(`/timetable/class/${classId}`);
    return response.data;
  },
  getByTeacher: async (teacherId: string) => {
    const response = await apiClient.get(`/timetable/teacher/${teacherId}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await apiClient.post("/timetable", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await apiClient.put(`/timetable/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    await apiClient.delete(`/timetable/${id}`);
  },
  getCurrentClass: async (teacherId: string) => {
    const response = await apiClient.get(`/timetable/teacher/${teacherId}/current`);
    return response.data;
  },
};

// ============= REPORTS ENDPOINTS =============

export const reportsApi = {
  getShortageList: async (department?: string) => {
    const params = new URLSearchParams();
    if (department) params.append("department", department);
    const response = await apiClient.get(`/reports/shortage?${params}`);
    return response.data;
  },
  getAttendanceReport: async (classId: string, month?: number, year?: number) => {
    const params = new URLSearchParams();
    if (month) params.append("month", month.toString());
    if (year) params.append("year", year.toString());
    const response = await apiClient.get(`/reports/attendance/${classId}?${params}`);
    return response.data;
  },
  exportPDF: async (reportType: string, data: any) => {
    const response = await apiClient.post(
      `/reports/export/pdf`,
      { reportType, data },
      { responseType: "blob" }
    );
    return response.data;
  },
  exportExcel: async (reportType: string, data: any) => {
    const response = await apiClient.post(
      `/reports/export/excel`,
      { reportType, data },
      { responseType: "blob" }
    );
    return response.data;
  },
};

// ============= NOTIFICATIONS ENDPOINTS =============

export const notificationsApi = {
  getAll: async (unreadOnly?: boolean) => {
    const params = new URLSearchParams();
    if (unreadOnly) params.append("unreadOnly", "true");
    const response = await apiClient.get(`/notifications?${params}`);
    return response.data;
  },
  markAsRead: async (id: string) => {
    const response = await apiClient.patch(`/notifications/${id}/read`, {});
    return response.data;
  },
};

export default apiClient;
