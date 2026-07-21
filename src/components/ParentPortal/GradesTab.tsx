import React, { useMemo } from "react";
import { Download, Award, ShieldAlert, CheckCircle } from "lucide-react";
import { StudentProfile, ChildGrade } from "@/types/parent-portal";

interface GradesTabProps {
  selectedChild: StudentProfile;
  grades: ChildGrade[];
  onDownloadReportCard: () => void;
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

  // Group and compute averages per subject
  const subjectAverages = useMemo(() => {
    const subjectsMap: Record<string, { total: number; count: number }> = {};
    grades.forEach((g) => {
      if (!subjectsMap[g.subject]) {
        subjectsMap[g.subject] = { total: 0, count: 0 };
      }
      subjectsMap[g.subject].total += (g.score / g.maxScore) * 100;
      subjectsMap[g.subject].count += 1;
    });

    return Object.entries(subjectsMap).map(([name, data]) => ({
      name,
      average: Math.round(data.total / data.count),
    }));
  }, [grades]);

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
            <p className="text-[9px] text-slate-400 font-semibold">Out of 35 students</p>
          </div>
        </div>
      </div>

      {/* Subject Averages Progress Bars */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-800 text-base mb-6">Subject Averages Progress</h3>
        {subjectAverages.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No graded subjects logged yet.</p>
        ) : (
          <div className="space-y-4">
            {subjectAverages.map((subject) => (
              <div key={subject.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">{subject.name}</span>
                  <span className="font-extrabold text-slate-800">{subject.average}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      subject.average >= 90
                        ? "bg-emerald-500"
                        : subject.average >= 80
                        ? "bg-blue-500"
                        : subject.average >= 70
                        ? "bg-accent/100"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${subject.average}%` }}
                  />
                </div>
              </div>
            ))}
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
