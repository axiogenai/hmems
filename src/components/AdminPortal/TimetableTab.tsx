import React, { useState, useEffect, useMemo } from "react";
import { Calendar, Clock, BookOpen, User, MapPin, Save, RefreshCw, Sparkles, Check, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useLocalStorage } from "@/hooks/useLocalStorage";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const CLASSES_LIST = [
  "Nursery", "LKG", "UKG",
  "Class I-A", "Class I-B", "Class II-A", "Class II-B",
  "Class III-A", "Class III-B", "Class IV-A", "Class IV-B",
  "Class V-A", "Class V-B", "Class VI-A", "Class VI-B",
  "Class VII-A", "Class VII-B", "Class VIII-A", "Class VIII-B",
  "Class IX-A", "Class IX-B", "Class X-A", "Class X-B"
];

const DEFAULT_PERIODS = [
  { period: 1, startTime: "08:30 AM", endTime: "09:15 AM", label: "Period 1" },
  { period: 2, startTime: "09:15 AM", endTime: "10:00 AM", label: "Period 2" },
  { period: 3, startTime: "10:00 AM", endTime: "10:45 AM", label: "Period 3" },
  { period: 4, startTime: "11:15 AM", endTime: "12:00 PM", label: "Period 4 (Post-Recess)" },
  { period: 5, startTime: "12:00 PM", endTime: "12:45 PM", label: "Period 5" },
  { period: 6, startTime: "01:30 PM", endTime: "02:15 PM", label: "Period 6 (Post-Lunch)" },
  { period: 7, startTime: "02:15 PM", endTime: "03:00 PM", label: "Period 7" },
];

const DEFAULT_SUBJECTS = ["Mathematics", "Science", "English", "Social Studies", "Hindi", "Computer Science", "Physical Education", "Art & Craft", "Library / Reading", "Environmental Studies"];

import { generateDemoTimetables } from "@/data/demo-generator";

