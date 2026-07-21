"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, CheckSquare, BookOpen, FileText, Bell, LogOut,
  BarChart3, Search, Plus, Check, X, GraduationCap, Eye, EyeOff, Menu,
  Edit, Trash2, Download, ArrowLeft, ChevronDown, BookMarked, Layers,
} from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Grade, GradeModal } from "@/components/TeacherPortal/GradeModal";
import { Assignment, AssignmentModal } from "@/components/TeacherPortal/AssignmentModal";
import { ConfirmDialog } from "@/components/TeacherPortal/ConfirmDialog";
import { supabase } from "@/lib/supabase";
import { useEffect } from "react";

// ─── Data Model ───────────────────────────────────────────────────────────────

export interface Student {
  id: number;
  name: string;
  rollNo: string;
  phone: string;
  email: string;
}

export interface ClassSubjectSlot {
  classId: string;     // e.g. "IX-A"
  subject: string;     // e.g. "Mathematics"
}

// Teacher profile — in a real app this comes from auth/API
const TEACHER_PROFILE = {
  name: "Mr. Rahul Verma",
  initials: "RV",
  email: "rahul.verma@school.com",
  // All the class-subject combos this teacher handles
  slots: [
    { classId: "IX-A", subject: "Mathematics" },
    { classId: "IX-B", subject: "Mathematics" },
    { classId: "X-A",  subject: "Mathematics" },
    { classId: "VIII-A", subject: "Science" },
    { classId: "VIII-B", subject: "Science" },
  ] as ClassSubjectSlot[],
};

// Per-class student rosters
const CLASS_ROSTERS: Record<string, Student[]> = {
  "IX-A": [
    { id: 1,  name: "Aisha Khan",      rollNo: "01", phone: "+91 98765 00001", email: "aisha@student.com" },
    { id: 2,  name: "Rohan Das",       rollNo: "02", phone: "+91 98765 00002", email: "rohan@student.com" },
    { id: 3,  name: "Sneha Reddy",     rollNo: "03", phone: "+91 98765 00003", email: "sneha@student.com" },
    { id: 4,  name: "Arjun Mehta",     rollNo: "04", phone: "+91 98765 00004", email: "arjun@student.com" },
    { id: 5,  name: "Kavya Iyer",      rollNo: "05", phone: "+91 98765 00005", email: "kavya@student.com" },
    { id: 6,  name: "Vikram Singh",    rollNo: "06", phone: "+91 98765 00006", email: "vikram@student.com" },
    { id: 7,  name: "Priya Sharma",    rollNo: "07", phone: "+91 98765 00007", email: "priya@student.com" },
    { id: 8,  name: "Rahul Verma",     rollNo: "08", phone: "+91 98765 00008", email: "rahul.s@student.com" },
    { id: 9,  name: "Ananya Deshmukh", rollNo: "09", phone: "+91 98765 00009", email: "ananya@student.com" },
    { id: 10, name: "Deepak Patil",    rollNo: "10", phone: "+91 98765 00010", email: "deepak@student.com" },
  ],
  "IX-B": [
    { id: 1,  name: "Siddharth Rao",   rollNo: "01", phone: "+91 98765 00101", email: "siddharth@student.com" },
    { id: 2,  name: "Meera Nair",      rollNo: "02", phone: "+91 98765 00102", email: "meera@student.com" },
    { id: 3,  name: "Aarav Joshi",     rollNo: "03", phone: "+91 98765 00103", email: "aarav@student.com" },
    { id: 4,  name: "Divya Pillai",    rollNo: "04", phone: "+91 98765 00104", email: "divya@student.com" },
    { id: 5,  name: "Karthik Menon",   rollNo: "05", phone: "+91 98765 00105", email: "karthik@student.com" },
    { id: 6,  name: "Neha Kulkarni",   rollNo: "06", phone: "+91 98765 00106", email: "neha@student.com" },
    { id: 7,  name: "Yash Gupta",      rollNo: "07", phone: "+91 98765 00107", email: "yash@student.com" },
    { id: 8,  name: "Shreya Bose",     rollNo: "08", phone: "+91 98765 00108", email: "shreya@student.com" },
  ],
  "X-A": [
    { id: 1,  name: "Ishaan Malhotra", rollNo: "01", phone: "+91 98765 00201", email: "ishaan@student.com" },
    { id: 2,  name: "Tanvi Shah",      rollNo: "02", phone: "+91 98765 00202", email: "tanvi@student.com" },
    { id: 3,  name: "Rohit Kumar",     rollNo: "03", phone: "+91 98765 00203", email: "rohit@student.com" },
    { id: 4,  name: "Puja Agarwal",    rollNo: "04", phone: "+91 98765 00204", email: "puja@student.com" },
    { id: 5,  name: "Nikhil Sinha",    rollNo: "05", phone: "+91 98765 00205", email: "nikhil@student.com" },
    { id: 6,  name: "Aditi Mishra",    rollNo: "06", phone: "+91 98765 00206", email: "aditi@student.com" },
    { id: 7,  name: "Pranav Tiwari",   rollNo: "07", phone: "+91 98765 00207", email: "pranav@student.com" },
    { id: 8,  name: "Riya Pandey",     rollNo: "08", phone: "+91 98765 00208", email: "riya@student.com" },
    { id: 9,  name: "Harsh Trivedi",   rollNo: "09", phone: "+91 98765 00209", email: "harsh@student.com" },
  ],
  "VIII-A": [
    { id: 1,  name: "Arnav Chopra",    rollNo: "01", phone: "+91 98765 00301", email: "arnav@student.com" },
    { id: 2,  name: "Sanya Khanna",    rollNo: "02", phone: "+91 98765 00302", email: "sanya@student.com" },
    { id: 3,  name: "Dev Patel",       rollNo: "03", phone: "+91 98765 00303", email: "dev@student.com" },
    { id: 4,  name: "Anika Sethi",     rollNo: "04", phone: "+91 98765 00304", email: "anika@student.com" },
    { id: 5,  name: "Veer Kapoor",     rollNo: "05", phone: "+91 98765 00305", email: "veer@student.com" },
    { id: 6,  name: "Roshni Das",      rollNo: "06", phone: "+91 98765 00306", email: "roshni@student.com" },
    { id: 7,  name: "Kabir Saxena",    rollNo: "07", phone: "+91 98765 00307", email: "kabir@student.com" },
  ],
  "VIII-B": [
    { id: 1,  name: "Tara Singh",      rollNo: "01", phone: "+91 98765 00401", email: "tara@student.com" },
    { id: 2,  name: "Mihir Bhat",      rollNo: "02", phone: "+91 98765 00402", email: "mihir@student.com" },
    { id: 3,  name: "Zara Ansari",     rollNo: "03", phone: "+91 98765 00403", email: "zara@student.com" },
    { id: 4,  name: "Aditya Naik",     rollNo: "04", phone: "+91 98765 00404", email: "aditya@student.com" },
    { id: 5,  name: "Pooja Hegde",     rollNo: "05", phone: "+91 98765 00405", email: "pooja@student.com" },
    { id: 6,  name: "Sameer Goel",     rollNo: "06", phone: "+91 98765 00406", email: "sameer@student.com" },
  ],
};

