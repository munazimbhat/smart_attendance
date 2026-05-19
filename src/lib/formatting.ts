// Formatting utilities for display

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDateTime(date: Date | string): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export function formatAttendancePercentage(present: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((present / total) * 100);
}

export function getAttendanceColor(percentage: number): string {
  if (percentage >= 75) return "text-green-600";
  if (percentage >= 50) return "text-yellow-600";
  return "text-red-600";
}

export function getAttendanceStatus(percentage: number): string {
  if (percentage >= 75) return "Good";
  if (percentage >= 50) return "Warning";
  return "Critical";
}

export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getMonthName(month: number): string {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month];
}

export function getDayName(day: number): string {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  return days[day];
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

export function classNameBuilder(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Confidence score formatting
export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(1)}%`;
}

// Role display names
export function getRoleDisplayName(role: string): string {
  const roleMap: Record<string, string> = {
    ADMIN: "Administrator",
    HOD: "Head of Department",
    TEACHER: "Teacher",
    STUDENT: "Student",
  };
  return roleMap[role] || role;
}

// Department display names
export function getDepartmentDisplayName(dept: string): string {
  const deptMap: Record<string, string> = {
    CSE: "Computer Science & Engineering",
    ECE: "Electronics & Communication",
    MECHANICAL: "Mechanical Engineering",
    CIVIL: "Civil Engineering",
    ELECTRICAL: "Electrical Engineering",
    BIOTECHNOLOGY: "Biotechnology",
    AEROSPACE: "Aerospace Engineering",
  };
  return deptMap[dept] || dept;
}

// Leave type colors
export function getLeaveTypeColor(type: string): string {
  const colorMap: Record<string, string> = {
    MEDICAL: "bg-red-100 text-red-800",
    PERSONAL: "bg-blue-100 text-blue-800",
    CASUAL: "bg-green-100 text-green-800",
    EMERGENCY: "bg-orange-100 text-orange-800",
  };
  return colorMap[type] || "bg-gray-100 text-gray-800";
}

// Leave status colors
export function getLeaveStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-800",
  };
  return statusMap[status] || "bg-gray-100 text-gray-800";
}

export function getAttendanceStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    PRESENT: "bg-green-100 text-green-800",
    ABSENT: "bg-red-100 text-red-800",
    LATE: "bg-yellow-100 text-yellow-800",
    LEFT_EARLY: "bg-orange-100 text-orange-800",
  };
  return statusMap[status] || "bg-gray-100 text-gray-800";
}
