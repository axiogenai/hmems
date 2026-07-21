import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Search, Plus, Trash2, RotateCcw, FileSpreadsheet, Download, ChevronLeft, ChevronRight, Loader2, Mail, Grid, Layers, School, UserPlus } from "lucide-react";
import { Student, StudentStatus } from "@/types/admin";
import { FormInput } from "@/components/TeacherPortal/FormInput";
import { resendPasswordLink, purgeAllStudents, bulkPurgeStudents } from "@/app/actions/auth";
import { ToastNotification, ToastMessage } from "@/components/ui/ToastNotification";

export const CLASSES_LIST = [
  "Nursery", "LKG", "UKG",
  "Class I-A", "Class I-B", "Class II-A", "Class II-B",
  "Class III-A", "Class III-B", "Class IV-A", "Class IV-B",
  "Class V-A", "Class V-B", "Class VI-A", "Class VI-B",
  "Class VII-A", "Class VII-B", "Class VIII-A", "Class VIII-B",
  "Class IX-A", "Class IX-B", "Class X-A", "Class X-B"
];

export const GRADE_GROUPS = [
  {
    title: "Pre-Primary School",
    subtitle: "Nursery, LKG & UKG",
    classes: ["Nursery", "LKG", "UKG"]
  },
  {
    title: "Primary School",
    subtitle: "Classes I to V (Sections A & B)",
    classes: ["Class I-A", "Class I-B", "Class II-A", "Class II-B", "Class III-A", "Class III-B", "Class IV-A", "Class IV-B", "Class V-A", "Class V-B"]
  },
  {
    title: "Middle School",
    subtitle: "Classes VI to VIII (Sections A & B)",
    classes: ["Class VI-A", "Class VI-B", "Class VII-A", "Class VII-B", "Class VIII-A", "Class VIII-B"]
  },
  {
    title: "High School",
    subtitle: "Classes IX & X (Sections A & B)",
    classes: ["Class IX-A", "Class IX-B", "Class X-A", "Class X-B"]
  }
];

function matchClass(studentGrade: string, filterClass: string): boolean {
  if (!filterClass || filterClass === "ALL") return true;
  const sg = (studentGrade || "").trim().toUpperCase();
  const fc = filterClass.trim().toUpperCase();
  if (sg === fc) return true;
  const cleanSg = sg.replace(/^CLASS\s+/i, "");
  const cleanFc = fc.replace(/^CLASS\s+/i, "");
  return cleanSg === cleanFc;
}

interface StudentsTabProps {
  students: Student[];
  studentSearch: string;
  onChangeSearch: (val: string) => void;
  onAddStudent: (student: Omit<Student, "id" | "enrollmentDate">) => Promise<boolean | void> | boolean | void;
  onDeleteStudent: (id: string) => void;
  onRestoreStudent: (id: string) => void;
  onImportCSV: (file: File, targetClass?: string) => void;
  onExportCSV: () => void;
  isImporting?: boolean;
  formErrors: Record<string, string>;
  clearFormErrors: () => void;
}