// Attendance: per class-subject key  → Record<studentId, present boolean>
type AttendanceStore = Record<string, Record<number, boolean>>;

// Grades / Assignments / Announcements: per class-subject key → array
type GradeStore       = Record<string, Grade[]>;
type AssignmentStore  = Record<string, Assignment[]>;

interface Announcement {
  id: string;
  title: string;
  date: string;
  classId: string;
  subject: string;
}
type AnnouncementStore = Record<string, Announcement[]>;

// Helper: build the storage key
const slotKey = (classId: string, subject: string) => `${classId}__${subject}`;

// Seed defaults for each slot
function buildDefaultAttendance(): AttendanceStore {
  const store: AttendanceStore = {};
  for (const slot of TEACHER_PROFILE.slots) {
    const key = slotKey(slot.classId, slot.subject);
    const roster = CLASS_ROSTERS[slot.classId] ?? [];
    const map: Record<number, boolean> = {};
    roster.forEach((s) => (map[s.id] = true));
    store[key] = map;
  }
  return store;
}

function buildDefaultGrades(): GradeStore {
  const store: GradeStore = {};
  for (const slot of TEACHER_PROFILE.slots) {
    const key = slotKey(slot.classId, slot.subject);
    const roster = CLASS_ROSTERS[slot.classId] ?? [];
    store[key] = roster.slice(0, 4).map((s, i) => ({
      id: `${key}-grade-${i}`,
      student: s.name,
      test: "Unit Test 3",
      subject: slot.subject,
      score: [88, 76, 91, 65, 83, 72, 95, 59][i % 8],
      maxScore: 100,
    }));
  }
  return store;
}

function buildDefaultAssignments(): AssignmentStore {
  const store: AssignmentStore = {};
  for (const slot of TEACHER_PROFILE.slots) {
    const key = slotKey(slot.classId, slot.subject);
    const roster = CLASS_ROSTERS[slot.classId] ?? [];
    store[key] = [
      { id: 1, title: `${slot.subject} — Chapter 8 Practice`, dueDate: "2026-07-25", submitted: Math.floor(roster.length * 0.8), total: roster.length, status: "Active" },
      { id: 2, title: `${slot.subject} — Mid-Term Revision`, dueDate: "2026-07-10", submitted: roster.length, total: roster.length, status: "Completed" },
    ];
  }
  return store;
}

function buildDefaultAnnouncements(): AnnouncementStore {
  const store: AnnouncementStore = {};
  for (const slot of TEACHER_PROFILE.slots) {
    const key = slotKey(slot.classId, slot.subject);
    store[key] = [];
  }
  return store;
}

// ─── Sidebar items ────────────────────────────────────────────────────────────
const sidebarItems = [
  { icon: BarChart3,   label: "Dashboard",     id: "dashboard" },
  { icon: CheckSquare, label: "Attendance",    id: "attendance" },
  { icon: BookOpen,    label: "Grades",        id: "grades" },
  { icon: FileText,    label: "Assignments",   id: "assignments" },
  { icon: Bell,        label: "Announcements", id: "announcements" },
  { icon: Users,       label: "Class Roster",  id: "roster" },
];

