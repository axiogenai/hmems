"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, LogOut, GraduationCap, CreditCard, Bell, MessageSquare,
  CalendarDays, Settings, ChevronRight, TrendingUp, BookOpen, CheckCircle, Send, Check, X, User, Menu, Eye, EyeOff, ArrowLeft
} from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ParentPortalUser, StudentProfile, ChildGrade, FeeRecord, Announcement, AttendanceRecord, PaymentTransaction, NotificationPreference } from "@/types/parent-portal";
import { supabase } from "@/lib/supabase";

// Import modular portal components
import { ChildSelector } from "@/components/ParentPortal/ChildSelector";
import { DashboardTab } from "@/components/ParentPortal/DashboardTab";
import { GradesTab } from "@/components/ParentPortal/GradesTab";
import { AttendanceTab } from "@/components/ParentPortal/AttendanceTab";
import { FeesTab } from "@/components/ParentPortal/FeesTab";
import { FeePaymentModal } from "@/components/ParentPortal/FeePaymentModal";
import { CommunicationsTab } from "@/components/ParentPortal/CommunicationsTab";
import { SettingsTab } from "@/components/ParentPortal/SettingsTab";
import { ConfirmDialog } from "@/components/TeacherPortal/ConfirmDialog";

// Static parent entity templates
const demoParentUser: ParentPortalUser = {
  id: "parent-1",
  name: "Priya Sharma",
  email: "priya@demo.com",
  phone: "+91 98765 00007",
  role: "parent",
  children: [
    { id: "student-1", name: "Aarav Sharma", rollNo: "07", grade: "VIII", section: "A", dob: "2012-05-15", parentId: "parent-1", academicYear: "2026-27", currentGPA: 3.82, status: "Active" },
    { id: "student-2", name: "Riya Sharma", rollNo: "12", grade: "VI", section: "B", dob: "2014-08-22", parentId: "parent-1", academicYear: "2026-27", currentGPA: 3.54, status: "Active" }
  ]
};

const initialChildGrades: ChildGrade[] = [
  { studentId: "student-1", subject: "Mathematics", test: "Unit Test 3", score: 92, maxScore: 100, grade: "A+", percentage: 92, date: "2026-06-28" },
  { studentId: "student-1", subject: "Science", test: "Unit Test 3", score: 88, maxScore: 100, grade: "A", percentage: 88, date: "2026-06-25" },
  { studentId: "student-1", subject: "English", test: "Unit Test 3", score: 95, maxScore: 100, grade: "A+", percentage: 95, date: "2026-06-24" },
  { studentId: "student-2", subject: "Mathematics", test: "Unit Test 3", score: 85, maxScore: 100, grade: "A", percentage: 85, date: "2026-06-28" },
  { studentId: "student-2", subject: "Science", test: "Unit Test 3", score: 91, maxScore: 100, grade: "A+", percentage: 91, date: "2026-06-25" },
  { studentId: "student-2", subject: "English", test: "Unit Test 3", score: 82, maxScore: 100, grade: "B+", percentage: 82, date: "2026-06-24" },
];

const initialAttendanceRecords: AttendanceRecord[] = [
  { id: "att-1", studentId: "student-1", date: "2026-06-29", status: "Present", remarks: "On time" },
  { id: "att-2", studentId: "student-1", date: "2026-06-28", status: "Present", remarks: "Regular" },
  { id: "att-3", studentId: "student-1", date: "2026-06-27", status: "Absent", reason: "Fever", remarks: "Informed by parent via leave portal" },
  { id: "att-4", studentId: "student-1", date: "2026-06-26", status: "Present" },
  { id: "att-5", studentId: "student-1", date: "2026-06-25", status: "Late", remarks: "Missed transport" },
  { id: "att-6", studentId: "student-2", date: "2026-06-29", status: "Present", remarks: "On time" },
  { id: "att-7", studentId: "student-2", date: "2026-06-28", status: "Present" },
  { id: "att-8", studentId: "student-2", date: "2026-06-27", status: "Present" },
  { id: "att-9", studentId: "student-2", date: "2026-06-26", status: "Present" },
  { id: "att-10", studentId: "student-2", date: "2026-06-25", status: "Present" },
];

