import React from "react";
import { Mail, MessageSquare, Bell, Save } from "lucide-react";
import { NotificationPreference } from "@/types/parent-portal";

interface SettingsTabProps {
  preferences: NotificationPreference;
  onTogglePreference: (key: keyof Omit<NotificationPreference, "id" | "userId">) => void;
  onSavePreferences: () => void;
}

export function SettingsTab({
  preferences,
  onTogglePreference,
  onSavePreferences,
}: SettingsTabProps) {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm max-w-lg">
      <h3 className="font-bold text-slate-800 text-base mb-2">Notification Preferences</h3>
      <p className="text-xs text-slate-400 mb-5">Configure how you wish to receive updates regarding your child's activities.</p>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail size={16} />
            </div>
            <div>
              <label htmlFor="pref-grades" className="text-xs font-bold text-slate-700 cursor-pointer">Grade Post Notifications</label>
              <p className="text-[10px] text-slate-400">Receive alert when test score cards are published.</p>
            </div>
          </div>
          <input
            id="pref-grades"
            type="checkbox"
            checked={preferences.gradesPosted}
            onChange={() => onTogglePreference("gradesPosted")}
            className="w-4 h-4 rounded border-slate-300 text-accent focus:ring-accent/30 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <Bell size={16} />
            </div>
            <div>
              <label htmlFor="pref-attendance" className="text-xs font-bold text-slate-700 cursor-pointer">Attendance Updates</label>
              <p className="text-[10px] text-slate-400">Receive immediate notifications for absent or late remarks.</p>
            </div>
          </div>
          <input
            id="pref-attendance"
            type="checkbox"
            checked={preferences.attendanceUpdates}
            onChange={() => onTogglePreference("attendanceUpdates")}
            className="w-4 h-4 rounded border-slate-300 text-accent focus:ring-accent/30 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-accent/10 text-emerald-600 flex items-center justify-center">
              <MessageSquare size={16} />
            </div>
            <div>
              <label htmlFor="pref-fees" className="text-xs font-bold text-slate-700 cursor-pointer">Fee Installment Reminders</label>
              <p className="text-[10px] text-slate-400">Get early reminder warnings prior to installment due dates.</p>
            </div>
          </div>
          <input
            id="pref-fees"
            type="checkbox"
            checked={preferences.feeReminders}
            onChange={() => onTogglePreference("feeReminders")}
            className="w-4 h-4 rounded border-slate-300 text-accent focus:ring-accent/30 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bell size={16} />
            </div>
            <div>
              <label htmlFor="pref-events" className="text-xs font-bold text-slate-700 cursor-pointer">School Events Notice</label>
              <p className="text-[10px] text-slate-400">Receive alerts for parent PTM and annual calendar announcements.</p>
            </div>
          </div>
          <input
            id="pref-events"
            type="checkbox"
            checked={preferences.eventNotifications}
            onChange={() => onTogglePreference("eventNotifications")}
            className="w-4 h-4 rounded border-slate-300 text-accent focus:ring-accent/30 cursor-pointer"
          />
        </div>
      </div>

      <button
        onClick={onSavePreferences}
        className="w-full py-3 bg-primary hover:bg-primary-light text-white font-bold rounded-xl text-xs transition-colors mt-6 cursor-pointer flex items-center justify-center gap-2 shadow-sm"
      >
        <Save size={14} />
        Save Settings Configurations
      </button>
    </div>
  );
}
