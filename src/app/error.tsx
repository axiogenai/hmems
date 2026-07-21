"use client";

import React, { useEffect } from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 dark:bg-[#0A0F1D]">
      <div className="max-w-md w-full bg-white dark:bg-[#111A2E] rounded-3xl p-8 border border-border dark:border-slate-800 text-center shadow-card">
        <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        <h2 className="text-xl font-bold text-primary dark:text-white mb-3">
          Something went wrong!
        </h2>
        <p className="text-sm text-body dark:text-slate-300 mb-8 leading-relaxed">
          An error occurred while loading this page. Please try reloading the page or go back home.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 bg-accent hover:bg-accent-light text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer hover:translate-y-[-2px]"
        >
          <RotateCcw size={16} />
          Try Again
        </button>
      </div>
    </div>
  );
}
