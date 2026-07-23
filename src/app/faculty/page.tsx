"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Home, ChevronRight, GraduationCap, Briefcase, Mail, Loader2 } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { fetchFacultyMembers } from "@/app/actions/auth";

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.6, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

const departments = ["All", "Administration", "Science", "Mathematics", "English", "Computer Science", "Sports", "Arts"];

const departmentGradients: Record<string, string> = {
  Administration: "from-emerald-500 to-emerald-700",
  Science: "from-blue-500 to-blue-700",
  Mathematics: "from-green-500 to-emerald-700",
  English: "from-purple-500 to-purple-700",
  "Computer Science": "from-cyan-500 to-blue-600",
  Sports: "from-red-500 to-rose-700",
  Arts: "from-pink-500 to-pink-700",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function FacultyCard({ member }: { member: any }) {
  const [hovered, setHovered] = useState(false);
  const gradient = departmentGradients[member.department] || "from-primary to-secondary";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl border border-border shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden group hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1.5 transition-all duration-300 relative h-full flex flex-col justify-between"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex flex-col h-full">
        {/* Visual Header Background Area */}
        <div className={`h-20 bg-gradient-to-br ${gradient} relative shrink-0 flex items-end justify-center`}>
          {/* Initials Avatar placed overlapping */}
          <div className={`absolute -bottom-8 w-16 h-16 rounded-full border-4 border-white bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg font-bold text-lg text-white`}>
            {getInitials(member.name)}
          </div>
        </div>

        <div className="p-5 pt-10 text-center flex flex-col items-center flex-1 justify-between">
          <div className="flex flex-col items-center">
            <h3 className="font-bold text-primary text-base leading-tight mt-1">{member.name}</h3>
            <p className="text-accent text-xs font-bold mt-1 tracking-wide uppercase">{member.role}</p>

            <span className={`inline-block mt-2.5 text-[10px] font-extrabold px-3 py-1 rounded-full border border-slate-100 bg-slate-50 text-slate-500`}>
              {member.department}
            </span>
          </div>

          <div className="mt-4 space-y-1.5 w-full border-t border-slate-100 pt-3">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <GraduationCap size={13} className="text-slate-400 shrink-0" />
              <span className="truncate max-w-[180px]">{member.qualification}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
              <Briefcase size={13} className="text-slate-400 shrink-0" />
              <span>{member.experience}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bio overlay on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-white/97 backdrop-blur-sm p-5 flex flex-col justify-center items-center text-center rounded-3xl"
          >
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-sm mb-3 shadow-md`}>
              {getInitials(member.name)}
            </div>
            <h4 className="font-bold text-primary text-sm">{member.name}</h4>
            <p className="text-accent text-xs font-bold mb-3 uppercase">{member.role}</p>
            <p className="text-xs text-slate-600 leading-relaxed max-w-[190px]">{member.bio}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FacultyPage() {
  const [activeDept, setActiveDept] = useState("All");
  const [facultyMembers, setFacultyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFaculty = async () => {
      try {
        const res = await fetchFacultyMembers();
        if (res.success && res.facultyList) {
          setFacultyMembers(res.facultyList);
        }
      } catch (err) {
        console.error("Failed to load faculty:", err);
      } finally {
        setLoading(false);
      }
    };
    loadFaculty();
  }, []);

  const filtered = activeDept === "All"
    ? facultyMembers
    : facultyMembers.filter((f) => f.department === activeDept);

  return (
    <div>
      {/* Header */}
      <section className="bg-primary py-4 md:py-5 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="container-custom relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-white">Our Faculty</h1>
            <div className="hidden md:block w-8 h-1 bg-accent rounded-full" />
            <p className="hidden lg:block text-white/70 text-sm ml-2">Meet our passionate educators.</p>
          </div>
          <nav className="flex items-center gap-2 text-white/50 text-xs font-medium">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1"><Home size={12} /> Home</Link>
            <ChevronRight size={12} />
            <span className="text-white/80">Faculty</span>
          </nav>
        </div>
      </section>

      {/* Department Filter */}
      <section className="bg-white border-b border-slate-200">
        <div className="container-custom py-3">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveDept(dept)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeDept === dept
                    ? "bg-primary text-white shadow-md"
                    : "bg-surface border border-border-custom text-muted hover:text-primary hover:border-primary"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Faculty Grid */}
      <section className="section-padding bg-surface">
        <div className="container-custom">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="animate-spin text-accent" size={32} />
              <p className="text-sm font-semibold">Loading faculty directory...</p>
            </div>
          ) : (
            <>
              <LayoutGroup>
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <AnimatePresence>
                    {filtered.map((member) => (
                      <FacultyCard key={member.id} member={member} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </LayoutGroup>
              {filtered.length === 0 && (
                <div className="text-center py-20 text-muted">No faculty members found in this category.</div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-16 bg-white">
        <FadeIn className="container-custom text-center">
          <div className="max-w-xl mx-auto bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl border border-border-custom p-10">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-5 shadow-lg">
              <GraduationCap size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-primary mb-3">Join Our Teaching Team</h2>
            <p className="text-muted text-sm leading-relaxed mb-6">
              We&apos;re always looking for passionate, qualified educators who share our vision of transforming young minds. If you&apos;re dedicated to making a difference, we&apos;d love to hear from you.
            </p>
            <a
              href={`mailto:${siteConfig.email}?subject=Teaching Position Inquiry`}
              className="inline-flex items-center gap-2 px-7 py-3 bg-accent text-white font-semibold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              <Mail size={18} />
              Send Your Resume
            </a>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
