import React from "react";
import Link from "next/link";
import { Home, ChevronRight } from "lucide-react";

interface PageHeaderProps {
  title: string;
  breadcrumb: string;
  subtitle?: string;
}

export function PageHeader({ title, breadcrumb, subtitle }: PageHeaderProps) {
  return (
    <section className="bg-primary py-4 md:py-5 relative overflow-hidden border-t border-white/5">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="container-custom relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-white/70 text-sm max-w-xl">{subtitle}</p>}
          </div>
          <div className="hidden md:block w-8 h-1 bg-accent rounded-full shrink-0" />
        </div>
        <nav className="flex items-center gap-2 text-white/50 text-xs font-medium">
          <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
            <Home size={12} /> Home
          </Link>
          <ChevronRight size={12} />
          <span className="text-white/80">{breadcrumb}</span>
        </nav>
      </div>
    </section>
  );
}
