import React from "react";
import { StudentProfile } from "@/types/parent-portal";

interface ChildSelectorProps {
  childrenList: StudentProfile[];
  selectedChildId: string;
  onSelectChild: (id: string) => void;
}

export function ChildSelector({
  childrenList,
  selectedChildId,
  onSelectChild,
}: ChildSelectorProps) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 text-base mb-4">Select Child</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {childrenList.map((child) => {
          const isSelected = selectedChildId === child.id;
          const displayGrade = child.section && !child.grade.toLowerCase().includes(`-${child.section.toLowerCase()}`)
            ? `${child.grade}-${child.section}`
            : child.grade;

          return (
            <button
              key={child.id}
              onClick={() => onSelectChild(child.id)}
              className={`p-4.5 rounded-2xl text-left transition-all border-2 cursor-pointer ${
                isSelected
                  ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/20 ring-4 ring-slate-900/10"
                  : "bg-white border-slate-200 text-slate-900 hover:border-slate-300 hover:bg-slate-50/80"
              }`}
            >
              <p className={`font-extrabold text-base truncate ${isSelected ? "text-white drop-shadow-xs" : "text-slate-900"}`}>
                {child.name}
              </p>
              <p className={`text-xs mt-1 font-semibold ${isSelected ? "text-emerald-300" : "text-slate-500"}`}>
                {displayGrade}
              </p>
              <span
                className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 mt-2.5 rounded-full uppercase tracking-wider ${
                  isSelected
                    ? "bg-emerald-500/25 text-emerald-300 border border-emerald-400/40"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {child.status}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
