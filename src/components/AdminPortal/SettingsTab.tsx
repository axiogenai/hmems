import React from "react";
import { Database, ShieldCheck, Cpu, HardDrive } from "lucide-react";

export function SettingsTab() {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm max-w-md">
      <h3 className="font-bold text-slate-800 text-base mb-2">System Parameters Settings</h3>
      <p className="text-xs text-slate-400 mb-5">Audit and inspect connected administrative gateways and microservice runtimes.</p>

      <div className="space-y-4 text-xs font-semibold text-slate-700 divide-y divide-slate-100">
        <div className="py-3 flex justify-between items-center">
          <span className="flex items-center gap-2 text-slate-600">
            <Cpu size={15} /> Academic Calendar Session
          </span>
          <span className="font-bold text-slate-800">2026–27</span>
        </div>

        <div className="py-3 flex justify-between items-center">
          <span className="flex items-center gap-2 text-slate-600">
            <Database size={15} /> Database Engine Engine Status
          </span>
          <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
            Operational
          </span>
        </div>

        <div className="py-3 flex justify-between items-center">
          <span className="flex items-center gap-2 text-slate-600">
            <ShieldCheck size={15} /> SMS Dispatch Services
          </span>
          <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
            Connected
          </span>
        </div>

        <div className="py-3 flex justify-between items-center">
          <span className="flex items-center gap-2 text-slate-600">
            <HardDrive size={15} /> API Server Target Rebuild
          </span>
          <span className="font-bold text-slate-400 italic">Auto-build (Turbopack)</span>
        </div>
      </div>
    </div>
  );
}
