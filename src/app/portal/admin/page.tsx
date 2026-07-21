"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, GraduationCap, FileText, CreditCard, Mail, Settings,
  LogOut, BarChart3, Menu, X, Check, Eye, EyeOff, ArrowLeft, Loader2
} from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { supabase } from "@/lib/supabase";
import { linkOrInviteParent } from "@/app/actions/auth";

// Import types & enums
import {
  ApplicationStatus, StudentStatus, PaymentMethod, AdminRole,
  Student, Application, Payment, ActivityLog, Broadcast, BroadcastTemplate,
  ConfigVersion, AdminUser
} from "@/types/admin";

// Import modular tab components

import { ConfirmDialog } from "@/components/TeacherPortal/ConfirmDialog";
import { DashboardTab } from "@/components/AdminPortal/DashboardTab";
import { StudentsTab } from "@/components/AdminPortal/StudentsTab";
import { TeachersTab } from "@/components/AdminPortal/TeachersTab";
import { ApplicationsTab } from "@/components/AdminPortal/ApplicationsTab";
import { FinanceTab } from "@/components/AdminPortal/FinanceTab";
import { ContentControlTab } from "@/components/AdminPortal/ContentControlTab";
import { CommunicationsTab } from "@/components/AdminPortal/CommunicationsTab";
import { AnalyticsTab } from "@/components/AdminPortal/AnalyticsTab";
import { SettingsTab } from "@/components/AdminPortal/SettingsTab";

// Static mock databases
const initialStudentsList: Student[] = [
  { id: "stu-1", name: "Aarav Sharma", grade: "Class VIII", rollNo: "12", parent: "Priya Sharma", status: StudentStatus.Active, enrollmentDate: "2025-06-15" },
  { id: "stu-2", name: "Aisha Khan", grade: "Class IX", rollNo: "01", parent: "Zafar Khan", status: StudentStatus.Active, enrollmentDate: "2025-06-15" },
  { id: "stu-3", name: "Rohan Das", grade: "Class IX", rollNo: "02", parent: "Nikhil Das", status: StudentStatus.Active, enrollmentDate: "2025-06-15" },
  { id: "stu-4", name: "Sneha Reddy", grade: "Class IX", rollNo: "03", parent: "Kiran Reddy", status: StudentStatus.Suspended, enrollmentDate: "2025-06-15" },
];

const initialApplicationsList: Application[] = [
  { id: "app-1", name: "Meera Kapoor", email: "meera@demo.com", phone: "+91 98765 11111", grade: "Class V", date: "2026-06-28", status: ApplicationStatus.Pending, appliedDate: "2026-06-28" },
  { id: "app-2", name: "Aditya Malhotra", email: "aditya@demo.com", phone: "+91 98765 22222", grade: "Class I", date: "2026-06-27", status: ApplicationStatus.Approved, appliedDate: "2026-06-27" },
  { id: "app-3", name: "Sanya Gupta", email: "sanya@demo.com", phone: "+91 98765 33333", grade: "Nursery", date: "2026-06-27", status: ApplicationStatus.UnderReview, appliedDate: "2026-06-27" },
  { id: "app-4", name: "Rishi Patel", email: "rishi@demo.com", phone: "+91 98765 44444", grade: "Class VIII", date: "2026-06-26", status: ApplicationStatus.Approved, appliedDate: "2026-06-26" },
  { id: "app-5", name: "Tanvi Jain", email: "tanvi@demo.com", phone: "+91 98765 55555", grade: "Class III", date: "2026-06-26", status: ApplicationStatus.Rejected, appliedDate: "2026-06-26" },
];

const initialPaymentsList: Payment[] = [
  { id: "pay-1", family: "Sharma family", amount: 55000, method: PaymentMethod.UPI, date: "2026-06-30", referenceNo: "TXN55000", status: "Success", term: "Term 1", createdAt: "2026-06-30T10:30:00Z", updatedAt: "2026-06-30T10:30:00Z" },
  { id: "pay-2", family: "Kapoor family", amount: 18333, method: PaymentMethod.Card, date: "2026-06-30", referenceNo: "TXN18333", status: "Success", term: "Term 1", createdAt: "2026-06-30T11:00:00Z", updatedAt: "2026-06-30T11:00:00Z" },
];

