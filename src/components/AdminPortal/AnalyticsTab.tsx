import React, { useMemo } from "react";
import { BarChart3, Download, TrendingUp, DollarSign, Award } from "lucide-react";
import { Student, Payment, StudentStatus } from "@/types/admin";

interface AnalyticsTabProps {
  students: Student[];
  payments: Payment[];
  feeCollectionGoal: number;
  onExportReport: () => void;
}

export function AnalyticsTab({
  students,
  payments,
  feeCollectionGoal,
  onExportReport,
}: AnalyticsTabProps) {
  // Compute enrollment statistics
  const enrollmentStats = useMemo(() => {
    const active = students.filter((s) => !s.deletedAt && s.status === StudentStatus.Active);
    const total = active.length;

    let prePrimary = 0; // Nursery, LKG, UKG
    let primary = 0; // Class 1 to 5
    let middle = 0; // Class 6 to 8
    let high = 0; // Class 9 to 12

    active.forEach((s) => {
      const g = s.grade;
      if (g === "Nursery" || g === "LKG" || g === "UKG") {
        prePrimary++;
      } else if (g.match(/^Class ([1-5])$/)) {
        primary++;
      } else if (g.match(/^Class ([6-8])$/)) {
        middle++;
      } else {
        high++;
      }
    });

    return {
      total,
      prePrimary,
      primary,
      middle,
      high,
      prePct: total > 0 ? Math.round((prePrimary / total) * 100) : 20,
      priPct: total > 0 ? Math.round((primary / total) * 100) : 40,
      midPct: total > 0 ? Math.round((middle / total) * 100) : 20,
      hiPct: total > 0 ? Math.round((high / total) * 100) : 20,
    };
  }, [students]);

  // Compute collections total
  const collectionsTotal = useMemo(() => {
    return payments
      .filter((p) => p.status === "Success")
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payments]);

  const targetLimit = 2000000; // 20 Lakhs
  const currentGoalPct = Math.min(100, Math.round((collectionsTotal / targetLimit) * 100));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Enrollment Distribution */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-primary" />
            Enrollment distribution
          </h3>
          <div className="space-y-4">
            {[
              { level: "Pre-Primary (Nursery - UKG)", count: enrollmentStats.prePrimary, pct: enrollmentStats.prePct, color: "bg-pink-500" },
              { level: "Primary (Class I - V)", count: enrollmentStats.primary, pct: enrollmentStats.priPct, color: "bg-blue-500" },
              { level: "Middle (Class VI - VIII)", count: enrollmentStats.middle, pct: enrollmentStats.midPct, color: "bg-green-500" },
              { level: "High School (Class IX - XII)", count: enrollmentStats.high, pct: enrollmentStats.hiPct, color: "bg-purple-500" },
            ].map((grp, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{grp.level}</span>
                  <span>
                    {grp.count} <span className="text-[10px] text-slate-400 font-semibold">({grp.pct}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div className={`h-full ${grp.color} rounded-full transition-all`} style={{ width: `${grp.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Finance Analytics Progress */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
              <DollarSign size={18} className="text-emerald-600" />
              Fee Collection Target Progress
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                <span>Target Term Collections Budget:</span>
                <span className="font-extrabold text-slate-800">₹{(targetLimit / 100000).toFixed(1)}L</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                <span>Audited Collections Received:</span>
                <span className="font-extrabold text-emerald-600">₹{(collectionsTotal / 100000).toFixed(1)}L</span>
              </div>
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${currentGoalPct}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Collections Standing Status</p>
            <p className="text-base font-extrabold text-emerald-600 mt-1 flex items-center justify-center gap-1">
              <TrendingUp size={16} />
              {currentGoalPct}% of Term target collected
            </p>
          </div>
        </div>
      </div>

      {/* Export Action trigger */}
      <button
        onClick={onExportReport}
        className="w-full h-12 bg-primary hover:bg-primary-light text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <Download size={15} />
        Generate Dynamic HTML System Analytics Report
      </button>
    </div>
  );
}
