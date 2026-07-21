import React, { useMemo } from "react";
import { AlertCircle, CreditCard, CalendarDays, CheckCircle, Download } from "lucide-react";
import { StudentProfile, FeeRecord } from "@/types/parent-portal";

interface FeesTabProps {
  selectedChild: StudentProfile;
  feeRecords: FeeRecord[];
  onPayNow: (fee: FeeRecord) => void;
  onViewReceipt?: (fee: FeeRecord) => void;
}

export function FeesTab({
  selectedChild,
  feeRecords,
  onPayNow,
  onViewReceipt,
}: FeesTabProps) {
  // Filter selected child's fee records
  const childFees = useMemo(() => {
    return feeRecords.filter((f) => f.studentId === selectedChild.id);
  }, [feeRecords, selectedChild]);

  // Compute metrics
  const metrics = useMemo(() => {
    let totalDue = 0;
    let paidThisTerm = 0;
    let nextDueDate = "N/A";
    const pendingList: FeeRecord[] = [];

    childFees.forEach((f) => {
      if (f.status === "Pending" || f.status === "Overdue") {
        totalDue += f.amount;
        pendingList.push(f);
      } else if (f.status === "Paid") {
        paidThisTerm += f.amount;
      }
    });

    if (pendingList.length > 0) {
      // Find earliest due date
      const sorted = pendingList.sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
      nextDueDate = sorted[0].dueDate;
    }

    return { totalDue, paidThisTerm, nextDueDate, pendingList };
  }, [childFees]);

  return (
    <div className="space-y-6">
      {/* Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-600">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Balance Due</p>
            <p className="text-2xl font-bold text-red-600 mt-0.5">₹{metrics.totalDue.toLocaleString("en-IN")}</p>
            <p className="text-[9px] text-slate-400 font-semibold">Tuition & transport</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Paid This Term</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">₹{metrics.paidThisTerm.toLocaleString("en-IN")}</p>
            <p className="text-[9px] text-slate-400 font-semibold">Synchronized logs</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <CalendarDays size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Next Payment Due</p>
            <p className="text-lg font-bold text-slate-800 mt-0.5">{metrics.nextDueDate}</p>
            <p className="text-[9px] text-slate-400 font-semibold">Clearing deadline</p>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      {metrics.pendingList.length > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-6 shadow-sm">
          <div className="flex gap-4 items-start sm:items-center flex-col sm:flex-row">
            <AlertCircle className="text-red-600 flex-shrink-0" size={26} />
            <div className="flex-1">
              <h3 className="font-bold text-red-800 text-sm">Action Required: Fees Pending</h3>
              <p className="text-xs text-red-700 mt-1">
                You have {metrics.pendingList.length} pending fee installment(s) totaling{" "}
                <span className="font-bold">₹{metrics.totalDue.toLocaleString("en-IN")}</span>. Please clear them to avoid late penalty interest.
              </p>
            </div>
            <button
              onClick={() => onPayNow(metrics.pendingList[0])}
              className="px-6 py-2 bg-red-600 text-white font-bold rounded-xl text-xs hover:bg-red-700 hover:shadow-lg transition-all cursor-pointer w-full sm:w-auto text-center"
            >
              Pay Now
            </button>
          </div>
        </div>
      )}

      {/* Fee Statement List */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 text-base mb-4">Detailed Statement History</h3>
        {childFees.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No records found.</p>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 text-left bg-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3">Fee Category</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-center">Amount</th>
                  <th className="px-4 py-3 text-center">Receipt Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {childFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-700">{fee.term}</td>
                    <td className="px-4 py-3 text-xs text-slate-400 font-semibold">{fee.dueDate}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">
                      ₹{fee.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${
                          fee.status === "Paid"
                            ? "bg-green-50 text-green-600 border-green-100"
                            : fee.status === "Overdue"
                            ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse"
                            : "bg-amber-50 text-amber-600 border-amber-100"
                        }`}
                      >
                        {fee.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {fee.status === "Paid" ? (
                        <button
                          onClick={() => onViewReceipt && onViewReceipt(fee)}
                          className="text-xs text-blue-600 font-bold hover:underline cursor-pointer flex items-center gap-1.5 justify-end ml-auto"
                        >
                          <Download size={12} /> Receipt
                        </button>
                      ) : (
                        <button
                          onClick={() => onPayNow(fee)}
                          className="px-3.5 py-1 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-light transition-all cursor-pointer"
                        >
                          Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
