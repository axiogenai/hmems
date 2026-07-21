import React, { useState, useMemo } from "react";
import { Search, Plus, Trash2, RotateCcw, FileSpreadsheet, Download, ChevronLeft, ChevronRight, Loader2, Mail } from "lucide-react";
import { Student, StudentStatus } from "@/types/admin";
import { FormInput } from "@/components/TeacherPortal/FormInput";
import { resendPasswordLink, purgeAllStudents } from "@/app/actions/auth";
import { ToastNotification, ToastMessage } from "@/components/ui/ToastNotification";

interface StudentsTabProps {
  students: Student[];
  studentSearch: string;
  onChangeSearch: (val: string) => void;
  onAddStudent: (student: Omit<Student, "id" | "enrollmentDate">) => Promise<boolean | void> | boolean | void;
  onDeleteStudent: (id: string) => void;
  onRestoreStudent: (id: string) => void;
  onImportCSV: (file: File) => void;
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
  const [showModal, setShowModal] = useState(false);
  const [viewArchive, setViewArchive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showPurgeConfirmModal, setShowPurgeConfirmModal] = useState(false);
  const [isPurgingStudents, setIsPurgingStudents] = useState(false);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const itemsPerPage = 8;

  const handlePurgeStudents = async () => {
    setIsPurgingStudents(true);
    const res = await purgeAllStudents();
    setIsPurgingStudents(false);
    setShowPurgeConfirmModal(false);

    if (res.success) {
      setToast({
        id: Date.now().toString(),
        type: "success",
        title: "Student Database Purged",
        message: "All student and parent records have been deleted."
      });
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
    grade: "Class I",
    rollNo: "",
    parent: "",
    parentEmail: "",
    status: StudentStatus.Active,
  });

  const activeStudents = useMemo(() => {
    return students.filter((s) => !s.deletedAt && s.name.toLowerCase().includes(studentSearch.toLowerCase()));
  }, [students, studentSearch]);

  const archivedStudents = useMemo(() => {
    return students.filter((s) => s.deletedAt && s.name.toLowerCase().includes(studentSearch.toLowerCase()));
  }, [students, studentSearch]);

  const displayedList = viewArchive ? archivedStudents : activeStudents;

  // Paginated List
  const totalPages = Math.max(1, Math.ceil(displayedList.length / itemsPerPage));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return displayedList.slice(start, start + itemsPerPage);
  }, [displayedList, currentPage]);

  const handleOpenModal = () => {
    clearFormErrors();
    setNewStudent({
      name: "",
      grade: "Class I",
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
      setNewStudent({ name: "", grade: "Class I", rollNo: "", parent: "", parentEmail: "", status: StudentStatus.Active });
    }
  };

  const handleCSVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportCSV(e.target.files[0]);
    }
    e.target.value = "";
  };

  return (
    <div className="space-y-6">
      {/* Search & Actions Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              {viewArchive ? "Archived Student Records" : "Student Directory Database"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {viewArchive ? "Review and restore soft-deleted profiles" : "Search, register, and archive students"}
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
              {viewArchive ? "Back to Directory" : "View Archives"}
            </button>
            {!viewArchive && (
              <>
                <label className={`flex items-center gap-1.5 px-4 py-2 border text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  isImporting 
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 pointer-events-none" 
                    : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700"
                }`}>
                  {isImporting ? <Loader2 size={14} className="animate-spin text-emerald-600" /> : <FileSpreadsheet size={14} />} 
                  {isImporting ? "Importing CSV..." : "Import CSV"}
                  <input type="file" accept=".csv" onChange={handleCSVChange} disabled={isImporting} className="hidden" />
                </label>
                <button
                  onClick={onExportCSV}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-all"
                >
                  <Download size={14} /> Export CSV
                </button>
                <button
                  onClick={() => setShowPurgeConfirmModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm"
                >
                  <Trash2 size={14} /> Purge Database
                </button>
                <button
                  onClick={handleOpenModal}
                  className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-light text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Plus size={14} /> Add Student
                </button>
              </>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="relative mt-5">
          <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search student by name..."
            value={studentSearch}
            onChange={(e) => {
              onChangeSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-2xl text-xs bg-slate-50 focus:outline-none focus:ring-1 focus:ring-accent/30 focus:border-accent"
          />
        </div>
      </div>

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
                    <tr key={s.id} className="hover:bg-slate-50/50">
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
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
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
                  <select
                    id="stu-grade"
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-xl text-xs bg-slate-50 focus:outline-none"
                  >
                    {["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)].map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
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
                Register Student Profile
              </button>
            </form>
          </div>
        </div>
      )}
      {/* FULL-SCREEN CSV IMPORT ANIMATED LOADING MODAL */}
      {isImporting && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[99999] flex items-center justify-center p-4">
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
        </div>
      )}
      {/* CONFIRM PURGE STUDENTS MODAL */}
      {showPurgeConfirmModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-[999] flex items-center justify-center p-4">
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
              Are you sure you want to <strong>delete ALL students, parent links, grades, attendance, and fee records</strong> from the database? This action will empty the student directory completely in one click.
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
                {isPurgingStudents ? "Purging..." : "Yes, Empty Student Database"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
