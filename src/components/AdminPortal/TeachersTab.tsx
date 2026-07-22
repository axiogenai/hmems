import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Plus, Search, X, Shield, BookOpen, FileSpreadsheet, Download, Loader2, Mail, Trash2, Grid, School, UserPlus, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { inviteUser, resendPasswordLink, purgeAllTeachers, bulkPurgeTeachers } from "@/app/actions/auth";
import { ToastNotification, ToastMessage } from "@/components/ui/ToastNotification";

export const AVAILABLE_CLASSES = [
  "Nursery", "LKG", "UKG",
  "I-A", "I-B", "II-A", "II-B", "III-A", "III-B", "IV-A", "IV-B", "V-A", "V-B",
  "VI-A", "VI-B", "VII-A", "VII-B", "VIII-A", "VIII-B", "IX-A", "IX-B",
  "X-A", "X-B"
];

export const AVAILABLE_SUBJECTS = [
  "Mathematics", "Science", "English", "Social Studies", "Hindi", "Computer Science",
  "Physics", "Chemistry", "Biology", "Physical Education", "Accountancy", "Economics",
  "Business Studies", "History", "Geography", "Political Science", "General Knowledge", "Environmental Studies"
];

const TEACHER_GRADE_GROUPS = [
  {
    title: "Pre-Primary School",
    subtitle: "Nursery, LKG & UKG",
    classes: ["Nursery", "LKG", "UKG"]
  },
  {
    title: "Primary School",
    subtitle: "Classes I to V (Sections A & B)",
    classes: ["I-A", "I-B", "II-A", "II-B", "III-A", "III-B", "IV-A", "IV-B", "V-A", "V-B"]
  },
  {
    title: "Middle School",
    subtitle: "Classes VI to VIII (Sections A & B)",
    classes: ["VI-A", "VI-B", "VII-A", "VII-B", "VIII-A", "VIII-B"]
  },
  {
    title: "High School",
    subtitle: "Classes IX & X (Sections A & B)",
    classes: ["IX-A", "IX-B", "X-A", "X-B"]
  }
];

