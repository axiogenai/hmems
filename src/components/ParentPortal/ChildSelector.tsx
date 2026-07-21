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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {childrenList.map((child) => (
          <button
            key={child.id}
            onClick={() => onSelectChild(child.id)}
            className={`p-4 rounded-2xl text-left transition-all border-2 cursor-pointer ${
              selectedChildId === child.id
                ? "bg-primary border-primary text-white shadow-md shadow-primary/10"
                : "bg-slate-50 border-slate-200 text-slate-800 hover:border-primary/50"
            }`}
          >
            <p className="font-bold text-sm truncate">{child.name}</p>
            <p className={`text-xs mt-1 ${selectedChildId === child.id ? "text-white/80" : "text-slate-500"}`}>
              {child.grade}-{child.section}
            </p>
            <span
              className={`inline-block text-[9px] font-bold px-2 py-0.5 mt-2 rounded-full ${
                child.status === "Active"
                  ? selectedChildId === child.id
                    ? "bg-emerald-400/20 text-emerald-200"
                    : "bg-green-50 text-green-600"
                  : selectedChildId === child.id
                  ? "bg-emerald-400/20 text-emerald-200"
                  : "bg-accent/10 text-emerald-600"
              }`}
            >
              {child.status}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
