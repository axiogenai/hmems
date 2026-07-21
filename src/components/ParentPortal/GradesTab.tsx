import React, { useMemo } from "react";
import { Download, Award, ShieldAlert, CheckCircle } from "lucide-react";
import { StudentProfile, ChildGrade } from "@/types/parent-portal";

interface GradesTabProps {
  selectedChild: StudentProfile;
  grades: ChildGrade[];
  onDownloadReportCard: () => void;
}

export function getClassSubjects(gradeStr?: string): string[] {
  if (!gradeStr) return ["English", "Hindi", "Mathematics", "General Awareness", "Drawing & Art"];
  const raw = gradeStr.trim().toUpperCase();

  // 1. Pre-Primary: Nursery, LKG, UKG, KG
  if (/NURSERY|NURSURY|LKG|UKG|KG|PLAY/i.test(raw)) {
    return ["English", "Hindi", "Mathematics", "General Awareness", "Drawing & Art"];
  }

  // 2. Class IX and X (9 & 10)
  if (/^IX|^X|\bIX\b|\bX\b|GRADE\s*(9|10)|CLASS\s*(9|10)|^9-|^10-/i.test(raw)) {
    return ["Mathematics", "Science", "English", "Social Studies", "Hindi", "Computer Science"];
  }

  // 3. Middle School (VI, VII, VIII / 6, 7, 8)
  if (/^VI|^VII|^VIII|\bVI\b|\bVII\b|\bVIII\b|GRADE\s*(6|7|8)|CLASS\s*(6|7|8)/i.test(raw)) {
    return ["Mathematics", "Science", "English", "Social Studies", "Hindi", "Computer Science", "General Knowledge"];
  }

  // 4. Primary (I, II, III, IV, V / 1 to 5)
  return ["English", "Hindi", "Mathematics", "Environmental Studies (EVS)", "Computer Studies", "General Knowledge", "Art & Craft"];
}