export function TimetableTab() {
  const [selectedClass, setSelectedClass] = useState("Class IX-A");
  const [selectedDay, setSelectedDay] = useState("Monday");
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Timetable State: Map<classId, Record<"day-periodNumber", TimetableEntry>>
  const [timetableStore, setTimetableStore] = useLocalStorage<Record<string, any>>("admin_timetable_store", generateDemoTimetables());

  // Fetch teachers for dropdowns
  useEffect(() => {
    const loadTeachers = async () => {
      const { data } = await supabase.from("teachers").select("id, name, email");
      if (data) setTeachers(data);
    };
    loadTeachers();
  }, []);

  // Fetch timetable from Supabase or LocalStorage
  const loadTimetable = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from("timetables")
        .select("*")
        .eq("class_id", selectedClass);

      if (data && data.length > 0) {
        const classEntries: Record<string, any> = {};
        data.forEach((entry: any) => {
          const key = `${entry.day}-${entry.period_number}`;
          classEntries[key] = {
            subject: entry.subject,
            teacherName: entry.teacher_name,
            room: entry.room || "Classroom",
            startTime: entry.start_time,
            endTime: entry.end_time
          };
        });
        setTimetableStore((prev: any) => ({ ...prev, [selectedClass]: classEntries }));
      }
    } catch (err) {
      console.error("Timetable load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTimetable();
  }, [selectedClass]);

  const currentClassSchedule = timetableStore[selectedClass] || {};

  const handleCellChange = (day: string, periodNumber: number, field: string, value: string) => {
    const key = `${day}-${periodNumber}`;
    const periodMeta = DEFAULT_PERIODS.find(p => p.period === periodNumber);

    const existing = currentClassSchedule[key] || {
      subject: "Mathematics",
      teacherName: teachers[0]?.name || "Class Teacher",
      room: "Classroom",
      startTime: periodMeta?.startTime || "08:30 AM",
      endTime: periodMeta?.endTime || "09:15 AM"
    };

    const updated = { ...existing, [field]: value };

    setTimetableStore((prev: any) => ({
      ...prev,
      [selectedClass]: {
        ...(prev[selectedClass] || {}),
        [key]: updated
      }
    }));
  };

  const handleSaveTimetable = async () => {
    setSaving(true);
    setSuccessMsg("");

    try {
      const entriesToUpsert: any[] = [];

      DAYS_OF_WEEK.forEach(day => {
        DEFAULT_PERIODS.forEach(p => {
          const key = `${day}-${p.period}`;
          const cell = currentClassSchedule[key];
          if (cell && cell.subject) {
            entriesToUpsert.push({
              class_id: selectedClass,
              day,
              period_number: p.period,
              start_time: cell.startTime || p.startTime,
              end_time: cell.endTime || p.endTime,
              subject: cell.subject,
              teacher_name: cell.teacherName || "Class Teacher",
              room: cell.room || "Classroom"
            });
          }
        });
      });

      if (entriesToUpsert.length > 0) {
        await supabase.from("timetables").upsert(entriesToUpsert, {
          onConflict: "class_id, day, period_number"
        });
      }

      setSuccessMsg(`✓ Timetable for ${selectedClass} saved & published live across Teacher & Parent portals!`);
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      console.error("Timetable save error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleAutoPopulateDefaults = () => {
    const generated: Record<string, any> = {};
    DAYS_OF_WEEK.forEach((day, dIdx) => {
      DEFAULT_PERIODS.forEach((p, pIdx) => {
        const key = `${day}-${p.period}`;
        const subjIndex = (dIdx + pIdx) % DEFAULT_SUBJECTS.length;
        const teacherIndex = (dIdx + pIdx) % (teachers.length || 1);
        generated[key] = {
          subject: DEFAULT_SUBJECTS[subjIndex],
          teacherName: teachers[teacherIndex]?.name || "Class Teacher",
          room: subjIndex % 3 === 0 ? "Science Lab" : subjIndex % 4 === 0 ? "Computer Lab" : "Room 204",
          startTime: p.startTime,
          endTime: p.endTime
        };
      });
    });

    setTimetableStore((prev: any) => ({
      ...prev,
      [selectedClass]: generated
    }));

    setSuccessMsg(`Preset schedule populated for ${selectedClass}. Click "Save Timetable" to commit.`);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");

  return (
    <div className="space-y-6">
      {/* Header & Class Selector Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="text-emerald-600" size={24} />
            <h2 className="text-xl font-black text-slate-800">Class Weekly Timetable Manager</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Configure daily period schedules, subject slots, assigned teachers, and classrooms for every class.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("daily")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "daily" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Daily Edit View
            </button>
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "weekly" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Full Weekly Matrix View
            </button>
          </div>

          <button
            onClick={handleAutoPopulateDefaults}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            title="Auto-fill standard timetable schedule for this class"
          >
            <Sparkles size={14} className="text-amber-600" /> Auto-Fill Template
          </button>

          <button
            onClick={handleSaveTimetable}
            disabled={saving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{saving ? "Saving..." : "Save & Publish Timetable"}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-4 rounded-2xl font-bold text-center animate-in fade-in">
          {successMsg}
        </div>
      )}

      {/* Class Switcher Pills */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-sm">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-2 mb-2">Select Class Schedule</p>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {CLASSES_LIST.map(cls => (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedClass === cls
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* Mode 1: Full 6-Day Weekly Matrix View */}
      {viewMode === "weekly" ? (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-x-auto">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">Full 6-Day Master Timetable — {selectedClass}</h3>
              <p className="text-xs text-slate-400">Complete Monday through Saturday schedule matrix</p>
            </div>
          </div>
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-3 text-left font-bold rounded-tl-xl">Day</th>
                {DEFAULT_PERIODS.map(p => (
                  <th key={p.period} className="p-3 text-center font-bold border-l border-slate-800">
                    <div>{p.label}</div>
                    <div className="text-[10px] font-normal text-slate-400">{p.startTime}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {DAYS_OF_WEEK.map(day => (
                <tr key={day} className="hover:bg-slate-50">
                  <td className="p-3 font-extrabold text-slate-900 bg-slate-50 border-r border-slate-200">
                    {day}
                  </td>
                  {DEFAULT_PERIODS.map(p => {
                    const key = `${day}-${p.period}`;
                    const cell = currentClassSchedule[key] || {
                      subject: DEFAULT_SUBJECTS[p.period % DEFAULT_SUBJECTS.length],
                      teacherName: teachers[0]?.name || "Class Teacher",
                      room: "Classroom"
                    };
                    return (
                      <td key={p.period} className="p-2.5 text-center border-r border-slate-100">
                        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2 space-y-1">
                          <p className="font-extrabold text-emerald-900 text-xs">{cell.subject}</p>
                          <p className="text-[10px] text-slate-600 truncate">{cell.teacherName}</p>
                          <span className="inline-block text-[9px] font-bold px-1.5 py-0.5 bg-white text-slate-500 rounded border border-slate-200">
                            {cell.room}
                          </span>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Mode 2: Single Day Edit View */
        <>
          {/* Day Sub-Navigation Tabs */}
          <div className="flex gap-2 border-b border-slate-200/80 pb-1 overflow-x-auto">
            {DAYS_OF_WEEK.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDay === day
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Timetable Grid for Selected Day & Class */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base">
              {selectedClass} Schedule — <span className="text-emerald-700">{selectedDay}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Edit periods, subjects, teachers, and rooms below</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-slate-600">
            7 Period Slots
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEFAULT_PERIODS.map(p => {
            const key = `${selectedDay}-${p.period}`;
            const cell = currentClassSchedule[key] || {
              subject: DEFAULT_SUBJECTS[p.period % DEFAULT_SUBJECTS.length],
              teacherName: teachers[0]?.name || "Class Teacher",
              room: "Classroom",
              startTime: p.startTime,
              endTime: p.endTime
            };

            return (
              <div key={p.period} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all">
                <div className="flex justify-between items-center border-b border-slate-200/60 pb-2">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Clock size={13} className="text-emerald-600" />
                    {p.label}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {p.startTime} – {p.endTime}
                  </span>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Subject</label>
                    <select
                      value={cell.subject || ""}
                      onChange={(e) => handleCellChange(selectedDay, p.period, "subject", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600"
                    >
                      {DEFAULT_SUBJECTS.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assigned Teacher</label>
                    <select
                      value={cell.teacherName || ""}
                      onChange={(e) => handleCellChange(selectedDay, p.period, "teacherName", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
                    >
                      <option value="Class Teacher">Class Teacher (Default)</option>
                      {teachers.map(t => (
                        <option key={t.id} value={t.name}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Room / Venue</label>
                    <input
                      type="text"
                      value={cell.room || "Classroom"}
                      onChange={(e) => handleCellChange(selectedDay, p.period, "room", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
                      placeholder="e.g. Room 204 / Science Lab"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
