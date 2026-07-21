export interface StudentProfile {
  id: string;
  name: string;
  rollNo: string;
  grade: string;
  section: string;
  dob: string;
  parentId: string;
  academicYear: string;
  currentGPA: number;
  status: "Active" | "Inactive" | "Suspended";
}

export interface ParentPortalUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  children: StudentProfile[];
  role: "parent";
}

export interface ChildGrade {
  studentId: string;
  subject: string;
  test: string;
  score: number;
  maxScore: number;
  grade: string;
  percentage: number;
  date: string;
}

export interface FeeRecord {
  id: string;
  studentId: string;
  term: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "Pending" | "Paid" | "Overdue";
  receiptUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: "High" | "Normal" | "Low";
  target: "All" | "Specific" | "Class" | "Individual";
  read: boolean;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: "Present" | "Absent" | "Leave" | "Late";
  reason?: string;
  remarks?: string;
}

export interface PaymentTransaction {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  method: "UPI" | "Card" | "Net Banking" | "Check" | "Cash";
  referenceNo: string;
  receiptUrl?: string;
  status: "Success" | "Failed" | "Pending";
}

export interface Message {
  id: string;
  from: "teacher" | "admin" | "system";
  senderName: string;
  subject: string;
  content: string;
  date: string;
  read: boolean;
  attachments?: string[];
}

export interface NotificationPreference {
  id: string;
  userId: string;
  gradesPosted: boolean;
  attendanceUpdates: boolean;
  feeReminders: boolean;
  eventNotifications: boolean;
}
