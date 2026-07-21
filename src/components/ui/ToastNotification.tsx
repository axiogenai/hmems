"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { useEffect } from "react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
}

interface ToastNotificationProps {
  toast: ToastMessage | null;
  onClose: () => void;
  duration?: number;
}

export function ToastNotification({ toast, onClose, duration = 4000 }: ToastNotificationProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onClose, duration]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="fixed top-5 right-5 z-[9999] max-w-md w-full px-4"
        >
          <div
            className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-start gap-3.5 transition-all ${
              toast.type === "success"
                ? "bg-emerald-950/95 border-emerald-500/30 text-emerald-100 shadow-emerald-950/40"
                : toast.type === "error"
                ? "bg-rose-950/95 border-rose-500/30 text-rose-100 shadow-rose-950/40"
                : "bg-slate-900/95 border-slate-700/50 text-slate-100 shadow-slate-950/40"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === "success" && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 size={18} />
                </div>
              )}
              {toast.type === "error" && (
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                  <AlertCircle size={18} />
                </div>
              )}
              {toast.type === "info" && (
                <div className="w-8 h-8 rounded-xl bg-slate-500/20 text-slate-300 flex items-center justify-center border border-slate-500/30">
                  <Info size={18} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <h4 className="text-sm font-bold tracking-tight">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs opacity-80 mt-0.5 leading-relaxed font-normal">{toast.message}</p>
              )}
            </div>

            <button
              onClick={onClose}
              className="shrink-0 p-1 rounded-lg hover:bg-white/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