// ─── Class+Subject Selector Badge ─────────────────────────────────────────────
function ClassSelector({
  slots,
  activeSlot,
  onChange,
}: {
  slots: ClassSubjectSlot[];
  activeSlot: ClassSubjectSlot;
  onChange: (slot: ClassSubjectSlot) => void;
}) {
  const [open, setOpen] = useState(false);
  // Group by subject for display
  const grouped = slots.reduce<Record<string, string[]>>((acc, s) => {
    if (!acc[s.subject]) acc[s.subject] = [];
    acc[s.subject].push(s.classId);
    return acc;
  }, {});

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-xl text-xs font-bold text-slate-700 hover:border-accent hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
      >
        <Layers size={13} className="text-accent" />
        <span className="text-accent font-extrabold">{activeSlot.classId}</span>
        <span className="text-slate-400">·</span>
        <span>{activeSlot.subject}</span>
        <ChevronDown size={12} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-50 bg-white border border-border rounded-2xl shadow-xl p-2 min-w-[220px]"
          >
            {Object.entries(grouped).map(([subject, classes]) => (
              <div key={subject}>
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 px-3 pt-2 pb-1">{subject}</p>
                {classes.map((cls) => {
                  const isActive = activeSlot.classId === cls && activeSlot.subject === subject;
                  return (
                    <button
                      key={cls}
                      onClick={() => { onChange({ classId: cls, subject }); setOpen(false); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? "bg-accent text-white"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {isActive && <Check size={12} />}
                      <span className="font-bold">{cls}</span>
                      <span className="text-[10px] opacity-70">· {subject}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TeacherPortalPage() {
  // Global states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      if (profile && profile.role === "teacher") {
        setIsLoggedIn(true);
      } else {
        await supabase.auth.signOut();
        setLoginError("Unauthorized access. Teacher privileges required.");
      }
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
  };

  const [activeTab, setActiveTab]       = useState("dashboard");
  const [sidebarOpen, setSidebarOpen]   = useState(false);

  // Active class-subject selection
  const [dynamicSlots, setDynamicSlots] = useState<ClassSubjectSlot[]>(TEACHER_PROFILE.slots);
  const [dynamicRosters, setDynamicRosters] = useState<Record<string, Student[]>>(CLASS_ROSTERS);
  
  const [activeSlot, setActiveSlot] = useState<ClassSubjectSlot>(TEACHER_PROFILE.slots[0]);
  
  const currentKey = activeSlot ? slotKey(activeSlot.classId, activeSlot.subject) : "";
  const currentRoster = activeSlot ? (dynamicRosters[activeSlot.classId] ?? []) : [];

  // ── Persistent stores (Now tied to Supabase) ────────
  const [attendanceStore, setAttendanceStore] = useState<AttendanceStore>({});
  const [gradesStore, setGradesStore] = useState<GradeStore>({});
  const [assignmentsStore, setAssignmentsStore] = useState<AssignmentStore>({});
  const [announcementsStore, setAnnouncementsStore] = useState<AnnouncementStore>({});

  // Fetch Teacher Data from Supabase
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const fetchTeacherData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        let teacherSlots = TEACHER_PROFILE.slots;
        let rosters = CLASS_ROSTERS;

        if (user) {
          // 1. Fetch Teacher ID from profiles or teachers table
          const { data: teacherProfile } = await supabase.from('teachers').select('id').eq('id', user.id).single();
          
          if (teacherProfile) {
            // 2. Fetch Assignments
            const { data: assignments } = await supabase.from('teacher_assignments').select('*').eq('teacher_id', teacherProfile.id);
            
            if (assignments && assignments.length > 0) {
              teacherSlots = assignments.map((a: any) => ({
                classId: a.class_id,
                subject: a.subject,
              }));
              
              setDynamicSlots(teacherSlots);
              setActiveSlot(teacherSlots[0]);

              // 3. Fetch Students for these classes
              const classIds = [...new Set(teacherSlots.map(s => s.classId))];
              rosters = {};
              
              for (const classId of classIds) {
                const [grade, section] = classId.split('-');
                let query = supabase.from('students').select('*').eq('grade', grade);
                if (section) query = query.eq('section', section);
                
                const { data: students } = await query;
                if (students) {
                  rosters[classId] = students.map(s => ({
                    id: s.id,
                    name: s.name,
                    rollNo: s.roll_no,
                    phone: s.phone || '',
                    email: s.email || ''
                  })) as any;
                } else {
                  rosters[classId] = [];
                }
              }
              setDynamicRosters(rosters);
            }
          }
        }

        const classIds = teacherSlots.map(s => s.classId);

        const [
          { data: gradesData },
          { data: assignmentsData },
          { data: attendanceData },
          { data: announcementsData }
        ] = await Promise.all([
          supabase.from("grades").select("*").in("class_id", classIds),
          supabase.from("assignments").select("*").in("class_id", classIds),
          supabase.from("attendance").select("*").in("class_id", classIds),
          supabase.from("announcements").select("*").in("class_id", classIds)
        ]);
        
        // Rebuild Stores grouped by slotKey(classId, subject)
        const newGradesStore: GradeStore = {};
        if (gradesData) {
          gradesData.forEach((g) => {
            const key = slotKey(g.class_id, g.subject);
            if (!newGradesStore[key]) newGradesStore[key] = [];
            const studentInfo = Object.values(rosters).flat().find(s => String(s.id) === String(g.student_id));
            newGradesStore[key].push({
              id: g.id,
              student: studentInfo ? studentInfo.name : "Unknown",
              test: g.test,
              subject: g.subject,
              score: Number(g.score),
              maxScore: Number(g.max_score)
            });
          });
        }
        setGradesStore(newGradesStore);
        
        const newAssignmentsStore: AssignmentStore = {};
        if (assignmentsData) {
          assignmentsData.forEach((a) => {
            const key = slotKey(a.class_id, a.subject);
            if (!newAssignmentsStore[key]) newAssignmentsStore[key] = [];
            newAssignmentsStore[key].push({
              id: a.id,
              title: a.title,
              dueDate: a.due_date,
              total: Number(a.total),
              submitted: Number(a.submitted),
              status: a.status as "Active" | "Draft" | "Completed"
            });
          });
        }
        setAssignmentsStore(newAssignmentsStore);
        
        const newAnnouncementsStore: AnnouncementStore = {};
        if (announcementsData) {
          announcementsData.forEach((a) => {
            if (!a.class_id) return;
            const key = slotKey(a.class_id, a.subject || "");
            if (!newAnnouncementsStore[key]) newAnnouncementsStore[key] = [];
            newAnnouncementsStore[key].push({
              id: a.id,
              title: a.title,
              date: a.date,
              classId: a.class_id,
              subject: a.subject || ""
            });
          });
        }
        setAnnouncementsStore(newAnnouncementsStore);

        const newAttendanceStore: AttendanceStore = {};
        if (attendanceData) {
          attendanceData.forEach((a) => {
            const matchingSlots = teacherSlots.filter(s => s.classId === a.class_id);
            matchingSlots.forEach(slot => {
              const key = slotKey(slot.classId, slot.subject);
              if (!newAttendanceStore[key]) newAttendanceStore[key] = {};
              newAttendanceStore[key][a.student_id] = (a.status === "Present" || a.status === "Late");
            });
          });
        }
        setAttendanceStore(newAttendanceStore);
      } catch (err) {
        console.error("Failed to load teacher data:", err);
      }
    };
    
    fetchTeacherData();
  }, [isLoggedIn]);

  // Current-slot views
  const currentAttendance = attendanceStore[currentKey] ?? {};
  const currentGrades     = gradesStore[currentKey] ?? [];
  const currentAssignments= assignmentsStore[currentKey] ?? [];
  const currentAnnouncements = announcementsStore[currentKey] ?? [];

  // ── UI state ────────────────────────────────────────
  const [attendanceSaved, setAttendanceSaved]     = useState(false);
  const [showGradeModal, setShowGradeModal]       = useState(false);
  const [editingGrade, setEditingGrade]           = useState<Grade | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [announcementText, setAnnouncementText]   = useState("");
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);
  const [rosterSearch, setRosterSearch]           = useState("");

  // ── Confirm dialog state ─────────────────────────────
  type ConfirmAction = { type: "deleteGrade"; id: string } | { type: "deleteAssignment"; id: number } | { type: "deleteAnnouncement"; id: string } | { type: "signOut" } | null;
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);

  const confirmConfig: Record<string, { title: string; message: string; label: string; variant: "danger" | "warning" }> = {
    deleteGrade:        { title: "Delete Score",        message: "This test score will be permanently removed from the gradebook.",    label: "Delete Score",    variant: "danger" },
    deleteAssignment:   { title: "Delete Assignment",   message: "This assignment and its submission data will be permanently deleted.", label: "Delete",          variant: "danger" },
    deleteAnnouncement: { title: "Delete Announcement", message: "This announcement will be removed from the broadcast history.",       label: "Delete",          variant: "danger" },
    signOut:            { title: "Sign Out",             message: "Are you sure you want to sign out from the Teacher Portal?",          label: "Sign Out",        variant: "warning" },
  };

  const executeConfirm = async () => {
    if (!confirmAction) return;
    if (confirmAction.type === "signOut") {
      await handleSignOut();
    } else if (confirmAction.type === "deleteGrade") {
      setGradesStore((prev) => ({ ...prev, [currentKey]: (prev[currentKey] ?? []).filter((g) => g.id !== confirmAction.id) }));
      await supabase.from("grades").delete().eq("id", confirmAction.id);
    } else if (confirmAction.type === "deleteAssignment") {
      setAssignmentsStore((prev) => ({ ...prev, [currentKey]: (prev[currentKey] ?? []).filter((a) => a.id !== confirmAction.id) }));
      await supabase.from("assignments").delete().eq("id", confirmAction.id);
    } else if (confirmAction.type === "deleteAnnouncement") {
      setAnnouncementsStore((prev) => ({ ...prev, [currentKey]: (prev[currentKey] ?? []).filter((a) => a.id !== confirmAction.id) }));
      await supabase.from("announcements").delete().eq("id", confirmAction.id);
    }
    setConfirmAction(null);
  };

  // ── Helpers ──────────────────────────────────────────
  const updateSlotAttendance = useCallback((updater: (prev: Record<number, boolean>) => Record<number, boolean>) => {
    setAttendanceStore((prev) => ({
      ...prev,
      [currentKey]: updater(prev[currentKey] ?? {}),
    }));
  }, [currentKey, setAttendanceStore]);

  const toggleAttendance = (id: number) => {
    updateSlotAttendance((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveAttendance = async () => {
    if (!activeSlot) return;
    setAttendanceSaved(true);
    setTimeout(() => setAttendanceSaved(false), 3000);
    
    // DB Push
    const today = new Date().toISOString().split("T")[0];
    const records = Object.entries(currentAttendance).map(([studentId, isPresent]) => {
      return {
        student_id: studentId,
        class_id: activeSlot.classId,
        date: today,
        status: isPresent ? 'Present' : 'Absent'
      };
    });

    if (records.length > 0) {
      await supabase.from("attendance").upsert(records, { onConflict: "student_id, date" });
    }
  };


  // Grades CRUD
  const handleAddOrEditGrade = async (grade: Omit<Grade, "id">) => {
    if (!activeSlot) return;
    const existing = gradesStore[currentKey] ?? [];
    
    // Find student ID from name for DB insertion
    const studentInfo = Object.values(dynamicRosters).flat().find(s => s.name === grade.student);
    const studentId = studentInfo ? studentInfo.id.toString() : "0";
    
    if (editingGrade) {
      setGradesStore((prev) => ({
        ...prev,
        [currentKey]: existing.map((g) => g.id === editingGrade.id ? { ...g, ...grade } : g)
      }));
      await supabase.from("grades").update({
        test: grade.test,
        subject: grade.subject,
        score: grade.score,
        max_score: grade.maxScore,
        student_id: studentId
      }).eq("id", editingGrade.id);
    } else {
      const { data: insertedData } = await supabase.from("grades").insert({
        class_id: activeSlot.classId,
        student_id: studentId,
        test: grade.test,
        subject: grade.subject,
        score: grade.score,
        max_score: grade.maxScore
      }).select().single();

      if (insertedData) {
        setGradesStore((prev) => ({
          ...prev,
          [currentKey]: [...existing, { ...grade, id: insertedData.id }]
        }));
      }
    }
    
    setEditingGrade(null);
    setShowGradeModal(false);
  };

  const handleDeleteGrade = (id: string) => setConfirmAction({ type: "deleteGrade", id });

  // Assignments CRUD
  const handleAddOrEditAssignment = async (assignment: Omit<Assignment, "id" | "submitted">) => {
    if (!activeSlot) return;
    const existing = assignmentsStore[currentKey] ?? [];
    if (editingAssignment) {
      setAssignmentsStore((prev) => ({
        ...prev,
        [currentKey]: existing.map((a) => a.id === editingAssignment.id ? { ...a, ...assignment } : a)
      }));
      await supabase.from("assignments").update({
        title: assignment.title,
        due_date: assignment.dueDate,
        total: assignment.total,
        status: assignment.status
      }).eq("id", editingAssignment.id);
    } else {
      const { data: insertedData } = await supabase.from("assignments").insert({
        class_id: activeSlot.classId,
        subject: activeSlot.subject,
        title: assignment.title,
        due_date: assignment.dueDate,
        total: assignment.total,
        submitted: 0,
        status: assignment.status
      }).select().single();

      if (insertedData) {
        setAssignmentsStore((prev) => ({
          ...prev,
          [currentKey]: [...existing, { ...assignment, id: insertedData.id, submitted: 0 }]
        }));
      }
    }
    
    setEditingAssignment(null);
    setShowAssignmentModal(false);
  };

  const handleDeleteAssignment = (id: number) => setConfirmAction({ type: "deleteAssignment", id });

  // Announcements
  const escapeHtml = (t: string) =>
    t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSlot) return;
    if (!announcementText.trim()) return;
    if (announcementText.length > 500) { alert("Max 500 characters"); return; }
    
    const { data: insertedData } = await supabase.from("announcements").insert({
      title: escapeHtml(announcementText.trim()),
      content: escapeHtml(announcementText.trim()),
      class_id: activeSlot.classId,
      subject: activeSlot.subject,
      target: "Class"
    }).select().single();

    if (insertedData) {
      const entry: Announcement = {
        id: insertedData.id,
        title: escapeHtml(announcementText.trim()),
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        classId: activeSlot.classId,
        subject: activeSlot.subject,
      };
      
      setAnnouncementsStore((prev) => ({
        ...prev,
        [currentKey]: [entry, ...(prev[currentKey] ?? [])],
      }));
    }
    
    setAnnouncementText("");
    setAnnouncementSuccess(true);
    setTimeout(() => setAnnouncementSuccess(false), 3000);
  };

  const handleDeleteAnnouncement = (id: string) => setConfirmAction({ type: "deleteAnnouncement", id });

  // CSV export
  const handleExportGradesCSV = () => {
    if (!currentGrades.length) return;
    const headers = ["Student Name","Assessment","Subject","Marks","Max Marks","Percentage","Grade"];
    const rows = currentGrades.map((g) => {
      const pct = (g.score / g.maxScore) * 100;
      const gr = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B+" : "B";
      return [`"${g.student}"`,`"${g.test}"`,`"${g.subject}"`,g.score,g.maxScore,`${pct.toFixed(1)}%`,gr];
    });
    const csv = [headers.join(","),...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Grades_${activeSlot.classId}_${activeSlot.subject}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  };

  // Derived values
  const presentCount  = currentRoster.filter((s) => currentAttendance[s.id] !== false).length;
  const classAvg      = currentGrades.length
    ? Math.round(currentGrades.reduce((s, g) => s + (g.score / g.maxScore) * 100, 0) / currentGrades.length)
    : 0;
  const activeAssCount = currentAssignments.filter((a) => a.status === "Active").length;

  const filteredRoster = useMemo(
    () => currentRoster.filter((s) => s.name.toLowerCase().includes(rosterSearch.toLowerCase())),
    [currentRoster, rosterSearch]
  );

  // Shared context bar shown at top of every tab
  const ContextBar = () => (
    <div className="flex items-center gap-3 flex-wrap mb-6">
      {activeSlot && (
        <ClassSelector
          slots={dynamicSlots}
          activeSlot={activeSlot}
          onChange={(slot) => setActiveSlot(slot)}
        />
      )}
      <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
        {currentRoster.length} students · {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}
      </span>
    </div>
  );

  // ── Login screen ─────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-6 relative overflow-hidden">
        <Link href="/" className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl shadow-md transition-all hover:translate-y-[-2px] text-xs md:text-sm cursor-pointer backdrop-blur-sm">
          <ArrowLeft size={16} /> Back to Website
        </Link>
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
                <div className="w-16 h-16 rounded-2xl bg-primary mx-auto mb-4 flex items-center justify-center shadow-lg shadow-secondary/20">
                  <GraduationCap size={30} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-primary tracking-tight">Teacher Portal</h1>
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
                  <input id="loginEmail" type="email" placeholder="teacher@school.com"
                    value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-slate-50/50 hover:bg-slate-50 transition-all placeholder-slate-400 font-medium" required />
                </div>
                <div>
                  <label htmlFor="loginPassword" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <input id="loginPassword" type={showPassword ? "text" : "password"} placeholder="••••••••"
                      value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-border text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-slate-50/50 hover:bg-slate-50 transition-all placeholder-slate-400 font-medium pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="submit"
                  className="w-full h-12 bg-accent hover:bg-accent-light text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all text-base mt-3 cursor-pointer">
                  Secure Login
                </button>
              </form>
              <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed font-medium">Demo mode — click login to explore the dashboard</p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────
  return (
    <div className="min-h-screen w-full bg-slate-50 lg:grid lg:grid-cols-[auto_1fr]">

      {/* Sidebar — Desktop */}
      <aside className="hidden lg:flex w-64 bg-primary flex-col sticky top-0 h-screen shrink-0 z-20">
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-bold">
              {siteConfig.shortName.charAt(0)}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Teacher Panel</p>
              <p className="text-white/40 text-xs">{siteConfig.shortName}</p>
            </div>
          </div>
        </div>

        {/* Class summary pills */}
        <div className="px-4 pt-4 pb-2 space-y-1.5">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/30 px-2 mb-2">My Classes</p>
          {TEACHER_PROFILE.slots.map((slot) => {
            const isActive = slot.classId === activeSlot.classId && slot.subject === activeSlot.subject;
            return (
              <button
                key={slotKey(slot.classId, slot.subject)}
                onClick={() => setActiveSlot(slot)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive ? "bg-accent/20 text-accent-light border border-accent/30" : "text-white/40 hover:text-white/70 hover:bg-white/5"
                }`}
              >
                <BookMarked size={12} className="shrink-0" />
                <span className="font-bold">{slot.classId}</span>
                <span className="opacity-60 text-[10px]">· {slot.subject}</span>
              </button>
            );
          })}
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 border-t border-white/10 mt-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === item.id ? "bg-white/15 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {TEACHER_PROFILE.initials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{TEACHER_PROFILE.name}</p>
              <p className="text-white/40 text-xs truncate">{TEACHER_PROFILE.slots.length} classes assigned</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-white/40 hover:text-white text-xs transition-colors cursor-pointer">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-primary z-30 px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={() => setSidebarOpen(true)} aria-label="Open menu" className="text-white hover:text-accent transition-colors p-1 cursor-pointer">
            <Menu size={22} />
          </button>
          <span className="text-white font-semibold text-sm">Teacher Dashboard</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-accent bg-accent/15 border border-accent/20 px-2 py-0.5 rounded">{activeSlot.classId}</span>
          <button onClick={handleSignOut} aria-label="Sign out" className="text-white/75 hover:text-white transition-colors cursor-pointer">
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black" />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed top-0 bottom-0 left-0 w-72 bg-primary flex-col z-50 flex shadow-2xl overflow-y-auto"
            >
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-bold">
                    {siteConfig.shortName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Teacher Panel</p>
                    <p className="text-white/40 text-xs">{siteConfig.shortName}</p>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} aria-label="Close menu" className="text-white/60 hover:text-white cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              {/* Mobile class selector */}
              <div className="px-4 pt-4 pb-2 space-y-1.5">
                <p className="text-[9px] font-extrabold uppercase tracking-widest text-white/30 px-2 mb-2">My Classes</p>
                {TEACHER_PROFILE.slots.map((slot) => {
                  const isActive = slot.classId === activeSlot.classId && slot.subject === activeSlot.subject;
                  return (
                    <button
                      key={slotKey(slot.classId, slot.subject)}
                      onClick={() => { setActiveSlot(slot); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive ? "bg-accent/20 text-accent-light border border-accent/30" : "text-white/40 hover:text-white/70 hover:bg-white/5"
                      }`}
                    >
                      <BookMarked size={12} className="shrink-0" />
                      <span className="font-bold">{slot.classId}</span>
                      <span className="opacity-60 text-[10px]">· {slot.subject}</span>
                    </button>
                  );
                })}
              </div>

              <nav className="flex-1 py-4 px-3 space-y-1 border-t border-white/10 mt-2">
                {sidebarItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                      activeTab === item.id ? "bg-white/15 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {TEACHER_PROFILE.initials}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{TEACHER_PROFILE.name}</p>
                    <p className="text-white/40 text-xs">{TEACHER_PROFILE.slots.length} classes assigned</p>
                  </div>
                </div>
                <button onClick={() => { setSidebarOpen(false); handleSignOut(); }}
                  className="flex items-center gap-2 text-white/40 hover:text-white text-xs transition-colors cursor-pointer">
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ── Main Content ── */}
      <main className="w-full min-w-0 pt-20 lg:pt-0">
        <div className="p-4 lg:p-8 max-w-5xl mx-auto">

          {/* Page Header */}
          <div className="mb-6 border-b border-slate-200 pb-5">
            <h1 className="text-2xl font-bold text-slate-800">Welcome, {TEACHER_PROFILE.name}</h1>
            <p className="text-slate-500 text-sm mt-1">
              {TEACHER_PROFILE.slots.length} classes · {TEACHER_PROFILE.slots.map(s => s.classId).join(", ")} ·{" "}
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          <AnimatePresence mode="wait">

            {/* ── DASHBOARD ── */}
            {activeTab === "dashboard" && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <ContextBar />

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Class Size",         value: String(currentRoster.length),   icon: Users,       color: "from-blue-500 to-blue-700" },
                    { label: "Today Attendance",   value: `${presentCount}/${currentRoster.length}`, icon: CheckSquare, color: "from-green-500 to-green-700" },
                    { label: "Active Assignments", value: String(activeAssCount),          icon: FileText,    color: "from-emerald-500 to-emerald-700" },
                    { label: "Class Average",      value: currentGrades.length ? `${classAvg}%` : "—", icon: BookOpen, color: "from-purple-500 to-purple-700" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shrink-0 shadow-sm`}>
                        <stat.icon size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
                        <p className="text-xs font-semibold text-slate-500 mt-1">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Attendance widget */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="font-bold text-slate-800 text-sm">Today&apos;s Roll Call · {activeSlot.classId}</h3>
                      <button onClick={() => setActiveTab("attendance")} className="text-xs text-accent font-bold hover:underline cursor-pointer">Full Attendance →</button>
                    </div>
                    <div className="p-4 max-h-[280px] overflow-y-auto divide-y divide-slate-100">
                      {currentRoster.slice(0, 6).map((s) => (
                        <div key={s.id} className="flex items-center justify-between py-2.5 px-1">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-400 font-bold w-5">{s.rollNo}</span>
                            <span className="text-sm font-semibold text-slate-700">{s.name}</span>
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${currentAttendance[s.id] !== false ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-500"}`}>
                            {currentAttendance[s.id] !== false ? "Present" : "Absent"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grades widget */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="font-bold text-slate-800 text-sm">Recent Scores · {activeSlot.subject}</h3>
                      <button onClick={() => setActiveTab("grades")} className="text-xs text-accent font-bold hover:underline cursor-pointer">Gradebook →</button>
                    </div>
                    <div className="p-4">
                      {currentGrades.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">No grades recorded yet for this class.</p>
                      ) : (
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-slate-400 border-b border-slate-100">
                              <th className="text-left pb-2 font-semibold">Student</th>
                              <th className="text-center pb-2 font-semibold">Score</th>
                              <th className="text-center pb-2 font-semibold">Grade</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {currentGrades.slice(0, 5).map((g) => {
                              const pct = (g.score / g.maxScore) * 100;
                              const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B+" : "B";
                              const gColor = pct >= 90 ? "bg-green-50 text-green-600" : pct >= 80 ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600";
                              return (
                                <tr key={g.id} className="hover:bg-slate-50/50">
                                  <td className="py-2.5 font-semibold text-slate-700">{g.student}</td>
                                  <td className="py-2.5 text-center font-bold text-slate-800">{g.score}/100</td>
                                  <td className="py-2.5 text-center"><span className={`font-bold px-2 py-0.5 rounded ${gColor}`}>{grade}</span></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>

                {/* All-classes overview */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-sm mb-4">All Classes Overview</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dynamicSlots.map((slot) => {
                      const key = slotKey(slot.classId, slot.subject);
                      const roster = dynamicRosters[slot.classId] ?? [];
                      const att = attendanceStore[key] ?? {};
                      const present = roster.filter((s) => att[s.id] !== false).length;
                      const isSelected = activeSlot && slot.classId === activeSlot.classId && slot.subject === activeSlot.subject;
                      return (
                        <button
                          key={key}
                          onClick={() => setActiveSlot(slot)}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                            isSelected ? "bg-accent/5 border-accent/30" : "bg-slate-50 border-slate-100 hover:border-slate-200 hover:bg-white"
                          }`}
                        >
                          <div>
                            <p className={`text-sm font-bold ${isSelected ? "text-accent" : "text-slate-800"}`}>{slot.classId}</p>
                            <p className="text-xs text-slate-500">{slot.subject}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-extrabold text-slate-800">{present}/{roster.length}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">Present Today</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── ATTENDANCE ── */}
            {activeTab === "attendance" && (
              <motion.div key="attendance" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <ContextBar />
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">Roll Call — {activeSlot.classId} · {activeSlot.subject}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Toggle student present/absent status</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className="text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                        Present: {presentCount} / {currentRoster.length}
                      </span>
                      <button onClick={handleSaveAttendance}
                        className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-light transition-all cursor-pointer">
                        Submit Record
                      </button>
                    </div>
                  </div>

                  {attendanceSaved && (
                    <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs p-3.5 rounded-2xl font-semibold mb-4 text-center">
                      ✓ Attendance for {activeSlot.classId} · {activeSlot.subject} submitted successfully.
                    </div>
                  )}

                  <div className="border border-slate-100 rounded-2xl overflow-hidden max-h-[500px] overflow-y-auto divide-y divide-slate-100">
                    {currentRoster.map((student) => (
                      <div key={student.id} className="flex items-center justify-between py-3 px-4 hover:bg-slate-50/50 transition-all">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 font-extrabold w-6">{student.rollNo}</span>
                          <span className="text-sm font-semibold text-slate-700">{student.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`att-${student.id}`}
                            checked={currentAttendance[student.id] !== false}
                            onChange={() => toggleAttendance(student.id)}
                            className="w-4 h-4 rounded border-slate-300 text-accent focus:ring-accent/30 cursor-pointer"
                            aria-label={`Mark ${student.name} as present`}
                          />
                          <label htmlFor={`att-${student.id}`} className="text-xs font-bold text-slate-500 cursor-pointer">
                            {currentAttendance[student.id] !== false ? "Present" : "Absent"}
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── GRADES ── */}
            {activeTab === "grades" && (
              <motion.div key="grades" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <ContextBar />
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-x-auto">
                  <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">Gradebook — {activeSlot.classId} · {activeSlot.subject}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Log and manage student exam scores</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleExportGradesCSV}
                        className="flex items-center gap-1.5 px-4 py-2 border border-border text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer">
                        <Download size={14} /> Export CSV
                      </button>
                      <button
                        onClick={() => { setEditingGrade(null); setShowGradeModal(true); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-xs font-bold rounded-xl hover:shadow-lg transition-all cursor-pointer">
                        <Plus size={14} /> Add Score
                      </button>
                    </div>
                  </div>

                  {currentGrades.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-12">No grades recorded for this class yet. Click &quot;Add Score&quot; to get started.</p>
                  ) : (
                    <table className="w-full text-sm min-w-[500px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Student</th>
                          <th className="text-left px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Assessment</th>
                          <th className="text-center px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Marks</th>
                          <th className="text-center px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Grade</th>
                          <th className="text-right px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {currentGrades.map((g) => {
                          const pct = (g.score / g.maxScore) * 100;
                          const grade = pct >= 90 ? "A+" : pct >= 80 ? "A" : pct >= 70 ? "B+" : "B";
                          const gColor = pct >= 90 ? "bg-green-50 text-green-600" : pct >= 80 ? "bg-blue-50 text-blue-600" : "bg-emerald-50 text-emerald-600";
                          return (
                            <tr key={g.id} className="hover:bg-slate-50/50">
                              <td className="px-6 py-3 font-semibold text-slate-700">{g.student}</td>
                              <td className="px-6 py-3 text-xs text-slate-400 font-medium">{g.test} · {g.subject}</td>
                              <td className="px-6 py-3 text-center font-bold text-slate-800">{g.score} <span className="text-xs text-slate-400 font-normal">/{g.maxScore}</span></td>
                              <td className="px-6 py-3 text-center">
                                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${gColor}`}>{grade}</span>
                              </td>
                              <td className="px-6 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => { setEditingGrade(g); setShowGradeModal(true); }}
                                    title="Edit score" className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
                                    <Edit size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteGrade(g.id)}
                                    title="Delete score" className="p-1.5 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-600 transition-colors cursor-pointer">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>

                <GradeModal
                  isOpen={showGradeModal}
                  onClose={() => setShowGradeModal(false)}
                  onSubmit={handleAddOrEditGrade}
                  students={currentRoster}
                  editGrade={editingGrade}
                  defaultSubject={activeSlot.subject}
                />
              </motion.div>
            )}

            {/* ── ASSIGNMENTS ── */}
            {activeTab === "assignments" && (
              <motion.div key="assignments" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <ContextBar />
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">Assignments — {activeSlot.classId} · {activeSlot.subject}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">Post and manage class assignments</p>
                    </div>
                    <button
                      onClick={() => { setEditingAssignment(null); setShowAssignmentModal(true); }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-accent text-white text-xs font-bold rounded-xl hover:shadow-lg transition-all cursor-pointer">
                      <Plus size={14} /> New Assignment
                    </button>
                  </div>

                  {currentAssignments.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-12">No assignments yet. Click &quot;New Assignment&quot; to create one.</p>
                  ) : (
                    <div className="space-y-3">
                      {currentAssignments.map((a) => (
                        <div key={a.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all flex-wrap gap-3">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 shrink-0">
                              <FileText size={18} className="text-primary" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-800 text-sm leading-normal">{a.title}</h4>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">Due: {a.dueDate}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 ml-auto sm:ml-0">
                            <div className="text-right hidden sm:block mr-2">
                              <p className="text-xs font-bold text-slate-700">{a.submitted} / {a.total}</p>
                              <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">Submissions</p>
                            </div>
                            <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${a.status === "Completed" ? "bg-green-50 text-green-600" : a.status === "Active" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
                              {a.status}
                            </span>
                            <div className="flex gap-1 ml-2">
                              <button onClick={() => { setEditingAssignment(a); setShowAssignmentModal(true); }}
                                title="Edit" className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer">
                                <Edit size={14} />
                              </button>
                              <button onClick={() => handleDeleteAssignment(a.id)}
                                title="Delete" className="p-1.5 hover:bg-red-100 rounded-lg text-slate-500 hover:text-red-600 transition-colors cursor-pointer">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <AssignmentModal
                  isOpen={showAssignmentModal}
                  onClose={() => setShowAssignmentModal(false)}
                  onSubmit={handleAddOrEditAssignment}
                  editAssignment={editingAssignment}
                  defaultTotal={currentRoster.length}
                />
              </motion.div>
            )}

            {/* ── ANNOUNCEMENTS ── */}
            {activeTab === "announcements" && (
              <motion.div key="announcements" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <ContextBar />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-fit">
                    <h3 className="font-bold text-slate-800 text-base mb-1">Broadcast Announcement</h3>
                    <p className="text-xs text-slate-400 mb-4">To: {activeSlot.classId} · {activeSlot.subject}</p>
                    {announcementSuccess && (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs p-3.5 rounded-2xl font-semibold mb-4 text-center">
                        ✓ Announcement sent to {activeSlot.classId}.
                      </div>
                    )}
                    <form onSubmit={handlePublishAnnouncement} className="space-y-4">
                      <div>
                        <label htmlFor="announce-textarea" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Message</label>
                        <textarea
                          id="announce-textarea"
                          rows={4}
                          value={announcementText}
                          onChange={(e) => setAnnouncementText(e.target.value)}
                          placeholder="Type announcement..."
                          maxLength={500}
                          className="w-full px-3 py-2.5 border border-border rounded-xl text-xs bg-slate-50 focus:outline-none resize-none placeholder-slate-400 transition-all focus:ring-accent/30 focus:border-accent"
                          required
                        />
                        <p className="text-[9px] text-right text-slate-400 font-medium mt-1">{announcementText.length}/500</p>
                      </div>
                      <button type="submit" className="w-full py-3 bg-accent hover:bg-accent-light text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer">
                        Publish Broadcast
                      </button>
                    </form>
                  </div>

                  <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 text-base mb-4">Broadcast History · {activeSlot.classId}</h3>
                    {currentAnnouncements.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-10">No announcements for this class yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {currentAnnouncements.map((a) => (
                          <div key={a.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-4 justify-between items-start">
                            <div className="flex gap-4">
                              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                <Bell size={16} className="text-blue-500" />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-700 leading-relaxed">{a.title}</p>
                                <p className="text-[9px] text-slate-400 font-semibold mt-1">{a.date}</p>
                              </div>
                            </div>
                            <button onClick={() => handleDeleteAnnouncement(a.id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors cursor-pointer">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── ROSTER ── */}
            {activeTab === "roster" && (
              <motion.div key="roster" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
                <ContextBar />
                <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-x-auto">
                  <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                    <div>
                      <h3 className="font-bold text-slate-800 text-base">Class {activeSlot.classId} Student Roster</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{currentRoster.length} students registered</p>
                    </div>
                    <div className="relative max-w-xs w-full">
                      <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search student..."
                        value={rosterSearch}
                        onChange={(e) => setRosterSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border border-border rounded-xl text-xs bg-slate-50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <table className="w-full text-sm min-w-[500px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="text-left px-6 py-3">Roll</th>
                        <th className="text-left px-6 py-3">Student Name</th>
                        <th className="text-left px-6 py-3">Phone Number</th>
                        <th className="text-left px-6 py-3">Email Address</th>
                        <th className="text-center px-6 py-3">Attendance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredRoster.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-3.5 font-bold text-slate-400 text-xs">{s.rollNo}</td>
                          <td className="px-6 py-3.5 font-bold text-slate-700">{s.name}</td>
                          <td className="px-6 py-3.5 text-xs text-slate-500">{s.phone}</td>
                          <td className="px-6 py-3.5 text-xs text-slate-500 font-medium">{s.email}</td>
                          <td className="px-6 py-3.5 text-center">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${currentAttendance[s.id] !== false ? "bg-green-50 text-green-600" : "bg-rose-50 text-rose-500"}`}>
                              {currentAttendance[s.id] !== false ? "Present" : "Absent"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>

      {/* ── Global Confirm Dialog ── */}
      {confirmAction && (
        <ConfirmDialog
          isOpen={true}
          title={confirmConfig[confirmAction.type].title}
          message={confirmConfig[confirmAction.type].message}
          confirmLabel={confirmConfig[confirmAction.type].label}
          cancelLabel="Cancel"
          variant={confirmConfig[confirmAction.type].variant}
          onConfirm={executeConfirm}
          onCancel={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}