const initialActivityList: ActivityLog[] = [
  { id: "act-1", time: "10m ago", text: "New application received — Meera Kapoor (Class V)", type: "info", userId: "system", timestamp: Date.now() - 10 * 60000 },
  { id: "act-2", time: "1h ago", text: "Fee payment received — ₹55,000 from Sharma family", type: "success", userId: "system", timestamp: Date.now() - 60 * 60000 },
  { id: "act-3", time: "2h ago", text: "Admissions application approved — Aditya Malhotra (Class I)", type: "success", userId: "system", timestamp: Date.now() - 120 * 60000 },
];

const broadcastTemplates: BroadcastTemplate[] = [
  {
    id: "tmpl-1",
    name: "Fee Reminder Notice",
    subject: "Tuition installment due date reminder",
    body: "Dear Parents, this is a reminder to clear pending Term 2 school tuition fees before August 1st. Ignore if already paid.",
    variables: ["dueDate"],
    createdAt: "2026-06-30T09:00:00Z"
  },
  {
    id: "tmpl-2",
    name: "Parent PTM Announcement",
    subject: "School Parent-Teacher Meeting",
    body: "Dear Parents, the Parent-Teacher Meeting (PTM) for Unit Test 3 review is scheduled on July 12 from 9 AM to 1 PM.",
    variables: ["ptmDate"],
    createdAt: "2026-06-30T09:00:00Z"
  }
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: Users, label: "Students Registry", id: "students" },
  { icon: GraduationCap, label: "Teachers Directory", id: "teachers" },
  { icon: GraduationCap, label: "Admissions Registry", id: "admissions" },
  { icon: CreditCard, label: "Finance audits", id: "finance" },
  { icon: FileText, label: "Content Control", id: "content" },
  { icon: Mail, label: "Communications Board", id: "communications" },
  { icon: BarChart3, label: "System Analytics", id: "analytics" },
  { icon: Settings, label: "System Settings", id: "settings" },
];

