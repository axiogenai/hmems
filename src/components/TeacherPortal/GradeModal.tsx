import React, { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { FormInput } from "./FormInput";

export interface Grade {
  id: string;
  student: string;
  test: string;
  subject: string;
  score: number;
  maxScore: number;
}

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (grade: { student: string; test: string; subject: string; score: number; maxScore: number }) => void;
  students: { name: string }[];
  editGrade?: Grade | null;
  defaultSubject?: string;
}

export const GradeModal = memo(function GradeModal({
  isOpen,
  onClose,
  onSubmit,
  students,
  editGrade,
  defaultSubject = "Mathematics",
}: GradeModalProps) {
  const modalRef = useFocusTrap(isOpen, onClose);
  const [formData, setFormData] = useState({
    student: "",
    test: "Unit Test 3",
    subject: "Mathematics",
    score: 80,
    maxScore: 100,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editGrade) {
      setFormData({
        student: editGrade.student,
        test: editGrade.test,
        subject: editGrade.subject,
        score: editGrade.score,
        maxScore: editGrade.maxScore,
      });
    } else {
      setFormData({
        student: "",
        test: "Unit Test 3",
        subject: defaultSubject,
        score: 80,
        maxScore: 100,
      });
    }
    setErrors({});
  }, [editGrade, isOpen, defaultSubject]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.student) {
      newErrors.student = "Please select a student";
    }
    if (formData.score < 0 || formData.score > formData.maxScore) {
      newErrors.score = `Score must be between 0 and ${formData.maxScore}`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        ref={modalRef}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="grade-modal-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h4 id="grade-modal-title" className="font-bold text-slate-800 text-sm">
            {editGrade ? "Edit Student Score" : "Add New Student Score"}
          </h4>
          <button
            onClick={onClose}
            aria-label="Close grade modal"
            className="text-xl hover:text-red-500 font-bold transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="student-select" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Student Name
            </label>
            <select
              id="student-select"
              value={formData.student}
              onChange={(e) => {
                setFormData({ ...formData, student: e.target.value });
                if (errors.student) setErrors({ ...errors, student: "" });
              }}
              className={`w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:outline-none transition-colors ${
                errors.student ? "border-red-300 bg-red-50/50" : "border-border focus:ring-accent/30 focus:border-accent"
              }`}
            >
              <option value="">Select Student</option>
              {students.map((s, idx) => (
                <option key={idx} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
            {errors.student && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.student}</p>}
          </div>

          <div>
            <label htmlFor="test-select" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Assessment Name
            </label>
            <select
              id="test-select"
              value={formData.test}
              onChange={(e) => setFormData({ ...formData, test: e.target.value })}
              className="w-full px-3 py-2 border border-border rounded-xl text-xs bg-slate-50 focus:outline-none"
            >
              <option value="Unit Test 3">Unit Test 3</option>
              <option value="Mid-Term Exams">Mid-Term Exams</option>
              <option value="Unit Test 2">Unit Test 2</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="score-input"
              label="Obtained Marks"
              type="number"
              min={0}
              max={formData.maxScore}
              value={formData.score}
              onChange={(e) => {
                setFormData({ ...formData, score: Number(e.target.value) });
                if (errors.score) setErrors({ ...errors, score: "" });
              }}
              error={errors.score}
              required
            />
            <div>
              <label htmlFor="max-score-input" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Maximum Marks
              </label>
              <input
                id="max-score-input"
                type="number"
                value={formData.maxScore}
                disabled
                className="w-full px-3 py-2 border border-border rounded-xl text-xs bg-slate-100 text-slate-400 focus:outline-none"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-light transition-colors mt-2 cursor-pointer"
          >
            {editGrade ? "Update Grade Card" : "Log Grade Card"}
          </button>
        </form>
      </motion.div>
    </div>
  );
});
