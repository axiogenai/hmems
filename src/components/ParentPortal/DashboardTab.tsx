import React from "react";
import { BookOpen, CheckCircle, CreditCard, Bell, CalendarDays, Award, MessageSquare } from "lucide-react";
import { StudentProfile } from "@/types/parent-portal";

interface Activity {
  id: string;
  type: "grade" | "attendance" | "fee" | "message" | "event";
  text: string;
  time: string;
}

interface DashboardTabProps {
  selectedChild: StudentProfile;
  attendanceRate: number;
  pendingFeesAmount: number;
  unreadNoticesCount: number;
  nextFeeDueDate: string;
  recentActivities: Activity[];
}

export function DashboardTab({
  selectedChild,
  attendanceRate,
  pendingFeesAmount,
  unreadNoticesCount,
  nextFeeDueDate,
  recentActivities,
}: DashboardTabProps) {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "grade":
        return <Award size={16} />;
      case "attendance":
        return <CheckCircle size={16} />;
      case "fee":
        return <CreditCard size={16} />;
      case "message":
        return <MessageSquare size={16} />;
      case "event":
        return <CalendarDays size={16} />;
    }
  };

  const getActivityColor = (type: Activity["type"]) => {
    switch (type) {
      case "grade":
        return "#3B82F6"; // blue
      case "attendance":
        return "#10B981"; // emerald
      case "fee":
        return "#F59E0B"; // amber
      case "message":
        return "#8B5CF6"; // purple
      case "event":
        return "#EC4899"; // pink
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* GPA */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-5 text-white shadow-lg shadow-blue-500/15 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-white font-extrabold uppercase tracking-wider opacity-90">Current GPA</span>
            <BookOpen size={20} className="text-white/80" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-white drop-shadow-xs tracking-tight">{selectedChild.currentGPA.toFixed(2)}</p>
            <p className="text-[11px] text-white/90 font-bold mt-1">Scale of 4.0</p>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-lg shadow-emerald-500/15 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-white font-extrabold uppercase tracking-wider opacity-90">Attendance Rate</span>
            <CheckCircle size={20} className="text-white/80" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-white drop-shadow-xs tracking-tight">{attendanceRate.toFixed(1)}%</p>
            <p className="text-[11px] text-white/90 font-bold mt-1">Goal: 75%+</p>
          </div>
        </div>

        {/* Pending Fees */}
        <div className="bg-gradient-to-br from-teal-600 to-emerald-800 rounded-3xl p-5 text-white shadow-lg shadow-teal-500/15 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-white font-extrabold uppercase tracking-wider opacity-90">Pending Fees</span>
            <CreditCard size={20} className="text-white/80" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-white drop-shadow-xs tracking-tight">₹{pendingFeesAmount.toLocaleString("en-IN")}</p>
            {pendingFeesAmount > 0 && nextFeeDueDate ? (
              <p className="text-[11px] text-amber-200 font-extrabold mt-1 truncate">Due: {nextFeeDueDate}</p>
            ) : (
              <p className="text-[11px] text-white/90 font-bold mt-1">Fully Paid</p>
            )}
          </div>
        </div>

        {/* Unread Notices */}
        <div className="bg-gradient-to-br from-purple-600 to-violet-800 rounded-3xl p-5 text-white shadow-lg shadow-purple-500/15 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs text-white font-extrabold uppercase tracking-wider opacity-90">Unread Notices</span>
            <Bell size={20} className="text-white/80" />
          </div>
          <div className="mt-4">
            <p className="text-3xl font-black text-white drop-shadow-xs tracking-tight">{unreadNoticesCount}</p>
            <p className="text-[11px] text-white/90 font-bold mt-1">New updates</p>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 text-base mb-4">Recent Academic Activities</h3>
        {recentActivities.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-8">No recent activities log found.</p>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((act) => (
              <div key={act.id} className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                  style={{ backgroundColor: getActivityColor(act.type) }}
                >
                  {getActivityIcon(act.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{act.text}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{act.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
