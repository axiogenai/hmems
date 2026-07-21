import React, { useState } from "react";
import { Settings, RotateCcw, Check, Sparkles } from "lucide-react";
import { ConfigVersion } from "@/types/admin";
import { FormInput } from "@/components/TeacherPortal/FormInput";

interface ContentControlTabProps {
  editableConfig: {
    schoolName: string;
    tagline: string;
    foundedYear: number;
    phone: string;
    email: string;
  };
  configVersions: ConfigVersion[];
  onSaveConfig: (config: {
    schoolName: string;
    tagline: string;
    foundedYear: number;
    phone: string;
    email: string;
  }) => void;
  onRollbackConfig: (versionId: string) => void;
  formErrors: Record<string, string>;
  configSuccess: boolean;
}

export function ContentControlTab({
  editableConfig,
  configVersions,
  onSaveConfig,
  onRollbackConfig,
  formErrors,
  configSuccess,
}: ContentControlTabProps) {
  const [config, setConfig] = useState(editableConfig);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(config);
  };

  // Update component local state if parent prop gets updated (e.g. on rollback)
  React.useEffect(() => {
    setConfig(editableConfig);
  }, [editableConfig]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Form */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
            <Settings size={18} className="text-accent" />
            Website Metadata Editor
          </h3>

          {configSuccess && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs p-3.5 rounded-2xl font-semibold mb-4 text-center">
              ✓ Parameters updated. Version saved to rollback archives.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              id="cfg-school"
              label="School Full Name"
              value={config.schoolName}
              onChange={(e) => setConfig({ ...config, schoolName: e.target.value })}
              error={formErrors.schoolName}
              required
            />

            <FormInput
              id="cfg-tagline"
              label="School Tagline Description"
              value={config.tagline}
              onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
              error={formErrors.tagline}
              required
            />

            <div className="grid grid-cols-2 gap-3">
              <FormInput
                id="cfg-year"
                label="Founded Year"
                type="number"
                value={config.foundedYear ? String(config.foundedYear) : ""}
                onChange={(e) => setConfig({ ...config, foundedYear: parseInt(e.target.value) || 0 })}
                error={formErrors.foundedYear}
                required
              />
              <FormInput
                id="cfg-phone"
                label="Helpline Phone"
                value={config.phone}
                onChange={(e) => setConfig({ ...config, phone: e.target.value })}
                error={formErrors.phone}
                required
              />
            </div>

            <FormInput
              id="cfg-email"
              label="Public Inquiries Email"
              type="email"
              value={config.email}
              onChange={(e) => setConfig({ ...config, email: e.target.value })}
              error={formErrors.email}
              required
            />

            <button
              type="submit"
              className="w-full py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-xl text-xs hover:shadow-lg transition-all mt-4 cursor-pointer"
            >
              Commit Website Changes
            </button>
          </form>
        </div>

        {/* Change History Rollbacks */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
            <RotateCcw size={18} className="text-blue-500" />
            Configuration Rollback Archives
          </h3>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {configVersions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No previous change logs committed.</p>
            ) : (
              configVersions.map((v) => (
                <div
                  key={v.id}
                  className="p-4 bg-slate-50 rounded-2xl border border-slate-100/70 hover:border-slate-200 transition-all space-y-2 flex justify-between items-start"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-700">{v.description}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      Committed: {new Date(v.timestamp).toLocaleString("en-IN")}
                    </p>
                    <p className="text-[9px] text-slate-500 italic">User: {v.changedBy}</p>
                  </div>
                  <button
                    onClick={() => onRollbackConfig(v.id)}
                    className="px-3 py-1 bg-white hover:bg-slate-100 text-xs font-bold border border-slate-200 hover:border-slate-300 rounded-xl text-blue-600 transition-all cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw size={11} /> Rollback
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
