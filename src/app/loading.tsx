import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 dark:bg-[#0A0F1D]">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-xl border-4 border-accent border-t-transparent animate-spin" />
        <p className="text-sm font-semibold text-primary dark:text-accent-light tracking-wide">
          Loading Holy Mother English Medium School...
        </p>
      </div>
    </div>
  );
}
