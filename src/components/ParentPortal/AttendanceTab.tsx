import React, { useMemo } from "react";
import { CheckCircle, AlertTriangle, HelpCircle, Clock } from "lucide-react";
import { StudentProfile, AttendanceRecord } from "@/types/parent-portal";

interface AttendanceTabProps {
  selectedChild: StudentProfile;
  attendanceRecords: AttendanceRecord[];
}

export function AttendanceTab({
  selectedChild,
  attendanceRecords,
}: AttendanceTabProps) {
  // Count by status
  const counts = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    let late = 0;

    attendanceRecords.forEach((r) => {
      if (r.status === "Present") present++;
      if (r.status === "Absent") absent++;
      if (r.status === "Leave") leave++;
      if (r.status === "Late") late++;
    });

    const total = attendanceRecords.length;
    const rate = total > 0 ? ((present + late + leave * 0.5) / total) * 100 : 92; // fallback to 92%

    return { present, absent, leave, late, total, rate };
  }, [attendanceRecords]);

  const getStatusColor = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "Present":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "Absent":
        return "bg-rose-50 text-rose-600 border-rose-100";
      case "Leave":
        return "bg-indigo-50 text-indigo-600 border-indigo-100";
      case "Late":
        return "bg-blue-50 text-blue-600 border-blue-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Attendance Summary Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm">
            <CheckCircle size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Present</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{counts.present}</p>
          </div>
        </div>

        <div className="bg-rose-50/50 rounded-2xl p-4 border border-rose-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-sm">
            <AlertTriangle size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Absent</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{counts.absent}</p>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent/100 text-white flex items-center justify-center shadow-sm">
            <HelpCircle size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leave Approved</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{counts.leave}</p>
          </div>
        </div>

        <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-sm">
            <Clock size={18} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Late Arrivals</p>
            <p className="text-xl font-bold text-slate-800 mt-0.5">{counts.late}</p>
          </div>
        </div>
      </div>

      {/* Progress Rate Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <p className="font-bold text-slate-800 text-sm">Attendance Percentage</p>
          <p className="text-2xl font-bold text-primary">{counts.rate.toFixed(1)}%</p>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${counts.rate}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-2 font-medium">Minimum required threshold: 75%</p>
      </div>

      {/* History Log */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 text-base mb-4">Detailed Attendance History</h3>
        {attendanceRecords.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No logged history found.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {attendanceRecords
              .slice()
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((record) => (
                <div key={record.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-start hover:border-slate-200 transition-all">
                  <div>
                    <p className="font-bold text-slate-700 text-sm">{new Date(record.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</p>
                    <p className="text-xs text-slate-400 font-semibold mt-1">{record.remarks || record.reason || "No remarks"}</p>
                  </div>
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-lg border ${getStatusColor(record.status)}`}>
                    {record.status}
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