export default function AdminPortalPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check for existing session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsLoggedIn(true);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    
    try {
      // Auth Check
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      
      if (error) {
        setLoginError(error.message);
        return;
      }
      
      // Check Profile Role
      if (data.user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
        if (profile && profile.role === "admin") {
          setIsLoggedIn(true);
        } else {
          await supabase.auth.signOut();
          setLoginError("Unauthorized access. Admin privileges required.");
        }
      }
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDialogAction({ type: "signOut" });
  };

  // Authenticated Admin Profile template
  const adminUser: AdminUser = {
    id: "admin-1",
    name: "Dr. Sanjay Kumar",
    email: "admin@school.com",
    role: AdminRole.SuperAdmin,
    permissions: [
      "manage_students",
      "manage_applications",
      "manage_finance",
      "manage_content",
      "send_broadcasts",
      "view_analytics"
    ],
    isActive: true
  };

  // Persistent States - Now linked to Supabase
  const [students, setStudents] = useState<Student[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [paymentLog, setPaymentLog] = useState<Payment[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  
  const [configVersions, setConfigVersions] = useLocalStorage<ConfigVersion[]>("admin-config-versions", []);
  const [editableConfig, setEditableConfig] = useLocalStorage("admin-school-config", {
    schoolName: siteConfig.schoolName as string,
    tagline: siteConfig.tagline as string,
    foundedYear: siteConfig.foundedYear as number,
    phone: siteConfig.phone as string,
    email: siteConfig.email as string
  });

  // Fetch initial data from Supabase upon login
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchDatabase = async () => {
      try {
        const [
          { data: stuData },
          { data: appData },
          { data: payData },
          { data: actData },
          { data: broadData }
        ] = await Promise.all([
          supabase.from("students").select("*"),
          supabase.from("applications").select("*"),
          supabase.from("payment_logs").select("*"),
          supabase.from("activity_logs").select("*").order("timestamp", { ascending: false }),
          supabase.from("announcements").select("*")
        ]);

        if (stuData) {
          setStudents(stuData.map(s => ({
            id: s.id, name: s.name, rollNo: s.roll_no, grade: s.grade, parent: s.parent,
            status: s.status as StudentStatus, dob: s.dob, email: s.email, phone: s.phone,
            enrollmentDate: s.enrollment_date, deletedAt: s.deleted_at
          })));
        }

        if (appData) {
          setApplications(appData.map(a => ({
            id: a.id, name: a.name, email: a.email, phone: a.phone, grade: a.grade,
            status: a.status as ApplicationStatus, parentName: a.parent_name, parentPhone: a.parent_phone,
            parentEmail: a.parent_email, document: a.document, appliedDate: a.applied_date,
            date: a.applied_date, // Added missing date field
            reviewedDate: a.reviewed_date, reviewedBy: a.reviewed_by, notes: a.notes
          })));
        }

        if (payData) {
          setPaymentLog(payData.map(p => ({
            id: p.id, studentId: p.student_id, family: p.family, amount: p.amount,
            method: p.method as PaymentMethod, date: p.date, referenceNo: p.reference_no,
            receiptUrl: p.receipt_url, status: p.status, term: p.term,
            createdAt: p.created_at, updatedAt: p.created_at
          })));
        }

        if (actData) {
          setActivities(actData.map(a => ({
            id: a.id, time: new Date(a.timestamp).toLocaleTimeString(), text: a.text,
            type: a.type as ActivityLog["type"], userId: a.user_id, timestamp: a.timestamp
          })));
        }

        if (broadData) {
          setBroadcasts(broadData.map(b => ({
            id: b.id, target: b.target as "all" | "parents" | "teachers", message: b.content,
            sentAt: b.created_at, sentBy: "System", recipients: 0, status: "Sent"
          })));
        }
      } catch (err) {
        console.error("Failed to load Supabase data:", err);
      }
    };

    fetchDatabase();
  }, [isLoggedIn]);

  // Action Success Triggers
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // ── Global Confirm / Alert Dialog State ──
  type DialogAction = 
    | { type: "alert"; variant: "danger" | "warning" | "info" | "success"; title: string; message: string; }
    | { type: "signOut" }
    | { type: "archiveStudent"; studentId: string; studentName: string }
    | { type: "changeInquiryStatus"; appId: string; appName: string; newStatus: ApplicationStatus }
    | { type: "approveAllInquiries"; selectedIds: string[] }
    | { type: "restoreVersion"; versionId: string; timestamp: string }
    | null;
  const [dialogAction, setDialogAction] = useState<DialogAction>(null);

  const getDialogConfig = (action: DialogAction) => {
    if (!action) return null;
    if (action.type === "alert") return { title: action.title, message: action.message, label: "OK", variant: action.variant, isAlert: true };
    if (action.type === "signOut") return { title: "Sign Out", message: "Are you sure you want to sign out from the Admin Portal?", label: "Sign Out", variant: "warning" as const, isAlert: false };
    if (action.type === "archiveStudent") return { title: "Archive Student", message: `Are you sure you want to archive student profile: ${action.studentName}?`, label: "Archive", variant: "danger" as const, isAlert: false };
    if (action.type === "changeInquiryStatus") return { title: "Change Status", message: `Change inquiry status of ${action.appName} to "${action.newStatus}"?`, label: "Change Status", variant: "warning" as const, isAlert: false };
    if (action.type === "approveAllInquiries") return { title: "Approve Selected", message: `Approve all selected ${action.selectedIds.length} admission inquiries?`, label: "Approve All", variant: "success" as const, isAlert: false };
    if (action.type === "restoreVersion") return { title: "Restore Settings", message: `Restore website settings to this archived rollback version?`, label: "Restore", variant: "warning" as const, isAlert: false };
    return null;
  };

  const executeDialog = async () => {
    if (!dialogAction) return;
    
    if (dialogAction.type === "signOut") {
      setIsLoggedIn(false);
    } 
    else if (dialogAction.type === "archiveStudent") {
      setStudents((prev) => prev.map((s) => (s.id === dialogAction.studentId ? { ...s, deletedAt: new Date().toISOString() } : s)));
      logActivity(`Archived student file — ${dialogAction.studentName}`, "warning");
      await supabase.from("students").update({ deleted_at: new Date().toISOString() }).eq("id", dialogAction.studentId);
    }
    else if (dialogAction.type === "changeInquiryStatus") {
      setApplications((prev) => prev.map((a) => (a.id === dialogAction.appId ? { ...a, status: dialogAction.newStatus } : a)));
      logActivity(`Admissions inquiry updated: ${dialogAction.appName} -> ${dialogAction.newStatus}`, dialogAction.newStatus === ApplicationStatus.Approved ? "success" : "warning");
      await supabase.from("applications").update({ status: dialogAction.newStatus }).eq("id", dialogAction.appId);
    }
    else if (dialogAction.type === "approveAllInquiries") {
      setApplications((prev) => prev.map((a) => (dialogAction.selectedIds.includes(a.id) ? { ...a, status: ApplicationStatus.Approved } : a)));
      logActivity(`Bulk approved ${dialogAction.selectedIds.length} inquiries`, "success");
      setDialogAction({ type: "alert", variant: "success", title: "Bulk Approved", message: `Approved ${dialogAction.selectedIds.length} registration inquiries!` });
      await supabase.from("applications").update({ status: ApplicationStatus.Approved }).in("id", dialogAction.selectedIds);
      return;
    }
    else if (dialogAction.type === "restoreVersion") {
      const version = configVersions.find((v) => v.id === dialogAction.versionId);
      if (version) {
        setEditableConfig(version.config);
        logActivity(`Rollback website configuration parameters targeting ${new Date(version.timestamp).toLocaleDateString()}`, "warning");
        setDialogAction({ type: "alert", variant: "success", title: "Rollback Successful", message: "Parameters successfully rolled back!" });
        return;
      }
    }
    
    setDialogAction(null);
  };

  // Activity centralized loggeration structures
  const [studentFormErrors, setStudentFormErrors] = useState<Record<string, string>>({});
  const [paymentFormErrors, setPaymentFormErrors] = useState<Record<string, string>>({});
  const [configFormErrors, setConfigFormErrors] = useState<Record<string, string>>({});

  // Search filter terms
  const [studentSearch, setStudentSearch] = useState("");

  // Audit activity logger Helper
  const logActivity = async (text: string, type: ActivityLog["type"] = "info") => {
    const timestamp = Date.now();
    const timeString = new Date(timestamp).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
    const log: ActivityLog = { id: crypto.randomUUID(), time: timeString, text, type, userId: adminUser.id, timestamp };
    setActivities((prev) => [log, ...prev]);
    // Fire and forget DB insertion
    supabase.from("activity_logs").insert({ text, type, user_id: adminUser.id, timestamp });
  };

  // Enforce session timeout limits (4 Hours)
  useEffect(() => {
    if (!isLoggedIn) return;
    const sessionTimer = setTimeout(() => {
      setIsLoggedIn(false);
      setDialogAction({ type: "alert", variant: "warning", title: "Session Expired", message: "Please log in again for server auditing security." });
    }, 4 * 60 * 60 * 1000); // 4 hours lock
    return () => clearTimeout(sessionTimer);
  }, [isLoggedIn]);

  // Compute live collection statistics from actual logs
  const stats = useMemo(() => {
    const active = students.filter((s) => !s.deletedAt && s.status === StudentStatus.Active).length;
    const pendingApps = applications.filter((a) => a.status === ApplicationStatus.Pending).length;
    
    const collectionsTotal = paymentLog
      .filter((p) => p.status === "Success")
      .reduce((sum, p) => sum + p.amount, 0);

    const targetLimit = 2000000; // 20 Lakhs
    const collectionPercentage = (collectionsTotal / targetLimit) * 100;

    const approvedApps = applications.filter((a) => a.status === ApplicationStatus.Approved).length;
    const totalApps = applications.length;
    const approvalRate = totalApps > 0 ? ((approvedApps / totalApps) * 100).toFixed(0) : "80";

    return {
      totalStudents: active,
      newApplications: pendingApps,
      totalFeeCollected: collectionsTotal,
      feeCollectionPercentage: collectionPercentage,
      approvalRate
    };
  }, [students, applications, paymentLog]);

  const handleAddStudent = async (newStu: Omit<Student, "id" | "enrollmentDate">) => {
    const errors: Record<string, string> = {};
    if (!newStu.name.trim()) errors.name = "Student Name is required";
    if (!newStu.rollNo.trim()) errors.rollNo = "Roll number is required";
    if (!newStu.parent.trim()) errors.parent = "Parent Name is required";
    if (!newStu.parentEmail?.trim()) errors.parentEmail = "Parent Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(newStu.parentEmail)) errors.parentEmail = "Invalid email format";

    const isDuplicate = students.some(
      (s) => !s.deletedAt && s.grade === newStu.grade && s.rollNo === newStu.rollNo
    );
    if (isDuplicate) {
      errors.rollNo = "Duplicate roll number exists in this grade!";
    }

    if (Object.keys(errors).length > 0) {
      setStudentFormErrors(errors);
      return false;
    }

    // Link or invite parent before inserting student
    const linkRes = await linkOrInviteParent(newStu.parentEmail!.trim());
    if (!linkRes.success) {
      setStudentFormErrors({ parentEmail: linkRes.error || "Failed to link/invite parent" });
      return false;
    }

    const student: Student = {
      ...newStu,
      id: crypto.randomUUID(),
      parentId: linkRes.parentId, // Store parent UUID
      status: StudentStatus.Active,
      enrollmentDate: new Date().toISOString().split("T")[0]
    };

    setStudents((prev) => [...prev, student]);
    setStudentFormErrors({});
    logActivity(`Registered new student — ${student.name} (${student.grade})`, "success");
    setDialogAction({ type: "alert", variant: "success", title: "Student Registered", message: `Successfully registered ${student.name}!` });
    
    // Write to Supabase
    const { data: inviteRes } = await supabase.from("students").insert({
      id: student.id,
      name: student.name,
      roll_no: student.rollNo,
      grade: student.grade,
      parent: student.parent,
      status: student.status,
      enrollment_date: student.enrollmentDate,
      parent_id: student.parentId // Ensure we link the ID
    });

    return true;
  };

  const handleDeleteStudent = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;
    setDialogAction({ type: "archiveStudent", studentId: student.id, studentName: student.name });
  };

  const handleRestoreStudent = async (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, deletedAt: undefined } : s))
    );
    logActivity(`Restored archived student — ${student.name}`, "success");
    setDialogAction({ type: "alert", variant: "success", title: "Student Restored", message: `Student profile ${student.name} restored to active directory.` });
    await supabase.from("students").update({ deleted_at: null }).eq("id", studentId);
  };

  const [isImportingStudentCSV, setIsImportingStudentCSV] = useState(false);

  const handleImportCSV = async (file: File) => {
    setIsImportingStudentCSV(true);
    try {
      const text = await file.text();
      const rawRows = text.split(/\r?\n/).map(r => r.trim()).filter(r => r.length > 0);
      const imported: Student[] = [];
      const dbRows: any[] = [];
      let invitedCount = 0;

      const startIdx = (rawRows.length > 0 && /roll|student|name|grade|parent/i.test(rawRows[0])) ? 1 : 0;
      const rows = rawRows.slice(startIdx);

      for (const row of rows) {
        const cols = row.split(",").map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length >= 4 && cols[0]) {
          let rollNo = cols[0];
          let name = cols[1];
          let grade = cols[2];
          let section = "";
          let parentName = "";
          let parentEmail = "";
          let phone = "";

          if (cols.length >= 6) {
            section = cols[3];
            parentName = cols[4];
            parentEmail = cols[5];
            phone = cols[6] || "";
          } else if (cols.length === 5) {
            parentName = cols[3];
            parentEmail = cols[4];
          } else {
            parentName = cols[3];
          }

          let parentId = "";
          if (parentEmail && /^\S+@\S+\.\S+$/.test(parentEmail)) {
            const linkRes = await linkOrInviteParent(parentEmail);
            if (linkRes.success && linkRes.parentId) {
              parentId = linkRes.parentId;
              invitedCount++;
            }
          }

          const sId = crypto.randomUUID();
          imported.push({
            id: sId,
            rollNo,
            name,
            grade,
            parent: parentName,
            parentEmail: parentEmail || undefined,
            parentId: parentId || undefined,
            status: StudentStatus.Active,
            enrollmentDate: new Date().toISOString().split("T")[0]
          });

          dbRows.push({
            id: sId,
            roll_no: rollNo,
            name: name,
            grade: grade,
            section: section || null,
            parent: parentName,
            parent_id: parentId || null,
            email: parentEmail || null,
            phone: phone || null,
            status: StudentStatus.Active,
            enrollment_date: new Date().toISOString().split("T")[0]
          });
        }
      }

      if (imported.length === 0) {
        setDialogAction({ type: "alert", variant: "warning", title: "Import Failed", message: "No valid rows discovered in CSV sheet file." });
        return;
      }

      // Batch insert into database
      await supabase.from("students").insert(dbRows);

      setStudents(prev => [...prev, ...imported]);
      logActivity(`Bulk imported ${imported.length} student records via CSV`, "success");
      setDialogAction({ 
        type: "alert", 
        variant: "success", 
        title: "Import Successful", 
        message: `Imported ${imported.length} students successfully! ${invitedCount > 0 ? `Sent ${invitedCount} parent invitation emails with password setup links.` : ''}` 
      });
    } catch (err: any) {
      console.error("CSV Import error:", err);
      setDialogAction({ type: "alert", variant: "danger", title: "Import Failed", message: "Failed to parse CSV spreadsheet file. Verify row alignment formatting." });
    } finally {
      setIsImportingStudentCSV(false);
    }
  };

  const handleExportCSV = () => {
    const active = students.filter((s) => !s.deletedAt);
    const headers = ["Roll No", "Student Name", "Class/Grade", "Parent Name", "Parent Email", "Status", "Registration Date"];
    const rows = active.map((s) => [s.rollNo, s.name, s.grade, s.parent, s.parentEmail || "", s.status, s.enrollmentDate]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `students_directory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logActivity("Exported student registry directory to CSV file", "info");
  };

  // 2. Admissions Inquiries Status handlers
  const handleApplicationStatus = (appId: string, newStatus: ApplicationStatus) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;
    setDialogAction({ type: "changeInquiryStatus", appId: app.id, appName: app.name, newStatus });
  };

  const handleBulkApprove = (selectedIds: string[]) => {
    setDialogAction({ type: "approveAllInquiries", selectedIds });
  };

  // 3. Finance Payments logging
  const handleLogPayment = async (pay: Omit<Payment, "id" | "createdAt" | "updatedAt">) => {
    const errors: Record<string, string> = {};
    if (!pay.family.trim()) errors.family = "Payer family name is required";
    if (pay.amount <= 0) errors.amount = "Payment amount must be positive";
    if (!pay.referenceNo.trim()) errors.referenceNo = "Reference ID is required";

    if (Object.keys(errors).length > 0) {
      setPaymentFormErrors(errors);
      return;
    }

    const transaction: Payment = {
      ...pay,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPaymentLog((prev) => [transaction, ...prev]);
    setPaymentFormErrors({});
    setPaymentSuccess(true);
    logActivity(`Recorded fee payment — ₹${pay.amount.toLocaleString()} from ${pay.family}`, "success");
    setTimeout(() => setPaymentSuccess(false), 3000);
    
    // DB sync
    await supabase.from("payment_logs").insert({
      id: transaction.id,
      family: transaction.family,
      amount: transaction.amount,
      method: transaction.method,
      date: transaction.date,
      reference_no: transaction.referenceNo,
      status: transaction.status,
      term: transaction.term
    });
  };

  // 4. Content parameters changes
  const handleSaveConfig = (newCfg: typeof editableConfig) => {
    const errors: Record<string, string> = {};
    if (!newCfg.schoolName.trim()) errors.schoolName = "School name is required";
    if (!newCfg.tagline.trim()) errors.tagline = "Tagline is required";
    if (newCfg.foundedYear < 1900 || newCfg.foundedYear > new Date().getFullYear()) {
      errors.foundedYear = "Invalid year range";
    }
    if (!newCfg.phone.trim()) errors.phone = "Helpline contact is required";
    if (!newCfg.email.trim().includes("@")) errors.email = "Invalid email formatting";

    if (Object.keys(errors).length > 0) {
      setConfigFormErrors(errors);
      return;
    }

    // Save configuration parameters rollback version
    const version: ConfigVersion = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      config: editableConfig,
      changedBy: adminUser.name,
      description: `Metadata altered: schoolName = ${newCfg.schoolName}`
    };

    setConfigVersions((prev) => [version, ...prev]);
    setEditableConfig(newCfg);
    setConfigFormErrors({});
    setConfigSuccess(true);
    logActivity("School settings config updated", "success");
    setTimeout(() => setConfigSuccess(false), 3000);
  };

  const handleRollbackConfig = (versionId: string) => {
    const version = configVersions.find((v) => v.id === versionId);
    if (!version) return;
    setDialogAction({ type: "restoreVersion", versionId: version.id, timestamp: version.timestamp });
  };

  // 5. Broadcast alerts dispatches
  const handleSendBroadcast = async (target: "all" | "parents" | "teachers", msg: string) => {
    let count = 0;
    if (target === "all") count = students.length * 1.5;
    else if (target === "parents") count = students.length;
    else count = 25; // mock teachers count

    const dispatch: Broadcast = {
      id: crypto.randomUUID(),
      target,
      message: msg,
      sentAt: new Date().toISOString(),
      sentBy: adminUser.name,
      recipients: Math.round(count),
      status: "Sent"
    };

    setBroadcasts((prev) => [dispatch, ...prev]);
    setBroadcastSuccess(true);
    logActivity(`Broadcast dispatched to ${target} (Recipients: ${dispatch.recipients})`, "success");
    setTimeout(() => setBroadcastSuccess(false), 3000);
    
    // Write to announcements table
    await supabase.from("announcements").insert({
      id: dispatch.id,
      title: `Broadcast to ${target}`,
      content: msg,
      target: target
    });
  };

  // 6. Analytics HTML Report generation
  const handleExportAnalytics = () => {
    const reportHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Academic System Report - HMEMS</title>
        <style>
          body { font-family: sans-serif; padding: 2rem; color: #1e293b; }
          h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
          .card { background: #f8fafc; padding: 1.5rem; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 1.5rem; }
          table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
          th { background: #f1f5f9; }
        </style>
      </head>
      <body>
        <h1>${editableConfig.schoolName}</h1>
        <p>${editableConfig.tagline} · Founded: ${editableConfig.foundedYear}</p>
        
        <div class="card">
          <h2>Administrative Statistics Summary</h2>
          <ul>
            <li><strong>Total Enrolled Students:</strong> ${stats.totalStudents}</li>
            <li><strong>Inquiry Approval rate:</strong> ${stats.approvalRate}%</li>
            <li><strong>Tuition Collections:</strong> ₹${stats.totalFeeCollected.toLocaleString()}</li>
          </ul>
        </div>

        <div class="card">
          <h2>Fee Audit Payment Logs</h2>
          <table>
            <thead>
              <tr><th>Date</th><th>Payer Family</th><th>Method</th><th>Term</th><th>Amount</th></tr>
            </thead>
            <tbody>
              ${paymentLog
                .map(
                  (p) =>
                    `<tr><td>${p.date}</td><td>${p.family}</td><td>${p.method}</td><td>${p.term}</td><td>₹${p.amount.toLocaleString()}</td></tr>`
                )
                .join("")}
            </tbody>
          </table>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([reportHtml], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `school_analytics_report_${new Date().toISOString().split("T")[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    logActivity("Dispatched analytical html system report download trigger", "info");
  };


  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-6 relative overflow-hidden">
        {/* Exit link to website */}
        <Link href="/" className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl shadow-md transition-all hover:translate-y-[-2px] text-xs md:text-sm cursor-pointer backdrop-blur-sm">
          <ArrowLeft size={16} /> Back to Website
        </Link>
        {/* Background shapes */}
        <div className="absolute top-0 -left-10 w-72 h-72 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
          className="w-full max-w-md relative z-10"
        >
          <div className="bg-white rounded-3xl border border-border shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
            <div className="h-1.5 bg-accent" />
            <div className="p-8 md:p-10">
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-accent mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <Settings size={30} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-primary tracking-tight">Admin Portal</h1>
                <p className="text-slate-500 text-xs mt-1.5 font-semibold max-w-[280px] mx-auto leading-relaxed">{siteConfig.schoolName}</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {loginError && (
                  <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-lg text-center">
                    {loginError}
                  </div>
                )}
                <div>
                  <label htmlFor="loginEmail" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Admin Email</label>
                  <input
                    id="loginEmail"
                    type="email"
                    placeholder="admin@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-slate-50/50 hover:bg-slate-50 transition-all font-medium"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="loginPassword" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input
                      id="loginPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-slate-50/50 hover:bg-slate-50 transition-all font-medium pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full h-12 bg-accent hover:bg-accent-light text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all text-base mt-3 cursor-pointer disabled:opacity-75 flex items-center justify-center gap-2"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Secure Login"
                  )}
                </button>
              </form>

              <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed font-medium">
                Demo mode — click login to explore the admin panel
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 lg:grid lg:grid-cols-[auto_1fr]">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-primary flex-col sticky top-0 h-screen shrink-0 z-20">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-bold shadow-lg">
              {siteConfig.shortName.charAt(0)}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Admin Panel</p>
              <p className="text-white/40 text-xs">{siteConfig.shortName}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === item.id
                  ? "bg-accent/20 text-accent-light"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
              SK
            </div>
            <div>
              <p className="text-white text-sm font-medium">Dr. Sanjay Kumar</p>
              <p className="text-white/40 text-xs">Principal</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/40 hover:text-white text-xs transition-colors cursor-pointer"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Top Nav */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-primary z-30 px-4 py-3 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white text-xs font-bold">
              {siteConfig.shortName.charAt(0)}
            </div>
            <span className="text-white font-semibold text-sm">Admin Panel</span>
          </div>
          <button onClick={handleLogout} className="text-white/50 hover:text-white cursor-pointer">
            <LogOut size={18} />
          </button>
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer ${
                activeTab === item.id
                  ? "bg-accent/20 text-accent-light font-medium"
                  : "text-white/50"
              }`}
            >
              <item.icon size={14} />
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="w-full min-w-0 pt-24 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 border-b border-slate-200 pb-5">
            <h1 className="text-2xl font-bold text-slate-800">System Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">
              Admin console overview | {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <DashboardTab
                  stats={stats}
                  applications={applications}
                  activities={activities}
                  onNavigateToTab={setActiveTab}
                />
              </motion.div>
            )}

            {activeTab === "students" && (
              <motion.div key="students" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <StudentsTab
                  students={students}
                  studentSearch={studentSearch}
                  onChangeSearch={setStudentSearch}
                  onAddStudent={async (s) => await handleAddStudent(s)}
                  onDeleteStudent={handleDeleteStudent}
                  onRestoreStudent={handleRestoreStudent}
                  onImportCSV={handleImportCSV}
                  onExportCSV={handleExportCSV}
                  isImporting={isImportingStudentCSV}
                  formErrors={studentFormErrors}
                  clearFormErrors={() => setStudentFormErrors({})}
                />
              </motion.div>
            )}

            {activeTab === "teachers" && (
              <motion.div key="teachers" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <TeachersTab />
              </motion.div>
            )}

            {activeTab === "admissions" && (
              <motion.div key="admissions" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <ApplicationsTab
                  applications={applications}
                  onStatusChange={handleApplicationStatus}
                  onBulkApprove={handleBulkApprove}
                />
              </motion.div>
            )}

            {activeTab === "finance" && (
              <motion.div key="finance" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <FinanceTab
                  paymentLog={paymentLog}
                  onLogPayment={handleLogPayment}
                  formErrors={paymentFormErrors}
                  paymentSuccess={paymentSuccess}
                />
              </motion.div>
            )}

            {activeTab === "content" && (
              <motion.div key="content" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <ContentControlTab
                  editableConfig={editableConfig}
                  configVersions={configVersions}
                  onSaveConfig={handleSaveConfig}
                  onRollbackConfig={handleRollbackConfig}
                  formErrors={configFormErrors}
                  configSuccess={configSuccess}
                />
              </motion.div>
            )}

            {activeTab === "communications" && (
              <motion.div key="communications" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CommunicationsTab
                  broadcasts={broadcasts}
                  templates={broadcastTemplates}
                  onSendBroadcast={handleSendBroadcast}
                  broadcastSuccess={broadcastSuccess}
                />
              </motion.div>
            )}

            {activeTab === "analytics" && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <AnalyticsTab
                  students={students}
                  payments={paymentLog}
                  feeCollectionGoal={stats.totalFeeCollected}
                  onExportReport={handleExportAnalytics}
                />
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <SettingsTab />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ── Global Confirm / Alert Dialog ── */}
      {dialogAction && getDialogConfig(dialogAction) && (
        <ConfirmDialog
          isOpen={true}
          title={getDialogConfig(dialogAction)!.title}
          message={getDialogConfig(dialogAction)!.message}
          confirmLabel={getDialogConfig(dialogAction)!.label}
          cancelLabel="Cancel"
          variant={getDialogConfig(dialogAction)!.variant}
          isAlert={getDialogConfig(dialogAction)!.isAlert}
          onConfirm={executeDialog}
          onCancel={() => setDialogAction(null)}
        />
      )}
    </div>
  );
}
