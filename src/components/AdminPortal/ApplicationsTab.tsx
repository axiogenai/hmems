import React, { useState, useMemo } from "react";
import { Search, ChevronDown, Check, X, Filter, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Application, ApplicationStatus } from "@/types/admin";

interface ApplicationsTabProps {
  applications: Application[];
  onStatusChange: (id: string, newStatus: ApplicationStatus, notes?: string) => void;
  onBulkApprove: (ids: string[]) => void;
}

export function ApplicationsTab({
  applications,
  onStatusChange,
  onBulkApprove,
}: ApplicationsTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [gradeFilter, setGradeFilter] = useState<string>("All");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewingApp, setViewingApp] = useState<Application | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filters
  const filteredList = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch = app.name.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || app.status === statusFilter;
      const matchGrade = gradeFilter === "All" || app.grade === gradeFilter;
      return matchSearch && matchStatus && matchGrade;
    });
  }, [applications, search, statusFilter, gradeFilter]);

  // Paginated List
  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedList.map((app) => app.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    }
  };

  const handleBulkAction = () => {
    if (selectedIds.length === 0) return;
    onBulkApprove(selectedIds);
    setSelectedIds([]);
  };

  const getStatusColor = (status: Application["status"]) => {
    switch (status) {
      case "Approved":
        return "bg-green-50 text-green-600 border-green-100";
      case "Pending":
        return "bg-accent/10 text-emerald-600 border-emerald-100";
      case "Under Review":
        return "bg-blue-50 text-blue-600 border-blue-100";
      default:
        return "bg-rose-50 text-rose-600 border-rose-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Admissions Registry & Inquiries</h3>
            <p className="text-xs text-slate-400 mt-0.5">Filter, review registration details, and approve admissions</p>
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkAction}
              className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 hover:shadow-lg transition-all cursor-pointer"
            >
              Bulk Approve Selected ({selectedIds.length})
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              {Object.values(ApplicationStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={gradeFilter}
              onChange={(e) => {
                setGradeFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none"
            >
              <option value="All">All Grades</option>
              {["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Database Registry List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        {paginatedList.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No matching inquiry logs found.</p>
        ) : (
          <>
            <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-sm min-w-[650px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider text-left">
                    <th className="px-4 py-3 text-center w-12">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={selectedIds.length === paginatedList.length}
                        className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                      />
                    </th>
                    <th className="px-4 py-3">Applicant Name</th>
                    <th className="px-4 py-3">Grade Class</th>
                    <th className="px-4 py-3">Inquiry Date</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedList.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(app.id)}
                          onChange={(e) => handleSelectOne(app.id, e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-700">{app.name}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 font-semibold">{app.grade}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-400 font-semibold">{app.date}</td>
                      <td className="px-4 py-3.5 text-center">
                        <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-lg border ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right flex justify-end gap-2">
                        <button
                          onClick={() => setViewingApp(app)}
                          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-lg cursor-pointer border border-slate-200"
                          title="View Details"
                        >
                          <FileText size={13} />
                        </button>
                        {app.status === ApplicationStatus.Pending && (
                          <>
                            <button
                              onClick={() => onStatusChange(app.id, ApplicationStatus.Approved)}
                              className="w-7 h-7 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center cursor-pointer shadow-sm"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => onStatusChange(app.id, ApplicationStatus.Rejected)}
                              className="w-7 h-7 bg-rose-500 hover:bg-rose-600 text-white rounded-lg flex items-center justify-center cursor-pointer shadow-sm"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
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

      {/* Application Details Modal */}
      {viewingApp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden p-6 border border-slate-100">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <h4 className="font-bold text-slate-800 text-sm">Registration Inquiry Details</h4>
              <button
                onClick={() => setViewingApp(null)}
                className="text-xl hover:text-red-500 font-bold transition-colors cursor-pointer"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-2">
                <span className="font-bold text-slate-400 uppercase tracking-wide">Applicant Name</span>
                <span className="font-semibold text-slate-800">{viewingApp.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-2">
                <span className="font-bold text-slate-400 uppercase tracking-wide">Grade Level Requested</span>
                <span className="font-semibold text-slate-800">{viewingApp.grade}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-2">
                <span className="font-bold text-slate-400 uppercase tracking-wide">Helpline Contact Email</span>
                <span className="font-semibold text-slate-800">{viewingApp.email}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-2">
                <span className="font-bold text-slate-400 uppercase tracking-wide">Parent Contact Phone</span>
                <span className="font-semibold text-slate-800">{viewingApp.phone}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 border-b border-slate-50 pb-2">
                <span className="font-bold text-slate-400 uppercase tracking-wide">Status Flag</span>
                <span className={`inline-block font-extrabold text-[9px] px-2 py-0.5 rounded border border-transparent self-start ${
                  viewingApp.status === "Approved" ? "bg-green-50 text-green-600" : viewingApp.status === "Pending" ? "bg-accent/10 text-emerald-600" : "bg-red-50 text-red-500"
                }`}>
                  {viewingApp.status}
                </span>
              </div>
            </div>

            {viewingApp.status === ApplicationStatus.Pending && (
              <div className="flex gap-2.5 mt-6">
                <button
                  onClick={() => {
                    onStatusChange(viewingApp.id, ApplicationStatus.Approved);
                    setViewingApp(null);
                  }}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm flex items-center justify-center gap-1"
                >
                  <Check size={14} /> Approve Inquiry
                </button>
                <button
                  onClick={() => {
                    onStatusChange(viewingApp.id, ApplicationStatus.Rejected);
                    setViewingApp(null);
                  }}
                  className="flex-1 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm flex items-center justify-center gap-1"
                >
                  <X size={14} /> Reject Inquiry
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
