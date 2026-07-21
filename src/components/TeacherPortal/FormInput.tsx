import React from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  id: string;
}

export function FormInput({ label, error, id, ...props }: FormInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        id={id}
        className={`w-full px-3 py-2 border rounded-xl text-xs bg-slate-50 focus:outline-none transition-colors ${
          error ? "border-red-300 bg-red-50/50 focus:ring-red-100" : "border-border focus:ring-accent/30 focus:border-accent"
        }`}
        {...props}
      />
      {error && <p className="text-red-500 text-[10px] mt-1 font-semibold">{error}</p>}
    </div>
  );
}