export function GradesTab({
  selectedChild,
  grades,
  onDownloadReportCard,
}: GradesTabProps) {
  // Compute overall percentage
  const overallPercentage = useMemo(() => {
    if (grades.length === 0) return 0;
    const totalScore = grades.reduce((acc, g) => acc + g.score, 0);
    const totalMax = grades.reduce((acc, g) => acc + g.maxScore, 0);
    return Math.round((totalScore / totalMax) * 100);
  }, [grades]);

  // Group and compute averages for ALL subjects belonging to child's class
  const subjectAverages = useMemo(() => {
    const classSubjects = getClassSubjects(selectedChild?.grade);
    const subjectsMap: Record<string, { total: number; count: number }> = {};
    
    classSubjects.forEach(s => {
      subjectsMap[s] = { total: 0, count: 0 };
    });

    grades.forEach((g) => {
      if (!subjectsMap[g.subject]) {
        subjectsMap[g.subject] = { total: 0, count: 0 };
      }
      subjectsMap[g.subject].total += (g.score / g.maxScore) * 100;
      subjectsMap[g.subject].count += 1;
    });

    return Object.entries(subjectsMap).map(([name, data]) => ({
      name,
      average: data.count > 0 ? Math.round(data.total / data.count) : null,
      count: data.count
    }));
  }, [grades, selectedChild]);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A+":
      case "A":
        return "bg-green-50 text-green-600 border-green-100";
      case "B+":
      case "B":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "C":
        return "bg-amber-50 text-amber-600 border-amber-100";
      case "D":
      case "F":
        return "bg-rose-50 text-rose-600 border-rose-100";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Award size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Current GPA</p>
            <p className="text-2xl font-bold text-slate-800 mt-0.5">{selectedChild.currentGPA.toFixed(2)}</p>
            <p className="text-[9px] text-slate-400 font-semibold">Scale of 4.0</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Overall Percentage</p>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">{overallPercentage}%</p>
            <p className="text-[9px] text-slate-400 font-semibold">All exams combined</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Award size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Class Standing Rank</p>
            <p className="text-2xl font-bold text-purple-700 mt-0.5">5th</p>
            <p className="text-[9px] text-slate-400 font-semibold">Class {selectedChild.grade}</p>
          </div>
        </div>
      </div>

      {/* Subject Performance Breakdown for Student's Class */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">Class {selectedChild.grade} Subject Performance</h3>
            <p className="text-xs text-slate-500 mt-0.5">Subject-wise marks & performance breakdown</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            {subjectAverages.length} Subjects
          </span>
        </div>

        {subjectAverages.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No subjects configured for this class.</p>
        ) : (
          <div className="space-y-5">
            {subjectAverages.map((subject) => {
              const subjectTests = grades.filter(g => g.subject.toLowerCase() === subject.name.toLowerCase());
              return (
                <div key={subject.name} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <span className="font-extrabold text-slate-900 text-sm">{subject.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                        {subjectTests.length > 0 ? `${subjectTests.length} evaluation(s) recorded` : "Curriculum Subject"}
                      </span>
                    </div>
                    {subject.average !== null ? (
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm">{subject.average}%</span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border ${
                          subject.average >= 90 ? "bg-emerald-100 text-emerald-800 border-emerald-300" :
                          subject.average >= 75 ? "bg-blue-100 text-blue-800 border-blue-300" :
                          subject.average >= 60 ? "bg-amber-100 text-amber-800 border-amber-300" :
                          "bg-rose-100 text-rose-800 border-rose-300"
                        }`}>
                          {subject.average >= 90 ? "A+" : subject.average >= 75 ? "A" : subject.average >= 60 ? "B" : "C"}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200/80 px-2.5 py-1 rounded-lg border border-slate-300/60">
                        Evaluation Pending
                      </span>
                    )}
                  </div>
                  
                  <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden">
                    {subject.average !== null ? (
                      <div
                        className={`h-full rounded-full transition-all ${
                          subject.average >= 90
                            ? "bg-emerald-500"
                            : subject.average >= 75
                            ? "bg-blue-500"
                            : subject.average >= 60
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${subject.average}%` }}
                      />
                    ) : (
                      <div className="h-full rounded-full bg-slate-300/40 w-full animate-pulse" />
                    )}
                  </div>

                  {/* Test Scores Breakdown for this subject */}
                  {subjectTests.length > 0 ? (
                    <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {subjectTests.map((t, tidx) => (
                        <div key={tidx} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200/60 text-xs">
                          <div>
                            <span className="font-bold text-slate-700 block">{t.test}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{t.date}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-slate-900">{t.score} / {t.maxScore}</span>
                            <span className="text-[10px] font-bold text-emerald-600 block">
                              ({Math.round((t.score / t.maxScore) * 100)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 font-medium italic pt-1">
                      No test marks uploaded for {subject.name} yet.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed Grade Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 text-base mb-4">Detailed Grades Log</h3>
        {grades.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No grading transactions found.</p>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-200 text-left bg-slate-50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-4 py-3">Assessment Category</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3 text-center">Marks Obtained</th>
                  <th className="px-4 py-3 text-center">Grade Letter</th>
                  <th className="px-4 py-3 text-center">Exam Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {grades.map((grade, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-700">{grade.test}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium">{grade.subject}</td>
                    <td className="px-4 py-3 text-center font-bold text-slate-800">
                      {grade.score} <span className="text-xs font-normal text-slate-400">/{grade.maxScore}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${getGradeColor(grade.grade)}`}>
                        {grade.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-400 text-xs font-semibold">{grade.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Download Action Trigger */}
      {grades.length > 0 && (
        <button
          onClick={onDownloadReportCard}
          className="w-full h-12 bg-primary hover:bg-primary-light text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Download size={18} />
          Download Cumulative Report Card (PDF)
        </button>
      )}
    </div>
  );
}
