import React, { useState, useMemo } from "react";
import { CreditCard, Search, ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Payment, PaymentMethod } from "@/types/admin";
import { FormInput } from "@/components/TeacherPortal/FormInput";

interface FinanceTabProps {
  paymentLog: Payment[];
  onLogPayment: (payment: Omit<Payment, "id" | "createdAt" | "updatedAt">) => void;
  formErrors: Record<string, string>;
  paymentSuccess: boolean;
}

export function FinanceTab({
  paymentLog,
  onLogPayment,
  formErrors,
  paymentSuccess,
}: FinanceTabProps) {
  const [newPayment, setNewPayment] = useState({
    family: "",
    amount: "",
    method: PaymentMethod.UPI,
    referenceNo: "",
    term: "Term 1",
  });
  
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filtered List
  const filteredList = useMemo(() => {
    return paymentLog.filter((p) => p.family.toLowerCase().includes(search.toLowerCase()));
  }, [paymentLog, search]);

  // Paginated List
  const totalPages = Math.max(1, Math.ceil(filteredList.length / itemsPerPage));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage]);

  const gstValue = useMemo(() => {
    const amt = Number(newPayment.amount) || 0;
    return Math.round(amt * 0.18); // 18% GST calculation
  }, [newPayment.amount]);

  const totalWithGst = useMemo(() => {
    const amt = Number(newPayment.amount) || 0;
    return amt + gstValue;
  }, [newPayment.amount, gstValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogPayment({
      family: newPayment.family,
      amount: totalWithGst, // Log total amount with tax
      method: newPayment.method,
      referenceNo: newPayment.referenceNo,
      term: newPayment.term,
      date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      status: "Success",
    });
  };

  // Reset form inputs upon successful action callback
  React.useEffect(() => {
    if (paymentSuccess) {
      setNewPayment({
        family: "",
        amount: "",
        method: PaymentMethod.UPI,
        referenceNo: "",
        term: "Term 1",
      });
    }
  }, [paymentSuccess]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logger form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 text-base mb-4">Log Student Payment</h3>
          
          {paymentSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs p-3.5 rounded-2xl font-semibold mb-4 text-center">
              ✓ Payment transaction logged and added to audits ledger.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              id="pay-family"
              label="Family / Payer Name"
              placeholder="e.g., Sharma family"
              value={newPayment.family}
              onChange={(e) => setNewPayment({ ...newPayment, family: e.target.value })}
              error={formErrors.family}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <FormInput
                id="pay-amount"
                label="Base Amount (₹)"
                type="number"
                placeholder="55000"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                error={formErrors.amount}
                required
              />
              <div>
                <label htmlFor="pay-term" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  School Term
                </label>
                <select
                  id="pay-term"
                  value={newPayment.term}
                  onChange={(e) => setNewPayment({ ...newPayment, term: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-xl text-xs bg-slate-50 focus:outline-none"
                >
                  <option value="Term 1">Term 1 (Jun-Aug)</option>
                  <option value="Term 2">Term 2 (Sep-Nov)</option>
                  <option value="Term 3">Term 3 (Dec-Feb)</option>
                  <option value="Term 4">Term 4 (Mar-May)</option>
                </select>
              </div>
            </div>

            {/* GST Summary */}
            {Number(newPayment.amount) > 0 && (
              <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100/60 text-xs font-semibold text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Base Fee:</span>
                  <span>₹{Number(newPayment.amount).toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST (18%):</span>
                  <span>₹{gstValue.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200/60 pt-1.5 text-slate-800 font-extrabold text-sm mt-1">
                  <span>Total Bill:</span>
                  <span className="text-emerald-600">₹{totalWithGst.toLocaleString("en-IN")}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="pay-method" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Method
                </label>
                <select
                  id="pay-method"
                  value={newPayment.method}
                  onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value as PaymentMethod })}
                  className="w-full px-3 py-2 border border-border rounded-xl text-xs bg-slate-50 focus:outline-none"
                >
                  {Object.values(PaymentMethod).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <FormInput
                id="pay-ref"
                label="Reference Number"
                placeholder="TXN1839029"
                value={newPayment.referenceNo}
                onChange={(e) => setNewPayment({ ...newPayment, referenceNo: e.target.value })}
                error={formErrors.referenceNo}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-accent hover:bg-accent-light text-white font-bold rounded-xl text-xs hover:shadow-lg transition-all mt-3 cursor-pointer"
            >
              Log Audit Transaction
            </button>
          </form>
        </div>

        {/* Audit statements list */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h3 className="font-bold text-slate-800 text-base">Collections Audit Journal</h3>
              <div className="relative max-w-xs w-full">
                <Search size={13} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search payer name..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none"
                />
              </div>
            </div>

            {paginatedList.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No audited records logged.</p>
            ) : (
              <div className="space-y-3">
                {paginatedList.map((log) => (
                  <div
                    key={log.id}
                    className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-700">{log.family}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">
                        {log.method} · {log.term} · {log.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-800 text-sm">
                        ₹{log.amount.toLocaleString("en-IN")}
                      </span>
                      <span className="block text-[9px] font-extrabold text-emerald-600 uppercase mt-0.5">
                        Success
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
