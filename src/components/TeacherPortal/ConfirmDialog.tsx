import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, LogOut, X, Check } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info" | "success";
  isAlert?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isAlert = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => cancelRef.current?.focus(), 50);
      const handleKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onCancel();
      };
      window.addEventListener("keydown", handleKey);
      return () => window.removeEventListener("keydown", handleKey);
    }
  }, [isOpen, onCancel]);

  const iconColors = {
    danger:  { bg: "bg-red-50",     border: "border-red-100",     icon: "text-red-500",     btn: "bg-red-500 hover:bg-red-600",     ring: "focus:ring-red-200" },
    warning: { bg: "bg-amber-50",   border: "border-amber-100",   icon: "text-amber-500",   btn: "bg-amber-500 hover:bg-amber-600", ring: "focus:ring-amber-200" },
    info:    { bg: "bg-accent/10",  border: "border-accent/20",   icon: "text-accent",      btn: "bg-accent hover:bg-accent-light", ring: "focus:ring-accent/30" },
    success: { bg: "bg-green-50",   border: "border-green-100",   icon: "text-green-500",   btn: "bg-green-500 hover:bg-green-600", ring: "focus:ring-green-200" },
  };
  const c = iconColors[variant];

  const Icon = variant === "danger" ? Trash2 : variant === "warning" ? LogOut : variant === "success" ? Check : AlertTriangle;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
          >
            <div className="p-6">
              {/* Close */}
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>

              {/* Icon + Title */}
              <div className="flex items-start gap-4 mb-4">
                <div className={`w-11 h-11 rounded-2xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0`}>
                  <Icon size={20} className={c.icon} />
                </div>
                <div className="pt-0.5">
                  <h2 id="confirm-title" className="font-bold text-slate-800 text-base leading-tight">{title}</h2>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">{message}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-5">
                {!isAlert && (
                  <button
                    ref={cancelRef}
                    onClick={onCancel}
                    className="flex-1 h-10 px-4 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-200"
                  >
                    {cancelLabel}
                  </button>
                )}
                <button
                  onClick={onConfirm}
                  className={`flex-1 h-10 px-4 rounded-xl text-white text-sm font-bold transition-all cursor-pointer shadow-sm hover:shadow-md focus:outline-none focus:ring-2 ${c.btn} ${c.ring}`}
                >
                  {isAlert && confirmLabel === "Confirm" ? "OK" : confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
