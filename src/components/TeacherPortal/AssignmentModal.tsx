import React, { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { FormInput } from "./FormInput";

export interface Assignment {
  id: number;
  title: string;
  dueDate: string;
  submitted: number;
  total: number;
  status: "Active" | "Draft" | "Completed";
}

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (assignment: { title: string; dueDate: string; total: number; status: "Active" | "Draft" | "Completed" }) => void;
  editAssignment?: Assignment | null;
  defaultTotal?: number;
}

const MAX_ASSIGNMENT_TITLE_LENGTH = 100;

export const AssignmentModal = memo(function AssignmentModal({
  isOpen,
  onClose,
  onSubmit,
  editAssignment,
  defaultTotal = 35,
}: AssignmentModalProps) {
  const modalRef = useFocusTrap(isOpen, onClose);
  const [formData, setFormData] = useState({
    title: "",
    dueDate: "",
    total: 35,
    status: "Active" as "Active" | "Draft" | "Completed",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editAssignment) {
      setFormData({
        title: editAssignment.title,
        dueDate: editAssignment.dueDate,
        total: editAssignment.total,
        status: editAssignment.status,
      });
    } else {
      setFormData({
        title: "",
        dueDate: "",
        total: defaultTotal,
        status: "Active",
      });
    }
    setErrors({});
  }, [editAssignment, isOpen, defaultTotal]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Assignment title is required";
    } else if (formData.title.length > MAX_ASSIGNMENT_TITLE_LENGTH) {
      newErrors.title = `Title must be ${MAX_ASSIGNMENT_TITLE_LENGTH} characters or less`;
    }

    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    if (formData.total <= 0) {
      newErrors.total = "Total students must be greater than 0";
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
        aria-labelledby="assignment-modal-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h4 id="assignment-modal-title" className="font-bold text-slate-800 text-sm">
            {editAssignment ? "Edit Homework Assignment" : "Post New Assignment"}
          </h4>
          <button
            onClick={onClose}
            aria-label="Close assignment modal"
            className="text-xl hover:text-red-500 font-bold transition-colors cursor-pointer"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            id="assignment-title"
            label="Assignment Title"
            type="text"
            placeholder="E.g., Chapter 8 Exercise 3.2"
            value={formData.title}
            onChange={(e) => {
              setFormData({ ...formData, title: e.target.value });
              if (errors.title) setErrors({ ...errors, title: "" });
            }}
            error={errors.title}
            maxLength={MAX_ASSIGNMENT_TITLE_LENGTH}
            required
          />

          <div>
            <label htmlFor="assignment-date" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Due Date
            </label>
            <input
              id="assignment-date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => {
                setFormData({ ...formData, dueDate: e.target.value });
                if (errors.dueDate) setErrors({ ...errors, dueDate: "" });
              }}
              className={`w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:outline-none transition-colors ${
                errors.dueDate ? "border-red-300 bg-red-50/50" : "border-border focus:ring-accent/30 focus:border-accent"
              }`}
              required
            />
            {errors.dueDate && <p className="text-red-500 text-[10px] mt-1 font-semibold">{errors.dueDate}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="assignment-total"
              label="Total Students"
              type="number"
              value={formData.total}
              onChange={(e) => {
                setFormData({ ...formData, total: Number(e.target.value) });
                if (errors.total) setErrors({ ...errors, total: "" });
              }}
              error={errors.total}
              required
            />
            <div>
              <label htmlFor="assignment-status" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Initial Status
              </label>
              <select
                id="assignment-status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-border rounded-xl text-xs bg-slate-50 focus:outline-none"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary-light transition-colors mt-2 cursor-pointer"
          >
            {editAssignment ? "Update Assignment" : "Publish to Stream"}
          </button>
        </form>
      </motion.div>
    </div>
  );
});
