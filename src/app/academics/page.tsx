"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Home, ChevronRight, BookOpen } from "lucide-react";
import { siteConfig } from "@/config/site.config";

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    className={className}
  >
    {children}
  </motion.div>
);

import { PageHeader } from "@/components/ui/PageHeader";

function DynamicIcon({ name, size = 20, className = "" }: { name: string; size?: number; className?: string }) {
  const Icon = ((LucideIcons as unknown) as Record<string, LucideIcon>)[name] || LucideIcons.BookOpen;
  return <Icon size={size} className={className} />;
}

const methodologies = [
  { icon: "Lightbulb", title: "Interactive Learning", desc: "Engaging, two-way teaching that encourages questions, discussion, and active participation." },
  { icon: "FlaskConical", title: "Project-Based Learning", desc: "Real-world projects and experiments that make learning tangible and meaningful." },
  { icon: "Monitor", title: "Digital Classrooms", desc: "Smart boards, LMS, and digital resources for a technology-enriched learning experience." },
  { icon: "Users", title: "Individual Attention", desc: "Small group activities and one-on-one mentoring ensure no student is left behind." },
  { icon: "BarChart3", title: "Regular Assessment", desc: "Continuous evaluation through tests, projects, and observations to track progress." },
  { icon: "Globe", title: "Holistic Development", desc: "Beyond academics — sports, arts, and life skills for complete personality development." },
];

const streamSubjects = {
  Science: ["Physics", "Chemistry", "Biology", "Mathematics", "Computer Science", "English", "Physical Education"],
  Commerce: ["Accountancy", "Business Studies", "Economics", "Mathematics", "Informatics Practices", "English"],
  Arts: ["History", "Political Science", "Geography", "Psychology", "Sociology", "English", "Fine Arts"],
};

const calendarItems = [
  { month: "June 2026", events: ["School Reopens — June 15", "Orientation for New Students — June 16-17"] },
  { month: "July 2026", events: ["Unit Test 1 — July 15-22", "Parent-Teacher Meeting — July 28"] },
  { month: "August 2026", events: ["Independence Day — Aug 15", "Annual Sports Day — Aug 20", "Science Exhibition — Aug 28"] },
  { month: "September 2026", events: ["Mid-Term Exams — Sep 8-20", "Report Card Distribution — Sep 25"] },
  { month: "October 2026", events: ["Dussehra Break — Oct 2-6", "Diwali Fest — Oct 25", "Unit Test 2 — Oct 28-31"] },
  { month: "November 2026", events: ["Annual Day Celebration — Nov 15", "Pre-Board Exams (X & XII) — Nov 20-30"] },
];

