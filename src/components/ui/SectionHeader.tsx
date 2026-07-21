import React from "react";

interface SectionHeaderProps {
  label?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center" | "right";
}

export function SectionHeader({
  label,
  title,
  subtitle,
  align = "center",
}: SectionHeaderProps) {
  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center",
    right: "text-right items-end",
  };

  const lineClasses = {
    left: "gold-line-left mx-0",
    center: "gold-line mx-auto",
    right: "gold-line mr-0 ml-auto",
  };

  return (
    <div className={`flex flex-col mb-12 ${alignmentClasses[align]}`}>
      {label && (
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 px-4 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
          {label}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A]">
        {title}
      </h2>
      <div className={`${lineClasses[align]} mt-3`} />
      {subtitle && (
        <p className="text-gray-600 mt-4 max-w-2xl text-sm md:text-base leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
