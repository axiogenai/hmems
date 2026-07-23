export enum ApplicationStatus {
  Pending = "Pending",
  UnderReview = "Under Review",
  Approved = "Approved",
  Rejected = "Rejected",
  Waitlisted = "Waitlisted"
}

export enum StudentStatus {
  Active = "Active",
  Inactive = "Inactive",
  Suspended = "Suspended",
  Graduated = "Graduated"
}

export enum PaymentMethod {
  UPI = "UPI",
  Card = "Card",
  NetBanking = "Net Banking",
  Check = "Check",
  Cash = "Cash",
  MobileWallet = "Mobile Wallet"
}

export enum AdminRole {
  SuperAdmin = "SuperAdmin",
  FinanceAdmin = "FinanceAdmin",
  AdmissionsAdmin = "AdmissionsAdmin",
  AcademicsAdmin = "AcademicsAdmin"
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  rollNo: string;
  parent: string;
  parentEmail?: string;
  parentId?: string;
  status: StudentStatus;
  dob?: string;
  email?: string;
  phone?: string;
  enrollmentDate: string;
  deletedAt?: string;
}

export interface Application {
  id: string;
  name: string;
  email: string;
  phone: string;
  grade: string;
  date: string;
  status: ApplicationStatus;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  document?: string;
  appliedDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  notes?: string;
}

export interface Payment {
  id: string;
  studentId?: string;
  family: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  referenceNo: string;
  receiptUrl?: string;
  status: "Success" | "Failed" | "Pending" | "Refunded";
  term: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  time: string;
  text: string;
  type: "info" | "success" | "warning" | "error";
  userId: string;
  timestamp: number;
}

export interface Broadcast {
  id: string;
  target: "all" | "parents" | "teachers";
  message: string;
  sentAt: string;
  sentBy: string;
  recipients: number;
  status: "Draft" | "Sent" | "Failed";
}

export interface BroadcastTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  createdAt: string;
}

export interface ConfigVersion {
  id: string;
  timestamp: string;
  config: {
    schoolName: string;
    tagline: string;
    foundedYear: number;
    phone: string;
    email: string;
    principalName?: string;
    principalRole?: string;
    principalMessage?: string;
    principalPhoto?: string;
    [key: string]: any;
  };
  changedBy: string;
  description: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  permissions: string[];
  lastLogin?: string;
  isActive: boolean;
}
