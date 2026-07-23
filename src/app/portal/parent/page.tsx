"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, LogOut, GraduationCap, CreditCard, Bell, MessageSquare,
  CalendarDays, Settings, ChevronRight, TrendingUp, BookOpen, CheckCircle, Send, Check, X, User, Menu, Eye, EyeOff, ArrowLeft, Loader2
} from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { ParentPortalUser, StudentProfile, ChildGrade, FeeRecord, Announcement, AttendanceRecord, PaymentTransaction, NotificationPreference } from "@/types/parent-portal";
import { supabase } from "@/lib/supabase";
import { resendPasswordLink, fetchParentPortalData } from "@/app/actions/auth";

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
  name: "Parent",
  email: "parent@school.com",
  phone: "",
  role: "parent",
  children: []
};

const initialChildGrades: ChildGrade[] = [];
const initialAttendanceRecords: AttendanceRecord[] = [];
const initialFeeRecords: FeeRecord[] = [];
const initialAnnouncements: Announcement[] = [];
const chatContacts: any[] = [];

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
  const [isLoggedIn, setIsLoggedIn] = useLocalStorage("school_parent_logged_in", false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSendingForgotLink, setIsSendingForgotLink] = useState(false);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState("");
  const [forgotErrorMsg, setForgotErrorMsg] = useState("");

  const handleSendForgotLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setIsSendingForgotLink(true);
    setForgotSuccessMsg("");
    setForgotErrorMsg("");

    const res = await resendPasswordLink(forgotEmail);
    setIsSendingForgotLink(false);

    if (res.success) {
      setForgotSuccessMsg(`Password setup email dispatched to ${forgotEmail}! Please check your email inbox to set up your password.`);
    } else {
      setForgotErrorMsg(res.error || "Unable to send password setup email.");
    }
  };

  // Check existing session
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
    } catch (err: any) {
      setLoginError(err.message || "Login failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Parent Multi-Child selectors
  const [childrenList, setChildrenList] = useState<StudentProfile[]>([]);
  const [parentName, setParentName] = useState("Parent");
  const [parentEmailAddress, setParentEmailAddress] = useState("");
  const [selectedChildId, setSelectedChildId] = useState("");

  const selectedChild = useMemo(() => {
    return childrenList.find((c) => c.id === selectedChildId) || childrenList[0] || {
      id: "stud1-ix-a",
      name: "stud1 (IX-A)",
      rollNo: "1",
      grade: "Class IX-A",
      section: "A",
      dob: "2012-05-15",
      parentId: "parent-1",
      academicYear: "2026-27",
      currentGPA: 3.8,
      status: "Active"
    };
  }, [childrenList, selectedChildId]);

  // Persistent States - Now linked to Supabase
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [childGrades, setChildGrades] = useState<ChildGrade[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Persistent read notice tracking
  const [readNoticeIds, setReadNoticeIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("read_notice_ids");
        return saved ? JSON.parse(saved) : [];
      } catch {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("read_notice_ids", JSON.stringify(readNoticeIds));
    }
  }, [readNoticeIds]);

  // Broadcast Bell Dropdown State
  const [showBellDropdown, setShowBellDropdown] = useState(false);

  const effectiveAnnouncements = useMemo(() => {
    const list: Announcement[] = (announcements && announcements.length > 0) ? announcements : [
      {
        id: "bc-2",
        title: "📝 Mid-Term Parent-Teacher Conference",
        content: "Dear Parents, the Parent-Teacher Meeting (PTM) for Unit Test 3 review is scheduled on July 12 from 9 AM to 1 PM.",
        date: new Date(Date.now() - 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        priority: "High" as const,
        target: "Parents" as const,
        read: false
      }
    ];

    return list.map((a) => ({
      ...a,
      read: a.read || readNoticeIds.includes(a.id)
    }));
  }, [announcements, readNoticeIds]);

  const unreadBellCount = useMemo(() => {
    return effectiveAnnouncements.filter((a) => !a.read).length;
  }, [effectiveAnnouncements]);

  const handleMarkAllRead = () => {
    const allIds = effectiveAnnouncements.map((a) => a.id);
    setReadNoticeIds((prev) => Array.from(new Set([...prev, ...allIds])));
  };

  // Fetch Parent Data from Supabase via server action (bypasses RLS issues)
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchParentData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !user.email) return;

        setParentEmailAddress(user.email);

        const serverRes = await fetchParentPortalData(user.email);
        if (!serverRes.success) {
          console.warn("fetchParentPortalData server warning:", serverRes.error);
          return;
        }

        const { kidsData, gradesData, attendanceData, feesData, noticesData } = serverRes;

        if (kidsData && kidsData.length > 0) {
          setParentName(kidsData[0].parent || (user.email ? user.email.split('@')[0] : "Parent"));

          const mappedChildren: StudentProfile[] = kidsData.map((k: any) => ({
            id: k.id,
            name: k.name,
            rollNo: k.roll_no,
            grade: k.grade,
            section: k.section || "A",
            dob: k.dob || "",
            parentId: k.parent_id || "",
            academicYear: "2026-27",
            currentGPA: 3.8,
            status: k.status as any
          }));

          setChildrenList(mappedChildren);
          setSelectedChildId(mappedChildren[0].id);

          if (gradesData) {
            setChildGrades(gradesData.map((g: any) => {
              const scoreNum = Number(g.score);
              const maxNum = Number(g.max_score);
              const pct = maxNum > 0 ? (scoreNum / maxNum) * 100 : 0;
              const gradeLetter = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B+" : pct >= 60 ? "B" : pct >= 50 ? "C" : "D";
              return {
                studentId: g.student_id,
                subject: g.subject,
                test: g.test,
                score: scoreNum,
                maxScore: maxNum,
                percentage: pct,
                grade: gradeLetter,
                date: new Date(g.created_at || Date.now()).toISOString().split('T')[0]
              };
            }));
          }

          if (attendanceData) {
            setAttendance(attendanceData.map((a: any) => ({
              id: a.id,
              studentId: a.student_id,
              date: a.date,
              status: a.status as "Present" | "Absent" | "Late" | "Leave",
              reason: a.reason,
              remarks: a.remarks
            })));
          }

          if (feesData && feesData.length > 0) {
            setFeeRecords(feesData.map((f: any) => ({
              id: f.id,
              studentId: f.student_id,
              term: f.term,
              amount: Number(f.amount),
              dueDate: f.due_date,
              paidDate: f.paid_date,
              status: f.status as "Pending" | "Paid" | "Overdue",
              receiptUrl: f.receipt_url
            })));
          } else {
            const fallbackFees: FeeRecord[] = [];
            mappedChildren.forEach(child => {
              const g = (child.grade || "").toUpperCase();
              if (g.includes("NURSERY") || g.includes("LKG") || g.includes("UKG")) {
                fallbackFees.push(
                  { id: `fee-t1-${child.id}`, studentId: child.id, term: "Term 1 Tuition Fee (Pre-Primary)", amount: 15000, dueDate: "2026-04-01", paidDate: "2026-04-05", status: "Paid", receiptUrl: "#" },
                  { id: `fee-t2-${child.id}`, studentId: child.id, term: "Term 2 Tuition Fee (Pre-Primary)", amount: 15000, dueDate: "2026-08-15", status: "Pending" },
                  { id: `fee-act-${child.id}`, studentId: child.id, term: "Activity & Care Fee", amount: 2500, dueDate: "2026-07-30", status: "Pending" }
                );
              } else if (/CLASS\s*(I|II|III|IV|V)\b|1|2|3|4|5/i.test(g) && !g.includes("VI") && !g.includes("VII") && !g.includes("VIII") && !g.includes("IX") && !g.includes("X")) {
                fallbackFees.push(
                  { id: `fee-t1-${child.id}`, studentId: child.id, term: "Term 1 Tuition Fee (Primary)", amount: 18333, dueDate: "2026-04-01", paidDate: "2026-04-05", status: "Paid", receiptUrl: "#" },
                  { id: `fee-t2-${child.id}`, studentId: child.id, term: "Term 2 Tuition Fee (Primary)", amount: 18333, dueDate: "2026-08-15", status: "Pending" },
                  { id: `fee-comp-${child.id}`, studentId: child.id, term: "Computer & Activity Fee", amount: 3500, dueDate: "2026-07-30", status: "Pending" }
                );
              } else if (/CLASS\s*(VI|VII|VIII)\b|6|7|8/i.test(g) && !g.includes("IX") && !g.includes("X")) {
                fallbackFees.push(
                  { id: `fee-t1-${child.id}`, studentId: child.id, term: "Term 1 Tuition Fee (Middle School)", amount: 21666, dueDate: "2026-04-01", paidDate: "2026-04-05", status: "Paid", receiptUrl: "#" },
                  { id: `fee-t2-${child.id}`, studentId: child.id, term: "Term 2 Tuition Fee (Middle School)", amount: 21666, dueDate: "2026-08-15", status: "Pending" },
                  { id: `fee-lab-${child.id}`, studentId: child.id, term: "Science & Computer Lab Fee", amount: 4500, dueDate: "2026-07-30", status: "Pending" }
                );
              } else {
                fallbackFees.push(
                  { id: `fee-t1-${child.id}`, studentId: child.id, term: "Term 1 Tuition Fee (Secondary)", amount: 25000, dueDate: "2026-04-01", paidDate: "2026-04-05", status: "Paid", receiptUrl: "#" },
                  { id: `fee-t2-${child.id}`, studentId: child.id, term: "Term 2 Tuition Fee (Secondary)", amount: 25000, dueDate: "2026-08-15", status: "Pending" },
                  { id: `fee-exam-${child.id}`, studentId: child.id, term: "Board Exam & Lab Fee", amount: 5500, dueDate: "2026-07-30", status: "Pending" }
                );
              }
            });
            setFeeRecords(fallbackFees);
          }

          if (noticesData) {
            const studentGradesList = mappedChildren.map(c => c.grade);
            const filteredNotices = noticesData.filter((n: any) => !n.class_id || n.class_id === "All" || studentGradesList.includes(n.class_id));

            setAnnouncements(filteredNotices.map((n: any) => ({
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
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchParentData();
  }, [isLoggedIn]);

  // Fetch Teachers for Child's Class to populate Chat Contacts
  useEffect(() => {
    if (!isLoggedIn || !selectedChild || selectedChild.id === "student-1") return;

    const fetchTeachers = async () => {
      try {
        const cleanGrade = selectedChild.grade.replace(/^Class\s+/i, "").trim();
        const possibleGrades = [cleanGrade, `Class ${cleanGrade}`, `Class  ${cleanGrade}`];

        // 1. Fetch Teacher Assignments for this Class Grade
        const { data: assignments } = await supabase
          .from("teacher_assignments")
          .select("teacher_id, subject")
          .in("class_id", possibleGrades);

        if (assignments && assignments.length > 0) {
          const teacherIds = [...new Set(assignments.map(a => a.teacher_id))];

          // 2. Fetch Teachers details
          const { data: teachers } = await supabase
            .from("teachers")
            .select("id, name")
            .in("id", teacherIds)
            .eq("status", "Active");

          if (teachers) {
            const mappedContacts = teachers.map(t => {
              const matchedAss = assignments.find(a => a.teacher_id === t.id);
              const subjectName = matchedAss ? matchedAss.subject : "Teacher";
              const initials = t.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();

              return {
                id: t.id,
                name: t.name,
                subject: subjectName,
                initial: initials
              };
            });

            setChatContactsList(mappedContacts);
            setSelectedContact(mappedContacts[0] || null);
          } else {
            setChatContactsList([]);
            setSelectedContact(null);
          }
        } else {
          setChatContactsList([]);
          setSelectedContact(null);
        }
      } catch (err) {
        console.error("Error fetching chat contacts:", err);
      }
    };

    fetchTeachers();
  }, [isLoggedIn, selectedChild]);

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
  const [chatContactsList, setChatContactsList] = useState<{ id: string, name: string, subject: string, initial: string }[]>([]);
  const [selectedContact, setSelectedContact] = useState<{ id: string, name: string, subject: string, initial: string } | null>(null);
  const [chatMessages, setChatMessages] = useLocalStorage<Record<string, { sender: "parent" | "teacher", text: string, time: string }[]>>("parent-chat", {});
  const [messageText, setMessageText] = useState("");

  // Computed states

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
  const unreadNoticesCount = unreadBellCount;

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
    const todayStr = new Date().toISOString().split("T")[0];
    const dateFormatted = new Date().toLocaleDateString("en-IN");

    setFeeRecords((prev) =>
      prev.map((f) =>
        f.id === feeId
          ? {
              ...f,
              status: "Paid",
              paidDate: dateFormatted,
              receiptUrl: "#",
            }
          : f
      )
    );
    setShowPaymentModal(false);
    setPayingFee(null);

    setDialogAction({
      type: "alert",
      variant: "success",
      title: "Payment Successful! 🎉",
      message: `Payment receipt generated!\n\n• Reference ID: ${referenceNo}\n• Settlement Method: ${method}\n• Status: Verified & Confirmed`
    });

    try {
      const fee = feeRecords.find(f => f.id === feeId);
      if (fee) {
        const { data: updated } = await supabase.from("fees").update({
          status: "Paid",
          paid_date: todayStr,
          receipt_url: "#"
        }).eq("id", feeId).select();

        if (!updated || updated.length === 0) {
          const realId = crypto.randomUUID();
          await supabase.from("fees").insert({
            id: realId,
            student_id: fee.studentId,
            term: fee.term,
            amount: fee.amount,
            due_date: fee.dueDate || todayStr,
            paid_date: todayStr,
            status: "Paid",
            receipt_url: "#"
          });
        }
      }
    } catch (err) {
      console.warn("Fee payment DB sync warning:", err);
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
    if (!selectedContact || !messageText.trim()) return;

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
                    placeholder="parent@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-slate-50/50 hover:bg-slate-50 transition-all font-medium"
                    required
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label htmlFor="loginPassword" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">Password</label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(loginEmail);
                        setShowForgotModal(true);
                      }}
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
                    >
                      Forgot / Set Password?
                    </button>
                  </div>
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

              <p className="text-center text-xs text-slate-400 mt-6 font-medium">
                Parent login portal — enter registered email & password
              </p>
            </div>
          </div>
        </motion.div>

        {/* FORGOT / SET PASSWORD MODAL */}
        {showForgotModal && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[999] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 p-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Set / Reset Password</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Receive a password setup link via email</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setShowForgotModal(false); setForgotSuccessMsg(""); setForgotErrorMsg(""); }}
                  className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {forgotSuccessMsg && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-2xl leading-relaxed">
                  {forgotSuccessMsg}
                </div>
              )}

              {forgotErrorMsg && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl leading-relaxed">
                  {forgotErrorMsg}
                </div>
              )}

              {!forgotSuccessMsg && (
                <form onSubmit={handleSendForgotLink} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Registered Parent Email</label>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-base focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingForgotLink}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-lg shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {isSendingForgotLink ? <Loader2 size={16} className="animate-spin text-white" /> : <Send size={16} />}
                    {isSendingForgotLink ? "Sending Email Link..." : "Send Password Setup Link"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
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
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setShowBellDropdown(!showBellDropdown)}
            className="relative p-1.5 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Broadcast Announcements"
          >
            <Bell size={20} />
            {unreadBellCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-black text-[9px] flex items-center justify-center border border-primary">
                {unreadBellCount}
              </span>
            )}
          </button>
          <button onClick={handleSignOut} className="text-white/60 hover:text-white cursor-pointer p-1">
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
          <div className="mb-7 flex justify-between items-center flex-wrap gap-4 border-b border-slate-200 pb-5">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Welcome, {parentName}</h1>
              <p className="text-slate-500 text-sm mt-1">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Broadcast Bell Button & Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowBellDropdown(!showBellDropdown)}
                  className="relative p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-300 transition-all cursor-pointer shadow-xs flex items-center gap-2"
                  title="Broadcast Announcements"
                >
                  <Bell size={18} />
                  <span className="text-xs font-bold hidden sm:inline">Broadcasts</span>
                  {unreadBellCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-black text-[10px] flex items-center justify-center shadow-md animate-pulse">
                      {unreadBellCount}
                    </span>
                  )}
                </button>

                {showBellDropdown && (
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Bell size={16} />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm">Broadcast Notices</h4>
                          <p className="text-[10px] text-slate-400 font-semibold">{effectiveAnnouncements.length} Dispatches</p>
                        </div>
                      </div>
                      {unreadBellCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-emerald-600 font-bold hover:underline cursor-pointer"
                        >
                          ✓ Mark read
                        </button>
                      )}
                    </div>

                    <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                      {effectiveAnnouncements.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (!item.read) {
                              setReadNoticeIds((prev) => Array.from(new Set([...prev, item.id])));
                            }
                          }}
                          className={`p-3.5 border rounded-2xl space-y-1.5 transition-all cursor-pointer ${
                            item.read ? "bg-slate-50 border-slate-100 opacity-75" : "bg-emerald-50/40 border-emerald-200/60 shadow-2xs"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                              item.priority === "High" ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                            }`}>
                              {item.priority === "High" ? "🔥 High Priority" : "📢 Notice"}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">{item.date}</span>
                          </div>
                          <h5 className="text-xs font-extrabold text-slate-800 leading-snug">{item.title}</h5>
                          <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{item.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                      {selectedChild.name} ({selectedChild.section && !selectedChild.grade.toLowerCase().includes(`-${selectedChild.section.toLowerCase()}`) ? `${selectedChild.grade}-${selectedChild.section}` : selectedChild.grade})
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tab Views */}
          <AnimatePresence mode="wait">
            {isLoadingData ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6 animate-pulse">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-200" />
                    <div className="space-y-2">
                      <div className="w-48 h-5 rounded-lg bg-slate-200" />
                      <div className="w-32 h-3.5 rounded-lg bg-slate-100" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="h-24 rounded-2xl bg-slate-100" />
                    <div className="h-24 rounded-2xl bg-slate-100" />
                    <div className="h-24 rounded-2xl bg-slate-100" />
                    <div className="h-24 rounded-2xl bg-slate-100" />
                  </div>
                </div>
              </motion.div>
            ) : childrenList.length === 0 ? (
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
                  chatContacts={chatContactsList}
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
