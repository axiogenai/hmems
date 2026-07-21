import React, { useState, memo } from "react";
import { motion } from "framer-motion";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { FormInput } from "@/components/TeacherPortal/FormInput";
import { FeeRecord } from "@/types/parent-portal";

interface FeePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  fee: FeeRecord;
  onPaymentSuccess: (feeId: string, method: string, referenceNo: string) => void;
}

export const FeePaymentModal = memo(function FeePaymentModal({
  isOpen,
  onClose,
  fee,
  onPaymentSuccess,
}: FeePaymentModalProps) {
  const modalRef = useFocusTrap(isOpen, onClose);
  const [method, setMethod] = useState<"Card" | "UPI" | "Net Banking">("Card");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "" });
  const [upiDetails, setUpiDetails] = useState({ vpa: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (method === "Card") {
      if (!cardDetails.number.replace(/\s/g, "").match(/^\d{16}$/)) {
        newErrors.number = "Enter a valid 16-digit card number";
      }
      if (!cardDetails.expiry.match(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/)) {
        newErrors.expiry = "Enter expiry in MM/YY format";
      }
      if (!cardDetails.cvv.match(/^\d{3}$/)) {
        newErrors.cvv = "Enter 3-digit CVV";
      }
    } else if (method === "UPI") {
      if (!upiDetails.vpa.trim().includes("@")) {
        newErrors.vpa = "Enter a valid UPI ID (e.g., name@upi)";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsProcessing(true);

    // Mock payment gateway delay
    setTimeout(() => {
      setIsProcessing(false);
      const referenceNo = "TXN" + Math.floor(Math.random() * 900000000 + 100000000);
      onPaymentSuccess(fee.id, method, referenceNo);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-modal-title"
      >
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <h4 id="payment-modal-title" className="font-bold text-slate-800 text-sm">
            Payment Gateway — Installment Settlement
          </h4>
          <button
            onClick={onClose}
            aria-label="Close payment modal"
            className="text-xl hover:text-red-500 font-bold transition-colors cursor-pointer"
            disabled={isProcessing}
          >
            &times;
          </button>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
          <div className="flex justify-between text-xs font-semibold text-slate-500">
            <span>Installment Detail</span>
            <span>Settlement Amount</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-slate-800 mt-1">
            <span>{fee.term}</span>
            <span className="text-red-600">₹{fee.amount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Method Toggles */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Settlement Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["Card", "UPI", "Net Banking"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setMethod(mode);
                    setErrors({});
                  }}
                  className={`py-2 px-1 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    method === mode
                      ? "bg-primary border-primary text-white"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:border-primary/45"
                  }`}
                  disabled={isProcessing}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Form Inputs based on method */}
          {method === "Card" && (
            <div className="space-y-3">
              <FormInput
                id="card-num"
                label="Card Number"
                placeholder="XXXX XXXX XXXX XXXX"
                value={cardDetails.number}
                onChange={(e) => {
                  setCardDetails({ ...cardDetails, number: e.target.value });
                  if (errors.number) setErrors({ ...errors, number: "" });
                }}
                error={errors.number}
                disabled={isProcessing}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <FormInput
                  id="card-expiry"
                  label="Expiry Date"
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) => {
                    setCardDetails({ ...cardDetails, expiry: e.target.value });
                    if (errors.expiry) setErrors({ ...errors, expiry: "" });
                  }}
                  error={errors.expiry}
                  disabled={isProcessing}
                  required
                />
                <FormInput
                  id="card-cvv"
                  label="CVV Code"
                  type="password"
                  placeholder="***"
                  maxLength={3}
                  value={cardDetails.cvv}
                  onChange={(e) => {
                    setCardDetails({ ...cardDetails, cvv: e.target.value });
                    if (errors.cvv) setErrors({ ...errors, cvv: "" });
                  }}
                  error={errors.cvv}
                  disabled={isProcessing}
                  required
                />
              </div>
            </div>
          )}

          {method === "UPI" && (
            <FormInput
              id="upi-vpa"
              label="Virtual Payment Address (VPA / UPI ID)"
              placeholder="e.g., parent@okhdfcbank"
              value={upiDetails.vpa}
              onChange={(e) => {
                setUpiDetails({ ...upiDetails, vpa: e.target.value });
                if (errors.vpa) setErrors({ ...errors, vpa: "" });
              }}
              error={errors.vpa}
              disabled={isProcessing}
              required
            />
          )}

          {method === "Net Banking" && (
            <div>
              <label htmlFor="bank-select" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Choose Bank Gateway
              </label>
              <select
                id="bank-select"
                className="w-full px-3 py-2 border border-border rounded-xl text-xs bg-slate-50 focus:outline-none"
                disabled={isProcessing}
              >
                <option value="sbi">State Bank of India</option>
                <option value="hdfc">HDFC Bank</option>
                <option value="icici">ICICI Bank</option>
                <option value="axis">Axis Bank</option>
              </select>
            </div>
          )}

          {/* Action trigger */}
          <button
            type="submit"
            className="w-full py-3 bg-accent hover:bg-accent-light text-white font-bold rounded-xl text-xs shadow-md transition-all mt-4 cursor-pointer flex items-center justify-center gap-2"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Authorizing Settlement Gateway...
              </span>
            ) : (
              `Authorize Payment of ₹${fee.amount.toLocaleString("en-IN")}`
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
});
