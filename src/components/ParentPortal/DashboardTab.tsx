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
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl p-5 text-white shadow-md flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs opacity-90 font-medium">Current GPA</span>
            <BookOpen size={20} className="opacity-80" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold">{selectedChild.currentGPA.toFixed(2)}</p>
            <p className="text-[10px] opacity-75 mt-1">Scale of 4.0</p>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-3xl p-5 text-white shadow-md flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs opacity-90 font-medium">Attendance Rate</span>
            <CheckCircle size={20} className="opacity-80" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold">{attendanceRate.toFixed(1)}%</p>
            <p className="text-[10px] opacity-75 mt-1">Goal: 75%+</p>
          </div>
        </div>

        {/* Pending Fees */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-3xl p-5 text-white shadow-md flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs opacity-90 font-medium">Pending Fees</span>
            <CreditCard size={20} className="opacity-80" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold">₹{pendingFeesAmount.toLocaleString("en-IN")}</p>
            {pendingFeesAmount > 0 && nextFeeDueDate ? (
              <p className="text-[10px] opacity-80 mt-1 truncate">Due: {nextFeeDueDate}</p>
            ) : (
              <p className="text-[10px] opacity-75 mt-1">Fully Paid</p>
            )}
          </div>
        </div>

        {/* Unread Announcements */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-3xl p-5 text-white shadow-md flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-xs opacity-90 font-medium">Unread Notices</span>
            <Bell size={20} className="opacity-80" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold">{unreadNoticesCount}</p>
            <p className="text-[10px] opacity-75 mt-1">New updates</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 text-base mb-4">Recent Academic Activities</h3>
        {recentActivities.length === 0 ? (
          <p className="text-xs text-slate-400 font-medium py-2 text-center">No recent activities log found.</p>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3 items-center hover:border-slate-200 transition-all">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-white shadow-sm"
                  style={{ backgroundColor: getActivityColor(activity.type) }}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 leading-normal">{activity.text}</p>
                  <p className="text-[9px] text-slate-400 font-medium mt-1 uppercase tracking-wide">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