export function TeachersTab() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [teachers, setTeachers] = useState<any[]>([]);
  const [allAssignments, setAllAssignments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{ current: number; total: number; currentName?: string } | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showPurgeConfirmModal, setShowPurgeConfirmModal] = useState(false);
  const [isPurgingTeachers, setIsPurgingTeachers] = useState(false);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);

  // Add Teacher Modal (basic info only — no class/subject)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Class Window State
  const [activeClassWindow, setActiveClassWindow] = useState<string | null>(null);

  // Assign Teacher in Class Window
  const [showAssignInClassModal, setShowAssignInClassModal] = useState(false);
  const [assignTeacherId, setAssignTeacherId] = useState("");
  const [assignSubject, setAssignSubject] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);

  const [resendingEmail, setResendingEmail] = useState<string | null>(null);

  // ---------- Data Fetching ----------

  const fetchTeachers = async () => {
    setLoading(true);
    const { data: teachersData } = await supabase
      .from("teachers")
      .select("*")
      .order("created_at", { ascending: false });

    const { data: assignmentsData } = await supabase
      .from("teacher_assignments")
      .select("*");

    if (teachersData) {
      const enrichedTeachers = teachersData.map((t) => ({
        ...t,
        assignments: assignmentsData?.filter((a) => a.teacher_id === t.id) || [],
      }));
      setTeachers(enrichedTeachers);
    }
    if (assignmentsData) {
      setAllAssignments(assignmentsData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // ---------- Computed Values ----------

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase())
  );

function matchClassId(c1: string, c2: string): boolean {
  if (!c1 || !c2) return false;
  const clean1 = c1.trim().toUpperCase().replace(/^CLASS\s+/i, "");
  const clean2 = c2.trim().toUpperCase().replace(/^CLASS\s+/i, "");
  return clean1 === clean2;
}

  // Count assignments per class
  const classAssignmentCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: allAssignments.length };
    AVAILABLE_CLASSES.forEach(cls => {
      counts[cls] = allAssignments.filter(a => matchClassId(a.class_id, cls)).length;
    });
    return counts;
  }, [allAssignments]);

  // Assignments for the active class window
  const activeClassAssignments = useMemo(() => {
    if (!activeClassWindow) return [];
    return allAssignments
      .filter(a => matchClassId(a.class_id, activeClassWindow))
      .map(a => {
        const teacher = teachers.find(t => t.id === a.teacher_id);
        return { ...a, teacherName: teacher?.name || "Unknown", teacherEmail: teacher?.email || "" };
      });
  }, [activeClassWindow, allAssignments, teachers]);

  // ---------- Handlers ----------

  const handleToggleSelectAll = () => {
    if (selectedTeacherIds.length === filteredTeachers.length && filteredTeachers.length > 0) {
      setSelectedTeacherIds([]);
    } else {
      setSelectedTeacherIds(filteredTeachers.map(t => t.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedTeacherIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handlePurgeTeachers = async () => {
    setIsPurgingTeachers(true);
    let res;

    if (selectedTeacherIds.length > 0) {
      res = await bulkPurgeTeachers(selectedTeacherIds);
    } else {
      res = await purgeAllTeachers();
    }

    setIsPurgingTeachers(false);
    setShowPurgeConfirmModal(false);

    if (res.success) {
      const countStr = selectedTeacherIds.length > 0 ? `${selectedTeacherIds.length} selected teacher(s)` : "All teachers";
      setToast({
        id: Date.now().toString(),
        type: "success",
        title: "Teacher Database Purged",
        message: `${countStr} and their class assignments have been deleted.`
      });
      setSelectedTeacherIds([]);
      fetchTeachers();
    } else {
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Purge Failed",
        message: res.error || "Failed to purge teachers."
      });
    }
  };

  const handleResendLink = async (email: string) => {
    setResendingEmail(email);
    const res = await resendPasswordLink(email);
    setResendingEmail(null);
    if (res.success) {
      setToast({
        id: Date.now().toString(),
        type: "success",
        title: "Password Setup Link Sent",
        message: `Password setup link successfully emailed to ${email}.`
      });
    } else {
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Failed to Resend Link",
        message: res.error || "Unable to dispatch invitation email."
      });
    }
  };

  // Phase 1: Add Teacher — basic info only (no class/subject)
  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isEmailDuplicate = teachers.some(t => t.email?.toLowerCase().trim() === newEmail.toLowerCase().trim());
    if (isEmailDuplicate) {
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Registration Failed",
        message: "A teacher with this email address is already registered!"
      });
      setIsSubmitting(false);
      return;
    }

    const res = await inviteUser(newEmail, "teacher", undefined, newName, newPhone);

    if (res.success) {
      setIsSubmitting(false);
      setShowAddModal(false);
      setToast({
        id: Date.now().toString(),
        type: "success",
        title: "Teacher Registered Successfully",
        message: `${newName} has been registered. Invitation email sent to ${newEmail}. Assign classes via the Class Hub below.`
      });
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      fetchTeachers();
    } else {
      setIsSubmitting(false);
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Failed to Add Teacher",
        message: res.error || "Unknown error occurred."
      });
    }
  };

  // Phase 2: Assign teacher to class (inside class window)
  const handleAssignTeacherToClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClassWindow || !assignTeacherId || !assignSubject) return;
    setIsAssigning(true);

    // Check for duplicate assignment
    const existing = allAssignments.find(
      a => a.teacher_id === assignTeacherId && matchClassId(a.class_id, activeClassWindow) && a.subject === assignSubject
    );
    if (existing) {
      setIsAssigning(false);
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Duplicate Assignment",
        message: "This teacher is already assigned to this subject in this class."
      });
      return;
    }

    const { error } = await supabase.from("teacher_assignments").insert({
      teacher_id: assignTeacherId,
      class_id: activeClassWindow,
      subject: assignSubject,
    });

    setIsAssigning(false);

    if (error) {
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Assignment Failed",
        message: error.message
      });
    } else {
      const teacher = teachers.find(t => t.id === assignTeacherId);
      setShowAssignInClassModal(false);
      setToast({
        id: Date.now().toString(),
        type: "success",
        title: "Teacher Assigned",
        message: `${teacher?.name || "Teacher"} assigned to ${activeClassWindow} for ${assignSubject}.`
      });
      setAssignTeacherId("");
      setAssignSubject("");
      fetchTeachers();
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    const { error } = await supabase.from("teacher_assignments").delete().eq("id", assignmentId);
    if (!error) {
      setToast({
        id: Date.now().toString(),
        type: "success",
        title: "Assignment Removed",
        message: "Successfully unlinked teacher from this class."
      });
      fetchTeachers();
    }
  };

  // CSV Import (backward-compatible: class/subject columns optional)
  const handleImportTeachersCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setIsImporting(true);

    try {
      const text = await file.text();
      const rawRows = text.split(/\r?\n/).map((r) => r.trim()).filter((r) => r.length > 0);
      let successCount = 0;
      let skippedCount = 0;

      const startIdx = (rawRows.length > 0 && /name|email|class|subject|phone/i.test(rawRows[0])) ? 1 : 0;
      const rows = rawRows.slice(startIdx);

      setImportProgress({ current: 0, total: rows.length, currentName: "Initializing..." });

      for (let i = 0; i < rows.length; i++) {
        try {
          const row = rows[i];
          const cols = row.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ''));

          const emailIdx = cols.findIndex((c) => /^\S+@\S+\.\S+$/.test(c));
          if (emailIdx === -1) {
            skippedCount++;
            continue;
          }

          const email = cols[emailIdx].toLowerCase();
          const name = emailIdx > 0 ? cols[0] : (cols[1] || email.split("@")[0]);
          const phone = cols.find((c, idx) => idx !== emailIdx && idx !== 0 && /^[\+\d\s\-()]{7,}$/.test(c)) || "";
          const assignedClass = cols[3] || "";
          const assignedSubject = cols[4] || "";

          setImportProgress({ current: i + 1, total: rows.length, currentName: `Processing ${name} (${email})...` });

          const { data: existingTeacher } = await supabase.from("teachers").select("id").eq("email", email).single();
          if (existingTeacher) {
            skippedCount++;
            continue;
          }

          const res = await inviteUser(email, "teacher", undefined, name, phone);

          let teacherId = res.userId;
          if (!teacherId) {
            const newId = crypto.randomUUID();
            await supabase.from("teachers").upsert({
              id: newId,
              name: name,
              email: email,
              phone: phone || null,
              status: "Active"
            });
            teacherId = newId;
          }

          successCount++;

          // Auto-assign if class+subject columns exist in CSV
          if (teacherId && assignedClass && assignedSubject) {
            await supabase.from("teacher_assignments").delete().eq("teacher_id", teacherId).eq("class_id", assignedClass);
            await supabase.from("teacher_assignments").insert({
              teacher_id: teacherId,
              class_id: assignedClass,
              subject: assignedSubject
            });
          }
        } catch (rowErr) {
          console.warn("Error processing row, skipping:", rowErr);
          skippedCount++;
        }
      }

      setToast({
        id: Date.now().toString(),
        type: "success",
        title: "CSV Import Complete",
        message: `Registered ${successCount} new teacher(s). ${skippedCount > 0 ? `${skippedCount} duplicate/invalid record(s) skipped.` : ''}`
      });
      fetchTeachers();
    } catch (err: any) {
      console.error("Teacher CSV Import Error:", err);
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Import Failed",
        message: "Failed to parse teacher CSV file. Please check file formatting."
      });
    } finally {
      setIsImporting(false);
      setImportProgress(null);
      e.target.value = "";
    }
  };

  const handleExportTeachersCSV = () => {
    const headers = ["Full Name", "Email Address", "Phone Number", "Status", "Assignments"];
    const rows = teachers.map((t) => [
      t.name,
      t.email,
      t.phone || "",
      t.status,
      t.assignments?.map((a: any) => `${a.class_id}:${a.subject}`).join("; ") || "None"
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `teachers_directory_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ---------- RENDER ----------

  return (
    <div className="space-y-6">
      {/* ==================== PHASE 1: TEACHER DIRECTORY ==================== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Teachers Directory</h2>
          <p className="text-sm text-slate-500">Register teachers first, then assign them to classes below</p>
        </div>
        <div className="flex gap-2.5 flex-wrap">
          <label className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm">
            {isImporting ? <Loader2 size={14} className="animate-spin" /> : <FileSpreadsheet size={14} />}
            {isImporting ? "Importing..." : "Import CSV"}
            <input type="file" accept=".csv" onChange={handleImportTeachersCSV} disabled={isImporting} className="hidden" />
          </label>
          <button
            onClick={handleExportTeachersCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            onClick={() => setShowPurgeConfirmModal(true)}
            className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm ${
              selectedTeacherIds.length > 0
                ? "bg-rose-600 border-rose-600 text-white hover:bg-rose-700 animate-in fade-in zoom-in-95"
                : "bg-rose-50 border-rose-200 hover:bg-rose-100 text-rose-700"
            }`}
          >
            <Trash2 size={14} />
            {selectedTeacherIds.length > 0 ? `Purge Selected (${selectedTeacherIds.length})` : "Purge Database"}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            Register New Teacher
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-3">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search teachers by name or email..."
          className="flex-1 bg-transparent border-none focus:outline-none text-sm"
        />
      </div>

      {/* Teacher Directory Table (simplified — no assignment columns) */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading teachers...</div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Shield className="text-slate-400" size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No teachers found</h3>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              You haven&apos;t registered any teachers yet. Click &quot;Register New Teacher&quot; to get started.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedTeacherIds.length === filteredTeachers.length && filteredTeachers.length > 0}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Classes Assigned</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.map((t) => (
                <tr key={t.id} className={`hover:bg-slate-50/50 transition-colors ${selectedTeacherIds.includes(t.id) ? "bg-rose-50/40" : ""}`}>
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedTeacherIds.includes(t.id)}
                      onChange={() => handleToggleSelect(t.id)}
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{t.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-slate-600">{t.email}</div>
                    <div className="text-slate-500 text-xs">{t.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-100">
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {t.assignments?.length > 0 ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                        {t.assignments.length} class{t.assignments.length !== 1 ? "es" : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleResendLink(t.email)}
                      disabled={resendingEmail === t.email}
                      title="Resend Password Setup Email to Teacher"
                      className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-700 font-bold text-xs bg-slate-100 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {resendingEmail === t.email ? (
                        <Loader2 size={12} className="animate-spin text-emerald-600" />
                      ) : (
                        <Mail size={12} className="text-emerald-600" />
                      )}
                      {resendingEmail === t.email ? "Sending..." : "Resend Link"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ==================== PHASE 2: CLASS HUB GRID ==================== */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
            <Grid size={18} className="text-emerald-600" /> Class Assignment Hub (Nursery to Class X)
          </h4>
          <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            Total Assignments: {classAssignmentCounts.ALL}
          </span>
        </div>

        <div className="space-y-6">
          {TEACHER_GRADE_GROUPS.map((group) => (
            <div key={group.title} className="bg-slate-50/50 p-5 rounded-3xl border border-slate-200/80 space-y-3">
              <div className="flex justify-between items-baseline">
                <h5 className="font-extrabold text-slate-800 text-sm">{group.title}</h5>
                <span className="text-[11px] font-semibold text-slate-400">{group.subtitle}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {group.classes.map((cls) => {
                  const count = classAssignmentCounts[cls] || 0;
                  return (
                    <div
                      key={cls}
                      onClick={() => setActiveClassWindow(cls)}
                      className="bg-white border border-slate-200/90 hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5 p-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="space-y-1 overflow-hidden">
                        <div className="font-extrabold text-slate-800 text-xs truncate group-hover:text-emerald-700 transition-colors">
                          {cls}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium group-hover:text-emerald-600 flex items-center gap-1">
                          <span>Open Window</span>
                          <span>&rarr;</span>
                        </div>
                      </div>

                      <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/70 shrink-0 ml-2 shadow-2xs">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== CLASS WINDOW MODAL ==================== */}
      {mounted && activeClassWindow && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Window Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-inner">
                  <School size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">{activeClassWindow} — Teacher Assignments</h3>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {activeClassAssignments.length} Teacher{activeClassAssignments.length !== 1 ? "s" : ""} Assigned
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Assign registered teachers to {activeClassWindow} and manage their subject mappings
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveClassWindow(null)}
                className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <button
                onClick={() => {
                  setAssignTeacherId("");
                  setAssignSubject("");
                  setShowAssignInClassModal(true);
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
              >
                <UserPlus size={14} /> Assign Teacher to {activeClassWindow}
              </button>
            </div>

            {/* Assignments Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              {activeClassAssignments.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <div className="w-14 h-14 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users size={22} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-600">No teachers assigned to {activeClassWindow}</p>
                  <p className="text-xs">Click &quot;Assign Teacher&quot; above to assign a registered teacher and their subject to this class.</p>
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3.5">Teacher Name</th>
                      <th className="px-5 py-3.5">Email</th>
                      <th className="px-5 py-3.5">Subject</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeClassAssignments.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-800">{a.teacherName}</div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs font-mono">{a.teacherEmail}</td>
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <BookOpen size={12} className="text-emerald-600" />
                            {a.subject}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => handleRemoveAssignment(a.id)}
                            className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-bold text-xs bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
                          >
                            <X size={12} /> Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ==================== ASSIGN TEACHER IN CLASS MODAL ==================== */}
      {mounted && showAssignInClassModal && activeClassWindow && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Assign Teacher to {activeClassWindow}</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Pick from registered teachers and assign a subject</p>
              </div>
              <button
                onClick={() => setShowAssignInClassModal(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignTeacherToClass} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Teacher <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={assignTeacherId}
                  onChange={(e) => setAssignTeacherId(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
                >
                  <option value="">Choose a registered teacher...</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Subject <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={assignSubject}
                  onChange={(e) => setAssignSubject(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-sm focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
                >
                  <option value="">Select Subject</option>
                  {AVAILABLE_SUBJECTS.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>

              <div className="pt-6 flex items-center gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAssignInClassModal(false)}
                  className="flex-1 py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="flex-1 py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isAssigning ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    "Assign to Class"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ==================== ADD TEACHER MODAL (Basic Info Only) ==================== */}
      {mounted && showAddModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Register New Teacher</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">Add teacher profile &amp; send invite. Assign classes via Class Hub.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTeacher} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-base focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                  placeholder="e.g. Mr. Rahul Patil"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-base focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                  placeholder="teacher@school.com"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium text-base focus:bg-white focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400 placeholder:font-normal"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-3.5">
                <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                  💡 <strong>Tip:</strong> After registration, use the <strong>Class Assignment Hub</strong> below to assign this teacher to one or more classes and their subjects.
                </p>
              </div>

              <div className="pt-6 flex items-center gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending Invite...
                    </>
                  ) : (
                    "Register & Send Invite"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* FULL-SCREEN CSV IMPORT ANIMATED LOADING MODAL */}
      {mounted && isImporting && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[999999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-slate-100 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-inner">
                <Loader2 size={36} className="animate-spin text-emerald-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Importing CSV Data...</h3>
              <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-full inline-block border border-emerald-200/60 max-w-xs truncate">
                {importProgress?.currentName || "Processing spreadsheet records..."}
              </p>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Registering faculty members and dispatching invitation emails.
              </p>
            </div>

            {importProgress && importProgress.total > 0 && (
              <div className="space-y-2 pt-2">
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200 p-0.5">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-300 shadow-xs"
                    style={{ width: `${Math.round((importProgress.current / importProgress.total) * 100)}%` }}
                  />
                </div>
                <p className="text-xs font-bold text-slate-600">
                  {importProgress.current} of {importProgress.total} records processed ({Math.round((importProgress.current / importProgress.total) * 100)}%)
                </p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* CONFIRM PURGE TEACHERS MODAL */}
      {mounted && showPurgeConfirmModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Purge Teacher Database</h3>
                <p className="text-xs text-rose-600 font-semibold">Irreversible Action</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              {selectedTeacherIds.length > 0 ? (
                <>
                  Are you sure you want to <strong>delete the {selectedTeacherIds.length} selected teacher(s)</strong> and their class assignments from the database?
                </>
              ) : (
                <>
                  Are you sure you want to <strong>delete ALL teachers and class assignments</strong> from the database?
                </>
              )}
            </p>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowPurgeConfirmModal(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPurgingTeachers}
                onClick={handlePurgeTeachers}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/25 cursor-pointer flex items-center gap-2 disabled:opacity-60"
              >
                {isPurgingTeachers ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {isPurgingTeachers
                  ? "Purging..."
                  : selectedTeacherIds.length > 0
                  ? `Purge Selected (${selectedTeacherIds.length})`
                  : "Purge Entire Database"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* TOAST NOTIFICATION */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