export function StudentsTab({
  students,
  studentSearch,
  onChangeSearch,
  onAddStudent,
  onDeleteStudent,
  onRestoreStudent,
  onImportCSV,
  onExportCSV,
  isImporting = false,
  formErrors,
  clearFormErrors,
}: StudentsTabProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [viewArchive, setViewArchive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showPurgeConfirmModal, setShowPurgeConfirmModal] = useState(false);
  const [isPurgingStudents, setIsPurgingStudents] = useState(false);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>("ALL");
  const [showClassGridModal, setShowClassGridModal] = useState<boolean>(false);
  const itemsPerPage = 8;

  const classCounts = useMemo(() => {
    const map: Record<string, number> = { ALL: students.filter(s => !s.deletedAt).length };
    CLASSES_LIST.forEach(cls => {
      map[cls] = students.filter(s => !s.deletedAt && matchClass(s.grade, cls)).length;
    });
    return map;
  }, [students]);

  const handleToggleSelectAll = () => {
    if (selectedStudentIds.length === displayedList.length && displayedList.length > 0) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(displayedList.map(s => s.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handlePurgeStudents = async () => {
    setIsPurgingStudents(true);
    let res;
    if (selectedStudentIds.length > 0) {
      res = await bulkPurgeStudents(selectedStudentIds);
    } else {
      res = await purgeAllStudents();
    }

    setIsPurgingStudents(false);
    setShowPurgeConfirmModal(false);

    if (res.success) {
      const countStr = selectedStudentIds.length > 0 ? `${selectedStudentIds.length} selected student(s)` : "All student and parent";
      setToast({
        id: Date.now().toString(),
        type: "success",
        title: "Student Database Purged",
        message: `${countStr} records have been deleted.`
      });
      setSelectedStudentIds([]);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Purge Failed",
        message: res.error || "Failed to purge student records."
      });
    }
  };

  const handleResendParentLink = async (email: string) => {
    setResendingEmail(email);
    const res = await resendPasswordLink(email);
    setResendingEmail(null);
    if (res.success) {
      setToast({
        id: Date.now().toString(),
        type: "success",
        title: "Parent Setup Link Sent",
        message: `Password setup link successfully emailed to parent (${email}).`
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

  // New Student State
  const [newStudent, setNewStudent] = useState<Omit<Student, "id" | "enrollmentDate">>({
    name: "",
    grade: "Class I-A",
    rollNo: "",
    parent: "",
    parentEmail: "",
    status: StudentStatus.Active,
  });

  const activeStudents = useMemo(() => {
    return students.filter((s) => 
      !s.deletedAt && 
      matchClass(s.grade, selectedClassFilter) &&
      s.name.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [students, selectedClassFilter, studentSearch]);

  const archivedStudents = useMemo(() => {
    return students.filter((s) => 
      s.deletedAt && 
      matchClass(s.grade, selectedClassFilter) &&
      s.name.toLowerCase().includes(studentSearch.toLowerCase())
    );
  }, [students, selectedClassFilter, studentSearch]);

  const displayedList = viewArchive ? archivedStudents : activeStudents;

  // Paginated List
  const totalPages = Math.max(1, Math.ceil(displayedList.length / itemsPerPage));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return displayedList.slice(start, start + itemsPerPage);
  }, [displayedList, currentPage]);

  const [activeClassWindow, setActiveClassWindow] = useState<string | null>(null);

  const handleOpenModal = (defaultGrade?: string) => {
    clearFormErrors();
    const prefilledGrade = defaultGrade || activeClassWindow || (selectedClassFilter !== "ALL" ? selectedClassFilter : "Class I-A");
    setNewStudent({
      name: "",
      grade: prefilledGrade,
      rollNo: "",
      parent: "",
      parentEmail: "",
      status: StudentStatus.Active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onAddStudent(newStudent);
    if (success) {
      setShowModal(false);
      setNewStudent({
        name: "",
        grade: activeClassWindow || (selectedClassFilter !== "ALL" ? selectedClassFilter : "Class I-A"),
        rollNo: "",
        parent: "",
        parentEmail: "",
        status: StudentStatus.Active
      });
    }
  };

  const handleCSVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportCSV(e.target.files[0], activeClassWindow || undefined);
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
          <div>
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <School className="text-emerald-600" size={22} />
              {viewArchive ? "Archived Student Records" : "Student Class Hub (Nursery to Class X)"}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {viewArchive 
                ? "Review and restore soft-deleted profiles" 
                : "Select any class below to open its dedicated registration, import, export, and purge window"}
            </p>
          </div>
          
          <div className="flex gap-2.5 w-full sm:w-auto flex-wrap">
            <button
              onClick={() => {
                setViewArchive(!viewArchive);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                viewArchive
                  ? "bg-accent/10 border-accent/20 text-emerald-700"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
              }`}
            >
              {viewArchive ? "Back to Class Hub" : "View Archives"}
            </button>

            {!viewArchive && (
              <>
                <label className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isImporting 
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 pointer-events-none" 
                    : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                }`}>
                  {isImporting ? <Loader2 size={14} className="animate-spin text-emerald-600" /> : <FileSpreadsheet size={14} />} 
                  {isImporting ? "Importing CSV..." : "Global Import CSV"}
                  <input type="file" accept=".csv" onChange={handleCSVChange} disabled={isImporting} className="hidden" />
                </label>
                <button
                  onClick={onExportCSV}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
                >
                  <Download size={14} /> Global Export CSV
                </button>
                <button
                  onClick={() => setShowPurgeConfirmModal(true)}
                  className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm ${
                    selectedStudentIds.length > 0
                      ? "bg-rose-600 border-rose-600 text-white hover:bg-rose-700 animate-in fade-in zoom-in-95"
                      : "bg-rose-50 border-rose-200 hover:bg-rose-100 text-rose-700"
                  }`}
                >
                  <Trash2 size={14} />
                  {selectedStudentIds.length > 0 ? `Purge Selected (${selectedStudentIds.length})` : "Purge Database"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* CLASS HUB GRID (Grouped by Grade Levels) */}
      {!viewArchive && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <Grid size={18} className="text-emerald-600" /> Class Directories (Nursery to Class X)
            </h4>
            <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Total Enrolled: {classCounts.ALL} Students
            </span>
          </div>

          <div className="space-y-6">
            {GRADE_GROUPS.map((group) => (
              <div key={group.title} className="bg-slate-50/50 p-5 rounded-3xl border border-slate-200/80 space-y-3">
                <div className="flex justify-between items-baseline">
                  <h5 className="font-extrabold text-slate-800 text-sm">{group.title}</h5>
                  <span className="text-[11px] font-semibold text-slate-400">{group.subtitle}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {group.classes.map((cls) => {
                    const count = classCounts[cls] || 0;
                    return (
                      <div
                        key={cls}
                        onClick={() => {
                          setActiveClassWindow(cls);
                          setSelectedClassFilter(cls);
                          setCurrentPage(1);
                        }}
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
      )}

      {/* DEDICATED CLASS MANAGEMENT WINDOW MODAL */}
      {mounted && activeClassWindow && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Window Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-inner">
                  <School size={26} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-slate-900">{activeClassWindow} Window</h3>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {classCounts[activeClassWindow] || 0} Students Enrolled
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Dedicated management window to add, import CSV, export CSV, and purge students for {activeClassWindow}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveClassWindow(null)}
                  className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors font-bold text-lg cursor-pointer"
                >
                  &times;
                </button>
              </div>
            </div>

            {/* Class Window Control Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleOpenModal(activeClassWindow)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <UserPlus size={14} /> Add Student to {activeClassWindow}
                </button>

                <label className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isImporting 
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 pointer-events-none" 
                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-700 shadow-2xs"
                }`}>
                  {isImporting ? <Loader2 size={14} className="animate-spin text-emerald-600" /> : <FileSpreadsheet size={14} />} 
                  {isImporting ? "Importing CSV..." : `Import ${activeClassWindow} CSV`}
                  <input type="file" accept=".csv" onChange={handleCSVChange} disabled={isImporting} className="hidden" />
                </label>

                <button
                  onClick={onExportCSV}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all shadow-2xs"
                >
                  <Download size={14} /> Export {activeClassWindow} CSV
                </button>
              </div>

              <button
                onClick={() => setShowPurgeConfirmModal(true)}
                className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm ${
                  selectedStudentIds.length > 0
                    ? "bg-rose-600 border-rose-600 text-white hover:bg-rose-700 animate-in fade-in zoom-in-95"
                    : "bg-rose-50 border-rose-200 hover:bg-rose-100 text-rose-700"
                }`}
              >
                <Trash2 size={14} />
                {selectedStudentIds.length > 0 ? `Purge Selected (${selectedStudentIds.length})` : `Purge ${activeClassWindow}`}
              </button>
            </div>

            {/* Class Window Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder={`Search students in ${activeClassWindow}...`}
                value={studentSearch}
                onChange={(e) => {
                  onChangeSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Class Student Roster Directory Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              {paginatedList.length === 0 ? (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <p className="text-sm font-bold text-slate-600">No student records found in {activeClassWindow}</p>
                  <p className="text-xs">Use "+ Add Student to {activeClassWindow}" above to register student A or B into this class.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[600px] text-left">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="px-4 py-3.5 text-center w-12">
                          <input
                            type="checkbox"
                            checked={selectedStudentIds.length === displayedList.length && displayedList.length > 0}
                            onChange={handleToggleSelectAll}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                          />
                        </th>
                        <th className="px-4 py-3.5 text-center w-16">Roll</th>
                        <th className="px-4 py-3.5">Student Name</th>
                        <th className="px-4 py-3.5">Class/Grade</th>
                        <th className="px-4 py-3.5">Parent Name</th>
                        <th className="px-4 py-3.5 text-center">Status</th>
                        <th className="px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedList.map((s) => (
                        <tr key={s.id} className={`hover:bg-slate-50/50 transition-colors ${selectedStudentIds.includes(s.id) ? "bg-rose-50/40" : ""}`}>
                          <td className="px-4 py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={selectedStudentIds.includes(s.id)}
                              onChange={() => handleToggleSelect(s.id)}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                            />
                          </td>
                          <td className="px-4 py-3.5 text-center font-extrabold text-slate-400 text-xs">
                            {s.rollNo}
                          </td>
                          <td className="px-4 py-3.5 font-bold text-slate-800">{s.name}</td>
                          <td className="px-4 py-3.5 text-xs text-emerald-700 font-bold bg-emerald-50/50 px-2 py-1 rounded-lg w-max border border-emerald-200/50">
                            {s.grade}
                          </td>
                          <td className="px-4 py-3.5 text-xs text-slate-700 font-medium">
                            <div>{s.parent}</div>
                            {s.parentEmail && (
                              <div className="text-[11px] text-slate-400 font-mono font-normal mt-0.5">{s.parentEmail}</div>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg ${
                                s.status === StudentStatus.Active
                                  ? "bg-green-50 text-green-600 border border-green-100"
                                  : "bg-amber-50 text-amber-600 border border-amber-100"
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {s.parentEmail && (
                                <button
                                  onClick={() => handleResendParentLink(s.parentEmail!)}
                                  disabled={resendingEmail === s.parentEmail}
                                  title="Resend Parent Setup Email"
                                  className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-700 font-bold text-xs bg-slate-100 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                                >
                                  {resendingEmail === s.parentEmail ? (
                                    <Loader2 size={12} className="animate-spin text-emerald-600" />
                                  ) : (
                                    <Mail size={12} className="text-slate-500" />
                                  )}
                                  <span>{resendingEmail === s.parentEmail ? "Sending..." : "Invite"}</span>
                                </button>
                              )}
                              {s.deletedAt ? (
                                <button
                                  onClick={() => onRestoreStudent(s.id)}
                                  className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold p-1 bg-emerald-50 rounded-lg border border-emerald-200"
                                  title="Restore Student Profile"
                                >
                                  <RotateCcw size={14} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => onDeleteStudent(s.id)}
                                  className="text-xs text-rose-500 hover:text-rose-700 font-semibold p-1 bg-rose-50 rounded-lg border border-rose-100"
                                  title="Archive Student Profile"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination for Class Window Table */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center pt-2 text-xs font-semibold text-slate-500">
                <span>
                  Page {currentPage} of {totalPages} ({displayedList.length} Total Records in {activeClassWindow})
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Directory Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        {paginatedList.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No matching student logs found.</p>
        ) : (
          <>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">
                    <th className="px-3 py-3 text-center w-10">
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.length === displayedList.length && displayedList.length > 0}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3 text-center w-16">Roll</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Class/Grade</th>
                    <th className="px-4 py-3">Parent Name</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedList.map((s) => (
                    <tr key={s.id} className={`hover:bg-slate-50/50 ${selectedStudentIds.includes(s.id) ? "bg-rose-50/40" : ""}`}>
                      <td className="px-3 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(s.id)}
                          onChange={() => handleToggleSelect(s.id)}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3.5 text-center font-extrabold text-slate-400 text-xs">
                        {s.rollNo}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-700">{s.name}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 font-semibold">{s.grade}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-700 font-medium">
                        <div>{s.parent}</div>
                        {s.parentEmail && (
                          <div className="text-[11px] text-slate-400 font-mono font-normal mt-0.5">{s.parentEmail}</div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg ${
                            s.status === StudentStatus.Active
                              ? "bg-green-50 text-green-600"
                              : s.status === StudentStatus.Suspended
                              ? "bg-rose-50 text-rose-500 animate-pulse"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!viewArchive && s.parentEmail && (
                            <button
                              onClick={() => handleResendParentLink(s.parentEmail!)}
                              disabled={resendingEmail === s.parentEmail}
                              title="Resend Password Setup Email to Parent"
                              className="inline-flex items-center gap-1.5 text-slate-700 hover:text-emerald-700 font-bold text-xs bg-slate-100 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 px-2.5 py-1 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
                            >
                              {resendingEmail === s.parentEmail ? (
                                <Loader2 size={12} className="animate-spin text-emerald-600" />
                              ) : (
                                <Mail size={12} className="text-emerald-600" />
                              )}
                              {resendingEmail === s.parentEmail ? "Sending..." : "Resend Link"}
                            </button>
                          )}
                          {viewArchive ? (
                            <button
                              onClick={() => onRestoreStudent(s.id)}
                              className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 justify-end cursor-pointer"
                            >
                              <RotateCcw size={12} /> Restore
                            </button>
                          ) : (
                            <button
                              onClick={() => onDeleteStudent(s.id)}
                              className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1 justify-end cursor-pointer"
                            >
                              <Trash2 size={12} /> Archive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-500">
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Student Modal */}
      {mounted && showModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden p-6 border border-slate-100">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-800 text-sm">Enroll New Student</h4>
              <button
                onClick={() => setShowModal(false)}
                className="text-xl hover:text-red-500 font-bold transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                id="stu-name"
                label="Student Name"
                placeholder="Full Name"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                error={formErrors.name}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="stu-grade" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Grade Class
                  </label>
                  {activeClassWindow ? (
                    <div className="w-full px-3 py-2 border border-emerald-200 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
                      <span>{newStudent.grade}</span>
                      <span className="text-[9px] bg-emerald-200/70 text-emerald-900 px-1.5 py-0.5 rounded font-extrabold uppercase">Fixed</span>
                    </div>
                  ) : (
                    <select
                      id="stu-grade"
                      value={newStudent.grade}
                      onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded-xl text-xs bg-slate-50 focus:outline-none font-semibold text-slate-800 cursor-pointer"
                    >
                      {CLASSES_LIST.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <FormInput
                  id="stu-roll"
                  label="Roll Number"
                  placeholder="01"
                  value={newStudent.rollNo}
                  onChange={(e) => setNewStudent({ ...newStudent, rollNo: e.target.value })}
                  error={formErrors.rollNo}
                  required
                />
              </div>

              <FormInput
                id="stu-parent"
                label="Parent / Guardian Name"
                placeholder="Parent Full Name"
                value={newStudent.parent}
                onChange={(e) => setNewStudent({ ...newStudent, parent: e.target.value })}
                error={formErrors.parent}
                required
              />

              <FormInput
                id="stu-parent-email"
                label="Parent Email Address"
                placeholder="parent@example.com"
                value={newStudent.parentEmail || ""}
                onChange={(e) => setNewStudent({ ...newStudent, parentEmail: e.target.value })}
                error={formErrors.parentEmail}
                required
              />

              <button
                type="submit"
                className="w-full py-2.5 bg-primary hover:bg-primary-light text-white font-bold rounded-xl text-xs shadow-md transition-all mt-4 cursor-pointer"
              >
                Register Student in {newStudent.grade}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* CLASS REGISTRATION WINDOW MODAL (Nursery to Class X) */}
      {mounted && showClassGridModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Grid size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Class Registration Window</h3>
                  <p className="text-xs text-slate-500 font-medium">Select any class from Nursery to Class X to view or register students</p>
                </div>
              </div>
              <button
                onClick={() => setShowClassGridModal(false)}
                className="w-9 h-9 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-2">
              {CLASSES_LIST.map((cls) => {
                const count = classCounts[cls] || 0;
                return (
                  <div
                    key={cls}
                    className="bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 p-4 rounded-2xl transition-all space-y-3 flex flex-col justify-between group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-extrabold text-slate-800 text-sm group-hover:text-emerald-700">{cls}</div>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs">
                        {count} Enrolled
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 pt-2 border-t border-slate-200/60">
                      <button
                        onClick={() => {
                          setSelectedClassFilter(cls);
                          setCurrentPage(1);
                          setShowClassGridModal(false);
                        }}
                        className="w-full py-1.5 px-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Layers size={12} className="text-slate-400" /> View Roster
                      </button>
                      <button
                        onClick={() => {
                          setSelectedClassFilter(cls);
                          setShowClassGridModal(false);
                          handleOpenModal(cls);
                        }}
                        className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <UserPlus size={12} /> + Register Student
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowClassGridModal(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close Window
              </button>
            </div>
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
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Importing Student CSV...</h3>
              <p className="text-xs font-semibold text-emerald-700 bg-emerald-50 py-1.5 px-3 rounded-full inline-block border border-emerald-200/60">
                Processing student records...
              </p>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Parsing rows, creating student profiles, linking parents, and dispatching invitation emails.
              </p>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* CONFIRM PURGE STUDENTS MODAL */}
      {mounted && showPurgeConfirmModal && createPortal(
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[99999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Purge Student & Parent Database</h3>
                <p className="text-xs text-rose-600 font-semibold">Irreversible Action</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              {selectedStudentIds.length > 0 ? (
                <>
                  Are you sure you want to <strong>delete the {selectedStudentIds.length} selected student(s)</strong> and all associated grades, attendance, and fee records?
                </>
              ) : (
                <>
                  Are you sure you want to <strong>delete ALL students, parent links, grades, attendance, and fee records</strong> from the database?
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
                disabled={isPurgingStudents}
                onClick={handlePurgeStudents}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-rose-600/25 cursor-pointer flex items-center gap-2 disabled:opacity-60"
              >
                {isPurgingStudents ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {isPurgingStudents 
                  ? "Purging..." 
                  : selectedStudentIds.length > 0 
                  ? `Purge Selected (${selectedStudentIds.length})` 
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