const initialFeeRecords: FeeRecord[] = [
  { id: "fee-1", studentId: "student-1", term: "Term 2 Tuition Fee", amount: 18333, dueDate: "2026-08-01", status: "Pending" },
  { id: "fee-2", studentId: "student-1", term: "Bus Transport Fee", amount: 4500, dueDate: "2026-07-15", status: "Pending" },
  { id: "fee-3", studentId: "student-1", term: "Term 1 Tuition Fee", amount: 18333, dueDate: "2026-04-01", paidDate: "2026-04-01", status: "Paid", receiptUrl: "#" },
  { id: "fee-4", studentId: "student-2", term: "Term 2 Tuition Fee", amount: 15400, dueDate: "2026-08-01", status: "Pending" },
  { id: "fee-5", studentId: "student-2", term: "Term 1 Tuition Fee", amount: 15400, dueDate: "2026-04-01", paidDate: "2026-04-01", status: "Paid", receiptUrl: "#" },
];

const initialAnnouncements: Announcement[] = [
  { id: "notice-1", title: "Parent-Teacher Meeting — July 12", content: "PTM will be held from 9:00 AM to 1:00 PM. Please bring the latest UT-3 scorecard.", date: "Jun 28, 2026", priority: "High", target: "All", read: false },
  { id: "notice-2", title: "Unit Test 3 results uploaded", content: "Aarav and Riya's grades have been uploaded. Detailed breakdowns are visible on the dashboard.", date: "Jun 25, 2026", priority: "Normal", target: "All", read: false },
];

const chatContacts = [
  { id: "sunita", name: "Mrs. Sunita", subject: "Mathematics", initial: "S" },
  { id: "rahul", name: "Mr. Rahul Verma", subject: "Science (Class Teacher)", initial: "RV" },
  { id: "abhishek", name: "Mr. Abhishek Jain", subject: "English", initial: "AJ" },
];

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: BookOpen, label: "Grades & Performance", id: "grades" },
  { icon: TrendingUp, label: "Attendance tracking", id: "attendance" },
  { icon: CreditCard, label: "Fees & Payment", id: "fees" },
  { icon: MessageSquare, label: "Communications", id: "messages" },
  { icon: Settings, label: "Settings Portal", id: "settings" },
];

