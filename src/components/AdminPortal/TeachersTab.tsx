import { useState, useEffect } from "react";
import { Plus, Search, Check, X, Shield, BookOpen, FileSpreadsheet, Download, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { inviteUser } from "@/app/actions/auth";
import { ToastNotification, ToastMessage } from "@/components/ui/ToastNotification";

export function TeachersTab() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  // Add Teacher Form
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newClassId, setNewClassId] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assign Class Form
  const [assignClassId, setAssignClassId] = useState("");
  const [assignSubject, setAssignSubject] = useState("");

  const fetchTeachers = async () => {
    setLoading(true);
    const { data: teachersData, error } = await supabase
      .from("teachers")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (teachersData) {
      const { data: assignmentsData } = await supabase
        .from("teacher_assignments")
        .select("*");
      
      const enrichedTeachers = teachersData.map((t) => ({
        ...t,
        assignments: assignmentsData?.filter((a) => a.teacher_id === t.id) || [],
      }));
      setTeachers(enrichedTeachers);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleAddTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const res = await inviteUser(newEmail, "teacher", undefined, newName, newPhone);

    if (res.success) {
      if (newClassId && newSubject) {
        // Fetch teacher ID
        const { data: teacherProfile } = await supabase
          .from("teachers")
          .select("id")
          .eq("email", newEmail)
          .single();

        if (teacherProfile?.id) {
          await supabase.from("teacher_assignments").insert({
            teacher_id: teacherProfile.id,
            class_id: newClassId,
            subject: newSubject
          });
        }
      }

      setIsSubmitting(false);
      setShowAddModal(false);
      setToast({
        id: Date.now().toString(),
        type: "success",
        title: "Teacher Invited Successfully",
        message: `Invitation email sent to ${newEmail}. Assigned ${newClassId || 'class'}`
      });
      setNewName("");
      setNewEmail("");
      setNewPhone("");
      setNewClassId("");
      setNewSubject("");
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

  const handleImportTeachersCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    setIsImporting(true);

    try {
      const text = await file.text();
      const rawRows = text.split(/\r?\n/).map((r) => r.trim()).filter((r) => r.length > 0);
      let successCount = 0;

      // Check if first row is header
      const startIdx = (rawRows.length > 0 && /name|email|class|subject|phone/i.test(rawRows[0])) ? 1 : 0;
      const rows = rawRows.slice(startIdx);

      for (const row of rows) {
        const cols = row.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ''));
        
        // Find email column
        const emailIdx = cols.findIndex((c) => /^\S+@\S+\.\S+$/.test(c));
        if (emailIdx !== -1) {
          const email = cols[emailIdx];
          const name = emailIdx > 0 ? cols[0] : (cols[1] || email.split("@")[0]);
          const phone = cols.find((c, i) => i !== emailIdx && i !== 0 && /^[\+\d\s\-()]{7,}$/.test(c)) || "";
          const assignedClass = cols.find((c) => /^[A-Z0-9]{1,4}(-[A-Z0-9]{1,4})?$/i.test(c) && c !== name) || cols[3] || "";
          const assignedSubject = cols.find((c, i) => i > 2 && c !== assignedClass && c !== email && c !== phone) || cols[4] || "";

          const res = await inviteUser(email, "teacher", undefined, name, phone);
          if (res.success) {
            successCount++;
            if (assignedClass && assignedSubject) {
              const { data: teacherProfile } = await supabase
                .from("teachers")
                .select("id")
                .eq("email", email)
                .single();

              if (teacherProfile?.id) {
                // Remove any existing assignment for same class/subject to prevent duplicate
                await supabase.from("teacher_assignments").delete().eq("teacher_id", teacherProfile.id).eq("class_id", assignedClass);
                await supabase.from("teacher_assignments").insert({
                  teacher_id: teacherProfile.id,
                  class_id: assignedClass,
                  subject: assignedSubject
                });
              }
            }
          }
        }
      }

      setToast({
        id: Date.now().toString(),
        type: "success",
        title: "CSV Import Successful",
        message: `Registered ${successCount} teacher(s) and dispatched invitation emails.`
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

  const handleAssignClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    const { error } = await supabase.from("teacher_assignments").insert({
      teacher_id: selectedTeacher.id,
      class_id: assignClassId,
      subject: assignSubject,
    });

    if (error) {
      setToast({
        id: Date.now().toString(),
        type: "error",
        title: "Assignment Failed",
        message: error.message
      });
    } else {
      setShowAssignModal(false);
      setToast({
        id: Date.now().toString(),
        type: "success",
        title: "Class Assigned",
        message: `Successfully assigned ${assignClassId} (${assignSubject}) to ${selectedTeacher.name}.`
      });
      setAssignClassId("");
      setAssignSubject("");
      fetchTeachers();
    }
  };

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Teachers Directory</h2>
          <p className="text-sm text-slate-500">Manage teachers and their class assignments</p>
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
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            Add New Teacher
          </button>
        </div>
      </div>

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
              You haven't added any teachers yet or none match your search.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assignments</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTeachers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
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
                    <div className="flex flex-wrap gap-2">
                      {t.assignments?.map((a: any) => (
                        <span key={a.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent">
                          <BookOpen size={10} />
                          {a.class_id} - {a.subject}
                        </span>
                      ))}
                      {t.assignments?.length === 0 && (
                        <span className="text-slate-400 text-xs italic">No classes assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedTeacher(t);
                        setShowAssignModal(true);
                      }}
                      className="text-primary hover:text-accent font-medium text-xs bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Assign Class
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ADD TEACHER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">Add New Teacher</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddTeacher} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-accent text-sm"
                  placeholder="e.g. Mr. John Doe"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-accent text-sm"
                  placeholder="teacher@school.com"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                <input
                  type="text"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-accent text-sm"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assign Class</label>
                  <input
                    type="text"
                    value={newClassId}
                    onChange={(e) => setNewClassId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-accent text-sm"
                    placeholder="e.g. IX-A"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assign Subject</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-accent text-sm"
                    placeholder="e.g. Science"
                  />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Invite"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN CLASS MODAL */}
      {showAssignModal && selectedTeacher && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Assign Class</h3>
                <p className="text-xs text-slate-500">For {selectedTeacher.name}</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAssignClass} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Class / Section</label>
                <input
                  type="text"
                  required
                  value={assignClassId}
                  onChange={(e) => setAssignClassId(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-accent text-sm"
                  placeholder="e.g. IX-A"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Subject</label>
                <input
                  type="text"
                  required
                  value={assignSubject}
                  onChange={(e) => setAssignSubject(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-accent text-sm"
                  placeholder="e.g. Mathematics"
                />
              </div>
              
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-bold hover:bg-slate-800 transition-colors"
                >
                  Save Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
