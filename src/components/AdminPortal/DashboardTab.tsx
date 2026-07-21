import React from "react";
import { Users, UserPlus, CreditCard, Award, ArrowUpRight } from "lucide-react";
import { Application, ActivityLog } from "@/types/admin";

interface DashboardTabProps {
  stats: {
    totalStudents: number;
    newApplications: number;
    totalFeeCollected: number;
    feeCollectionPercentage: number;
    approvalRate: string;
  };
  applications: Application[];
  activities: ActivityLog[];
  onNavigateToTab: (tab: string) => void;
}

export function DashboardTab({
  stats,
  applications,
  activities,
  onNavigateToTab,
}: DashboardTabProps) {
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

  const getActivityTypeColor = (type: ActivityLog["type"]) => {
    switch (type) {
      case "success":
        return "text-green-500 bg-green-50 border-green-100";
      case "warning":
        return "text-emerald-500 bg-emerald-50 border-emerald-200";
      case "error":
        return "text-rose-500 bg-rose-50 border-rose-100";
      default:
        return "text-blue-500 bg-blue-50 border-blue-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-3 shadow-sm shadow-blue-500/10">
            <Users size={18} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{stats.totalStudents}</p>
            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Total Active Students</p>
          </div>
        </div>

        {/* New Applications */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center mb-3 shadow-sm shadow-green-500/10">
            <UserPlus size={18} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{stats.newApplications}</p>
            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">New Registrations</p>
          </div>
        </div>

        {/* Fee Collection */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-3 shadow-sm shadow-purple-500/10">
            <CreditCard size={18} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">
              ₹{(stats.totalFeeCollected / 100000).toFixed(1)}L
            </p>
            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
              Collected ({stats.feeCollectionPercentage.toFixed(0)}%)
            </p>
          </div>
        </div>

        {/* Approval Rate */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-primary/30 transition-all">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-3 shadow-sm shadow-emerald-500/10">
            <Award size={18} className="text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-800">{stats.approvalRate}%</p>
            <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-wider">Approval Rate</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Inquiries List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm">Admissions Registration Inquiries</h3>
            <button
              onClick={() => onNavigateToTab("admissions")}
              className="text-xs text-accent font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Manage <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="p-4 divide-y divide-slate-100 max-h-[320px] overflow-y-auto pr-2">
            {applications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No applications logged.</p>
            ) : (
              applications.slice(0, 5).map((app) => (
                <div key={app.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs font-bold text-slate-700">{app.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {app.grade} · {app.date}
                    </p>
                  </div>
                  <span className={`text-[9px] font-extrabold px-2.5 py-1 rounded-lg border ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Activity Logger */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-sm">Live System Audit Activity</h3>
          </div>
          <div className="p-4 space-y-3.5 max-h-[320px] overflow-y-auto pr-2">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No activity records logged.</p>
            ) : (
              activities.map((a) => (
                <div key={a.id} className="flex gap-3 text-xs leading-normal">
                  <span className="text-[9px] text-slate-400 font-bold w-12 shrink-0 mt-0.5 uppercase tracking-wide">
                    {a.time}
                  </span>
                  <span className="text-slate-600 font-semibold flex-1">{a.text}</span>
                  <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    a.type === "success" ? "bg-green-500" : a.type === "warning" ? "bg-accent/100" : a.type === "error" ? "bg-red-500" : "bg-blue-500"
                  }`} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