export default function AcademicsPage() {
  const [activeStream, setActiveStream] = useState<keyof typeof streamSubjects>("Science");

  return (
    <div>
      <PageHeader title="Academics" breadcrumb="Academics" />

      {/* ── Curriculum Overview ───────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent mb-3 px-4 py-1.5 bg-accent/10 rounded-full border border-accent/20">Curriculum</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary">
              {siteConfig.affiliationBoard} Curriculum Overview
            </h2>
            <div className="gold-line mt-3" />
            <p className="section-subtitle mt-4">
              Comprehensive education from Pre-Primary through Senior Secondary, following the {siteConfig.affiliationBoard} framework with our unique pedagogical approach.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {siteConfig.grades.map((g, i) => {
              const colors = [
                "from-pink-400 to-rose-600",
                "from-blue-400 to-blue-700",
                "from-green-400 to-emerald-600",
                "from-purple-400 to-purple-700",
                "from-emerald-400 to-teal-600",
              ];
              return (
                <FadeIn key={i} delay={i * 0.1} className="h-full">
                  <div className="bg-white rounded-3xl border border-border shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col">
                    <div className="p-5 text-center flex-1 flex flex-col items-center justify-between">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[i]} flex items-center justify-center mx-auto mb-3 shrink-0`}>
                        <BookOpen size={20} className="text-white" />
                      </div>
                      <h4 className="font-bold text-primary text-sm">{g.level}</h4>
                      <p className="text-xs text-slate-500 mt-1 leading-normal">{g.classes}</p>
                      <p className="text-xs font-semibold text-accent mt-3 bg-accent/10 rounded-full px-3 py-1 shrink-0">{g.ageGroup}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Teaching Methodology ─────────────────── */}
      <section className="section-padding bg-surface">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Our Teaching Approach</h2>
            <div className="gold-line mt-3" />
            <p className="section-subtitle mt-4">Modern pedagogy that makes learning engaging, effective, and enjoyable.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {methodologies.map((m, i) => (
              <FadeIn key={i} delay={i * 0.1} className="h-full">
                <div className="group bg-white rounded-3xl p-6 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:border-accent/40 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shrink-0">
                    <DynamicIcon name={m.icon} size={20} className="text-white" />
                  </div>
                  <h4 className="font-bold text-primary mb-2">{m.title}</h4>
                  <p className="text-sm text-[#475569] leading-relaxed flex-1">{m.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Subjects by Stream ────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Senior Secondary Streams</h2>
            <div className="gold-line mt-3" />
            <p className="section-subtitle mt-4">Choose from Science, Commerce, or Arts for Class XI–XII.</p>
          </div>
          <FadeIn>
            <div className="bg-surface rounded-3xl border border-border-custom overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-border-custom">
                {(Object.keys(streamSubjects) as (keyof typeof streamSubjects)[]).map((stream) => (
                  <button
                    key={stream}
                    onClick={() => setActiveStream(stream)}
                    className={`flex-1 py-4 text-sm font-semibold transition-all ${
                      activeStream === stream
                        ? "bg-primary text-white"
                        : "text-muted hover:text-primary hover:bg-muted-bg"
                    }`}
                  >
                    {stream}
                  </button>
                ))}
              </div>
              <div className="p-8">
                <div className="flex flex-wrap gap-3">
                  {streamSubjects[activeStream].map((sub, i) => (
                    <motion.span
                      key={sub}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-4 py-2 bg-white border border-border-custom rounded-xl text-sm font-medium text-primary hover:border-accent hover:text-accent transition-colors"
                    >
                      {sub}
                    </motion.span>
                  ))}
                </div>
                <p className="text-xs text-muted mt-6">* Subject combinations may vary. Please contact admissions for exact combinations available.</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Facilities ────────────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Academic Facilities</h2>
            <div className="gold-line mt-3" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {siteConfig.facilities.map((f, i) => (
              <FadeIn key={i} delay={i * 0.07} className="h-full">
                <div className="bg-white rounded-3xl p-5 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.08)] text-center hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group h-full flex flex-col items-center">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-secondary/10 to-primary/10 group-hover:from-accent/20 group-hover:to-accent-light/10 flex items-center justify-center mx-auto mb-3 transition-colors shrink-0">
                    <DynamicIcon name={f.icon} size={20} className="text-secondary group-hover:text-accent transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold text-primary">{f.name}</h4>
                  <p className="text-xs text-[#475569] mt-1 leading-relaxed flex-1">{f.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Academic Calendar ─────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Academic Calendar 2026–27</h2>
            <div className="gold-line mt-3" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {calendarItems.map((item, i) => (
              <FadeIn key={i} delay={i * 0.1} className="h-full">
                <div className="bg-white rounded-3xl border border-border shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden h-full flex flex-col hover:shadow-xl transition-all duration-300">
                  <div className="bg-gradient-to-r from-primary to-secondary px-5 py-3 shrink-0">
                    <p className="text-white font-semibold text-sm">{item.month}</p>
                  </div>
                  <ul className="p-4 space-y-2 flex-1 bg-gradient-to-b from-white to-slate-50/50">
                    {item.events.map((ev, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                        {ev}
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