export default function ParentPortalPage() {
  // Global states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check existing session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setIsLoggedIn(true);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });

    if (error) {
      setLoginError(error.message);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      if (profile && profile.role === "parent") {
        setIsLoggedIn(true);
      } else {
        await supabase.auth.signOut();
        setLoginError("Unauthorized access. Parent privileges required.");
      }
    }
  };

  // Parent Multi-Child selectors
  const [childrenList, setChildrenList] = useState<StudentProfile[]>([]);
  const [parentName, setParentName] = useState("Parent");
  const [parentEmailAddress, setParentEmailAddress] = useState("");
  const [selectedChildId, setSelectedChildId] = useState("");

  // Persistent States - Now linked to Supabase
  const [childGrades, setChildGrades] = useState<ChildGrade[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Fetch Parent Data
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchParentData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        setParentEmailAddress(user.email || "");

        // Fetch parent's children (students linked by parent_id)
        const { data: kidsData, error: kidsError } = await supabase
          .from("students")
          .select("*")
          .eq("parent_id", user.id);

        if (kidsError) throw kidsError;

        if (kidsData && kidsData.length > 0) {
          // Parent name from first student's parent name entry
          setParentName(kidsData[0].parent || "Parent");

          const mappedChildren: StudentProfile[] = kidsData.map(k => ({
            id: k.id,
            name: k.name,
            rollNo: k.roll_no,
            grade: k.grade,
            section: k.section || "A",
            dob: k.dob || "",
            parentId: k.parent_id || "",
            academicYear: "2026-27",
            currentGPA: 3.8, // default fallback
            status: k.status as any
          }));

          setChildrenList(mappedChildren);
          setSelectedChildId(mappedChildren[0].id);

          const studentIds = mappedChildren.map(c => c.id);

          const [
            { data: gradesData },
            { data: attendanceData },
            { data: feesData },
            { data: noticesData }
          ] = await Promise.all([
            supabase.from("grades").select("*").in("student_id", studentIds),
            supabase.from("attendance").select("*").in("student_id", studentIds),
            supabase.from("fees").select("*").in("student_id", studentIds),
            supabase.from("announcements").select("*")
          ]);

          if (gradesData) {
            setChildGrades(gradesData.map(g => ({
              studentId: g.student_id,
              subject: g.subject,
              test: g.test,
              score: Number(g.score),
              maxScore: Number(g.max_score),
              percentage: (Number(g.score) / Number(g.max_score)) * 100,
              grade: (Number(g.score) / Number(g.max_score)) >= 0.9 ? "A+" : "B",
              date: new Date(g.created_at).toISOString().split('T')[0]
            })));
          }

          if (attendanceData) {
            setAttendance(attendanceData.map(a => ({
              id: a.id,
              studentId: a.student_id,
              date: a.date,
              status: a.status as "Present" | "Absent" | "Late" | "Leave",
              reason: a.reason,
              remarks: a.remarks
            })));
          }

          if (feesData) {
            setFeeRecords(feesData.map(f => ({
              id: f.id,
              studentId: f.student_id,
              term: f.term,
              amount: Number(f.amount),
              dueDate: f.due_date,
              paidDate: f.paid_date,
              status: f.status as "Pending" | "Paid" | "Overdue",
              receiptUrl: f.receipt_url
            })));
          }

          if (noticesData) {
            const studentGradesList = mappedChildren.map(c => c.grade);
            const filteredNotices = noticesData.filter(n => !n.class_id || n.class_id === "All" || studentGradesList.includes(n.class_id));

            setAnnouncements(filteredNotices.map(n => ({
              id: n.id,
              title: n.title,
              content: n.content || "",
              date: new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              priority: n.priority as "Low" | "Normal" | "High",
              target: n.target as "All" | "Class" | "Individual",
              read: false
            })));
          }
        } else {
          setChildrenList([]);
        }
      } catch (err) {
        console.error("Failed to fetch parent data", err);
      }
    };
    fetchParentData();
  }, [isLoggedIn]);

  // Settings prefs
  const [notificationPrefs, setNotificationPrefs] = useLocalStorage<NotificationPreference>("parent-notif-prefs", {
    id: "pref-1",
    userId: "parent-1",
    gradesPosted: true,
    attendanceUpdates: true,
    feeReminders: true,
    eventNotifications: true
  });

  // Modal Pay States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payingFee, setPayingFee] = useState<FeeRecord | null>(null);

  // ── Global Confirm / Alert Dialog State ──
  type DialogAction = { type: "alert"; variant: "danger" | "warning" | "info" | "success"; title: string; message: string; }
                    | { type: "signOut" }
                    | null;
  const [dialogAction, setDialogAction] = useState<DialogAction>(null);

  const dialogConfig: Record<string, { title: string; message: string; label: string; variant: "danger" | "warning" | "info" | "success"; isAlert: boolean }> = {
    signOut: { title: "Sign Out", message: "Are you sure you want to sign out from the Parent Portal?", label: "Sign Out", variant: "warning", isAlert: false },
  };

  const executeDialog = async () => {
    if (!dialogAction) return;
    if (dialogAction.type === "signOut") {
      await supabase.auth.signOut();
      setIsLoggedIn(false);
    }
    setDialogAction(null);
  };

  // Messaging States
  const [selectedContact, setSelectedContact] = useState(chatContacts[1]);
  const [chatMessages, setChatMessages] = useLocalStorage<Record<string, { sender: "parent" | "teacher", text: string, time: string }[]>>("parent-chat", {
    rahul: [
      { sender: "teacher", text: "Hello! Aarav performed very well in his science practical today.", time: "10:30 AM" },
      { sender: "parent", text: "Thank you Mr. Rahul, glad to hear that!", time: "10:35 AM" }
    ],
    sunita: [
      { sender: "teacher", text: "Aarav needs to practice quadratic equations a bit more.", time: "Yesterday" }
    ]
  });
  const [messageText, setMessageText] = useState("");

  // Computed states
  const selectedChild = useMemo(() => {
    return childrenList.find((c) => c.id === selectedChildId) || childrenList[0] || {
      id: "student-1",
      name: "Loading...",
      rollNo: "--",
      grade: "--",
      section: "--",
      dob: "",
      parentId: "",
      academicYear: "2026-27",
      currentGPA: 3.5,
      status: "Active"
    };
  }, [childrenList, selectedChildId]);

  const selectedChildGrades = useMemo(() => {
    return childGrades.filter((g) => g.studentId === selectedChildId);
  }, [childGrades, selectedChildId]);

  const selectedChildAttendance = useMemo(() => {
    return attendance.filter((a) => a.studentId === selectedChildId);
  }, [attendance, selectedChildId]);

  const selectedChildFees = useMemo(() => {
    return feeRecords.filter((f) => f.studentId === selectedChildId);
  }, [feeRecords, selectedChildId]);

  // Attendance rate computation
  const attendanceRate = useMemo(() => {
    const total = selectedChildAttendance.length;
    if (total === 0) return 92; // Default fallback
    const present = selectedChildAttendance.filter((a) => a.status === "Present" || a.status === "Late").length;
    return (present / total) * 100;
  }, [selectedChildAttendance]);

  // Unread announcements counts
  const unreadNoticesCount = useMemo(() => {
    return announcements.filter((a) => !a.read).length;
  }, [announcements]);

  // Dynamic Recent Activity logs based on state values
  const recentActivities = useMemo(() => {
    const list: { id: string; type: "grade" | "attendance" | "fee"; text: string; time: string }[] = [];
    
    selectedChildGrades.forEach((g) => {
      list.push({
        id: `act-g-${g.subject}-${g.score}`,
        type: "grade",
        text: `Obtained ${g.score}/${g.maxScore} marks in ${g.subject} (${g.test})`,
        time: g.date
      });
    });

    selectedChildFees.forEach((f) => {
      if (f.status === "Paid") {
        list.push({
          id: `act-f-${f.id}`,
          type: "fee",
          text: `Payment of ${f.term} successfully completed.`,
          time: f.paidDate || "Processed"
        });
      } else {
        list.push({
          id: `act-f-due-${f.id}`,
          type: "fee",
          text: `${f.term} installment due notice.`,
          time: f.dueDate
        });
      }
    });

    selectedChildAttendance.forEach((a) => {
      if (a.status === "Absent") {
        list.push({
          id: `act-att-abs-${a.id}`,
          type: "attendance",
          text: `Marked absent. Reason: ${a.reason || "Unspecified"}`,
          time: a.date
        });
      }
    });

    return list.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5);
  }, [selectedChildGrades, selectedChildFees, selectedChildAttendance]);

  // Security Guards: Enforce parent-child authorization on selection
  const handleSelectChild = (childId: string) => {
    const hasAccess = childrenList.some((c) => c.id === childId);
    if (!hasAccess) {
      setDialogAction({ type: "alert", variant: "danger", title: "Security Alert", message: "Unauthorized student profile access attempt!" });
      return;
    }
    setSelectedChildId(childId);
  };

  // Session management logic
  useEffect(() => {
    if (!isLoggedIn) return;
    const sessionTimer = setTimeout(() => {
      setIsLoggedIn(false);
      setDialogAction({ type: "alert", variant: "warning", title: "Session Expired", message: "Please log in again for your data security." });
    }, 30 * 60 * 1000); // 30 minutes session lock
    return () => clearTimeout(sessionTimer);
  }, [isLoggedIn]);

  // Grade Card Download Mock Trigger
  const handleDownloadReport = () => {
    setDialogAction({ type: "alert", variant: "info", title: "Downloading Report", message: `Downloading cumulative report card for ${selectedChild.name} (PDF)...` });
  };

  // Payment triggers
  const handlePayNow = (fee: FeeRecord) => {
    setPayingFee(fee);
    setShowPaymentModal(true);
  };

  const handleViewReceipt = (fee: FeeRecord) => {
    setDialogAction({
      type: "alert",
      variant: "success",
      title: "Fee Payment Receipt",
      message: `Transaction Details:\n\n• Child: ${selectedChild.name}\n• Term: ${fee.term}\n• Amount Paid: ₹${fee.amount.toLocaleString("en-IN")}\n• Date: ${fee.paidDate || new Date().toISOString().split("T")[0]}\n• Status: Successful\n• Reference No: TXN-${fee.id.substring(0, 8).toUpperCase()}`
    });
  };

  const handlePaymentSuccess = async (feeId: string, method: string, referenceNo: string) => {
    setFeeRecords((prev) =>
      prev.map((f) =>
        f.id === feeId
          ? {
              ...f,
              status: "Paid",
              paidDate: new Date().toLocaleDateString("en-IN"),
              receiptUrl: "#",
            }
          : f
      )
    );
    setShowPaymentModal(false);
    setPayingFee(null);
    setDialogAction({ type: "alert", variant: "success", title: "Payment Successful", message: `Reference ID: ${referenceNo}. Your receipt is ready.` });

    // Sync with Supabase
    const fee = feeRecords.find(f => f.id === feeId);
    if (fee) {
      // 1. Update the fee record
      await supabase.from("fees").update({
        status: "Paid",
        paid_date: new Date().toISOString().split("T")[0],
        receipt_url: "#"
      }).eq("id", feeId);
      
      // 2. Insert into global payment logs for Admin tracking
      await supabase.from("payment_logs").insert({
        student_id: fee.studentId,
        family: demoParentUser.name,
        amount: fee.amount,
        method: method,
        reference_no: referenceNo,
        status: "Success",
        term: fee.term
      });
    }
  };

  // Broadcast marking
  const handleMarkNoticeRead = (noticeId: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === noticeId ? { ...a, read: true } : a))
    );
  };

  // Toggle Preferences
  const handleTogglePreference = (key: keyof Omit<NotificationPreference, "id" | "userId">) => {
    setNotificationPrefs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSavePreferences = () => {
    setDialogAction({ type: "alert", variant: "success", title: "Preferences Saved", message: "Alert preferences saved successfully!" });
  };

  // Chat direct thread controls
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    const timeStr = new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
    const currentMessages = chatMessages[selectedContact.id] || [];

    setChatMessages((prev) => ({
      ...prev,
      [selectedContact.id]: [
        ...currentMessages,
        { sender: "parent", text: messageText.trim(), time: timeStr },
      ],
    }));

    const textToSend = messageText.trim();
    setMessageText("");

    // Simulate Teacher respond callbacks
    setTimeout(() => {
      let replyText = "Noted. I will check on the progress and follow up shortly.";
      if (textToSend.toLowerCase().includes("homework") || textToSend.toLowerCase().includes("assignment")) {
        replyText = "The homework assignments have been turned in on time. No pending reports.";
      } else if (textToSend.toLowerCase().includes("grade") || textToSend.toLowerCase().includes("score") || textToSend.toLowerCase().includes("marks")) {
        replyText = "Unit Test 3 marks look solid. We are working on reinforcing equations next.";
      } else if (textToSend.toLowerCase().includes("attendance") || textToSend.toLowerCase().includes("leave")) {
        replyText = "Received leave request. I will update the attendance sheet register records.";
      }

      setChatMessages((prev) => ({
        ...prev,
        [selectedContact.id]: [
          ...(prev[selectedContact.id] || []),
          { sender: "teacher", text: replyText, time: new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) },
        ],
      }));
    }, 1500);
  };

  const handleSignOut = () => {
    setDialogAction({ type: "signOut" });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-6 relative overflow-hidden">
        {/* Exit link to website */}
        <Link href="/" className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl shadow-md transition-all hover:translate-y-[-2px] text-xs md:text-sm cursor-pointer backdrop-blur-sm">
          <ArrowLeft size={16} /> Back to Website
        </Link>
        {/* Background Shapes */}
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
                <div className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center shadow-lg">
                  <GraduationCap size={30} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-primary tracking-tight">Parent Portal</h1>
                <p className="text-slate-500 text-xs mt-1.5 font-semibold max-w-[280px] mx-auto leading-relaxed">{siteConfig.schoolName}</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                {loginError && (
                  <div className="bg-red-50 text-red-600 text-xs font-bold p-3 rounded-lg text-center">
                    {loginError}
                  </div>
                )}
                <div>
                  <label htmlFor="loginEmail" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input
                    id="loginEmail"
                    type="email"
                    placeholder="parent@schoolsite.com"
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
                  className="w-full h-12 bg-accent hover:bg-accent-light text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all text-base mt-3 cursor-pointer"
                >
                  Secure Login
                </button>
              </form>

              <p className="text-center text-xs text-slate-400 mt-6 font-medium">
                Demo access — click login to explore dashboards
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-50 lg:grid lg:grid-cols-[auto_1fr]">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-60 bg-primary flex-col sticky top-0 h-screen shrink-0 z-20">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-bold shadow-md">
              {siteConfig.shortName.charAt(0)}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Parent Portal</p>
              <p className="text-white/40 text-xs truncate">{siteConfig.shortName}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === item.id ? "bg-white/15 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={17} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
              {parentName.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <p className="text-white text-sm font-medium">{parentName}</p>
              <p className="text-white/40 text-xs">Parent</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-white/40 hover:text-white text-xs transition-colors cursor-pointer">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-primary z-30 px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="text-white p-1 hover:text-accent transition-colors cursor-pointer"
          >
            <Menu size={22} />
          </button>
          <span className="text-white font-semibold text-sm">Parent Dashboard</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSignOut} className="text-white/60 hover:text-white cursor-pointer">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 bottom-0 left-0 w-60 bg-primary flex-col z-50 flex shadow-2xl"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-bold">
                    {siteConfig.shortName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Parent Panel</p>
                    <p className="text-white/40 text-xs">{siteConfig.shortName}</p>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-white cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 py-4 px-3 space-y-1">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      activeTab === item.id ? "bg-white/15 text-white" : "text-white/50 hover:text-white"
                    }`}
                  >
                    <item.icon size={17} />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold">
                    {parentName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{parentName}</p>
                    <p className="text-white/40 text-xs">Parent</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    handleSignOut();
                  }}
                  className="flex items-center gap-2 text-white/40 hover:text-white text-xs transition-colors cursor-pointer"
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="w-full min-w-0 pt-20 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="mb-7 flex justify-between items-start flex-col md:flex-row gap-4 border-b border-slate-200 pb-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Welcome, {parentName}</h1>
              <p className="text-slate-500 text-sm mt-1">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
            {/* Child Profile Info Widget */}
            {childrenList.length > 0 && (
              <div className="flex items-center gap-3 bg-white px-4 py-2 border border-slate-200 rounded-2xl shadow-sm">
                <div className="w-9 h-9 bg-primary text-white font-bold rounded-xl flex items-center justify-center text-sm shadow-sm shrink-0">
                  {selectedChild.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Viewing Profile</p>
                  <p className="text-sm font-extrabold text-slate-800">
                    {selectedChild.name} ({selectedChild.grade}-{selectedChild.section})
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tab Views */}
          <AnimatePresence mode="wait">
            {childrenList.length === 0 ? (
              <motion.div key="no-child" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-amber-50 border border-amber-200 text-amber-800 p-6 rounded-2xl text-center">
                <p className="font-bold text-sm">No child linked to parent profile</p>
                <p className="text-xs text-amber-700/80 mt-1 leading-relaxed">
                  We did not find any students linked to your email ({parentEmailAddress}). Please contact the school administrator to assign your email address as a parent contact on your child's student registry profile.
                </p>
              </motion.div>
            ) : activeTab === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                {/* Child Selector */}
                <ChildSelector
                  childrenList={childrenList}
                  selectedChildId={selectedChildId}
                  onSelectChild={handleSelectChild}
                />
                
                {/* Dashboard Stats & Activity */}
                <DashboardTab
                  selectedChild={selectedChild}
                  attendanceRate={attendanceRate}
                  pendingFeesAmount={selectedChildFees.filter((f) => f.status !== "Paid").reduce((sum, f) => sum + f.amount, 0)}
                  unreadNoticesCount={unreadNoticesCount}
                  nextFeeDueDate={selectedChildFees.filter((f) => f.status !== "Paid")[0]?.dueDate || ""}
                  recentActivities={recentActivities}
                />
              </motion.div>
            )}

            {activeTab === "grades" && (
              <motion.div key="grades" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <GradesTab
                  selectedChild={selectedChild}
                  grades={selectedChildGrades}
                  onDownloadReportCard={handleDownloadReport}
                />
              </motion.div>
            )}

            {activeTab === "attendance" && (
              <motion.div key="attendance" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <AttendanceTab
                  selectedChild={selectedChild}
                  attendanceRecords={selectedChildAttendance}
                />
              </motion.div>
            )}

            {activeTab === "fees" && (
              <motion.div key="fees" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <FeesTab
                  selectedChild={selectedChild}
                  feeRecords={feeRecords}
                  onPayNow={handlePayNow}
                  onViewReceipt={handleViewReceipt}
                />
              </motion.div>
            )}

            {activeTab === "messages" && (
              <motion.div key="messages" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <CommunicationsTab
                  announcements={announcements}
                  unreadCount={unreadNoticesCount}
                  selectedContact={selectedContact}
                  chatContacts={chatContacts}
                  chatMessages={chatMessages}
                  messageText={messageText}
                  onSendMessage={handleSendMessage}
                  onChangeMessageText={setMessageText}
                  onSelectContact={setSelectedContact}
                  onMarkAnnouncementRead={handleMarkNoticeRead}
                />
              </motion.div>
            )}

            {activeTab === "settings" && (
              <motion.div key="settings" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <SettingsTab
                  preferences={notificationPrefs}
                  onTogglePreference={handleTogglePreference}
                  onSavePreferences={handleSavePreferences}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Fee Payment Modal */}
      {showPaymentModal && payingFee && (
        <FeePaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setPayingFee(null);
          }}
          fee={payingFee}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {/* ── Global Confirm / Alert Dialog ── */}
      {dialogAction && (
        <ConfirmDialog
          isOpen={true}
          title={dialogAction.type === "alert" ? dialogAction.title : dialogConfig[dialogAction.type].title}
          message={dialogAction.type === "alert" ? dialogAction.message : dialogConfig[dialogAction.type].message}
          confirmLabel={dialogAction.type === "alert" ? "OK" : dialogConfig[dialogAction.type].label}
          cancelLabel="Cancel"
          variant={dialogAction.type === "alert" ? dialogAction.variant : dialogConfig[dialogAction.type].variant}
          isAlert={dialogAction.type === "alert" ? true : dialogConfig[dialogAction.type].isAlert}
          onConfirm={executeDialog}
          onCancel={() => setDialogAction(null)}
        />
      )}
    </div>
  );
}
