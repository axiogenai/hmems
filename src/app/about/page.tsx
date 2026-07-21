"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/PageHeader";
import { Home, Target, Eye, Heart, Award, ChevronRight } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { achievements } from "@/data/site-data";

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


const milestones = [
  { year: "1995", title: "School Founded", desc: "Established with a vision to provide quality education to the community." },
  { year: "2000", title: "SCC Board Affiliation", desc: "Officially affiliated with the State Board of Secondary Education (SCC)." },
  { year: "2005", title: "New Campus", desc: "Moved to our current modern campus with state-of-the-art facilities." },
  { year: "2012", title: "Senior Secondary", desc: "Launched Science, Commerce, and Arts streams for Class XI–XII." },
  { year: "2019", title: "Smart Classrooms", desc: "Digitized all classrooms with interactive boards and LMS integration." },
  { year: "2024", title: "Best School Award", desc: "Recognized as the Best School in the district by the Education Board." },
];

export default function AboutPage() {
  return (
    <div>
      <PageHeader title="About Us" breadcrumb="About Us" />

      {/* ── School Story ────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent mb-3 px-4 py-1.5 bg-accent/10 rounded-full border border-accent/20">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-bold text-primary mb-5">
                {siteConfig.foundedYear > 2000 ? "A Modern" : "A Legacy of"} Educational Excellence
              </h2>
              <div className="prose text-muted text-base leading-relaxed space-y-4">
                <p>
                  Founded in {siteConfig.foundedYear}, {siteConfig.schoolName} has been a beacon of quality education in {siteConfig.city}. Over the years, we have grown from a small institution into a thriving school community of over {siteConfig.stats[1].value}{siteConfig.stats[1].suffix} students and {siteConfig.stats[2].value}{siteConfig.stats[2].suffix} dedicated educators.
                </p>
                <p>
                  Our journey has been defined by an unwavering commitment to academic excellence, character development, and preparing young minds for the challenges of tomorrow. We are proudly affiliated with {siteConfig.affiliationBoard} and maintain the highest standards in education.
                </p>
                <p>
                  {siteConfig.mission}
                </p>
              </div>
              <div className="mt-6 flex gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{new Date().getFullYear() - siteConfig.foundedYear}+</p>
                  <p className="text-xs text-muted">Years of Excellence</p>
                </div>
                <div className="w-px bg-border-custom" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{siteConfig.stats[3].value}{siteConfig.stats[3].suffix}</p>
                  <p className="text-xs text-muted">Board Pass Rate</p>
                </div>
                <div className="w-px bg-border-custom" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-accent">{siteConfig.stats[2].value}{siteConfig.stats[2].suffix}</p>
                  <p className="text-xs text-muted">Expert Faculty</p>
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2} className="relative pt-4 pr-4">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden bg-surface border border-border-custom flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-2xl">
                    <span className="text-3xl font-bold text-white">{siteConfig.shortName}</span>
                  </div>
                  <p className="text-muted text-sm">Est. {siteConfig.foundedYear}</p>
                  <p className="text-primary font-semibold text-base mt-2 leading-snug max-w-[180px] mx-auto">{siteConfig.schoolName}</p>
                </div>
              </div>
              {/* Floating badge — inset so it never clips */}
              <div className="absolute bottom-0 right-0 bg-white rounded-2xl px-4 py-3 shadow-xl border border-border-custom">
                <p className="text-[10px] text-muted uppercase tracking-wider">Est.</p>
                <p className="text-2xl font-bold text-primary leading-none">{siteConfig.foundedYear}</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Mission / Vision / Values ───────────────── */}
      <section className="section-padding bg-surface">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Our Foundation</h2>
            <div className="gold-line mt-3" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Target, label: "Mission", color: "from-blue-500 to-blue-700", bg: "from-blue-50 to-blue-100/30", border: "border-blue-200", text: siteConfig.mission },
              { icon: Eye, label: "Vision", color: "from-purple-500 to-purple-700", bg: "from-purple-50 to-purple-100/30", border: "border-purple-200", text: siteConfig.vision },
              { icon: Heart, label: "Values", color: "from-rose-500 to-rose-700", bg: "from-rose-50 to-rose-100/30", border: "border-rose-200", text: siteConfig.values.map(v => v.title).join(" · ") },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.15} className="h-full">
                <div className={`rounded-2xl p-6 border bg-gradient-to-br ${item.bg} ${item.border} h-full flex flex-col`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-md shrink-0`}>
                    <item.icon size={22} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3">{item.label}</h3>
                  <p className="text-sm text-muted leading-relaxed flex-1">{item.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Principal's Message ─────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Principal&apos;s Message</h2>
            <div className="gold-line mt-3" />
          </div>
          <FadeIn>
            <div className="relative bg-white rounded-3xl p-8 md:p-12 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <div className="text-8xl text-accent/10 font-serif absolute top-4 left-6 leading-none select-none">&ldquo;</div>
              <div className="relative z-10">
                <p className="text-lg md:text-xl text-slate-700 leading-relaxed italic mb-8">
                  Education is not the filling of a pail, but the lighting of a fire. At {siteConfig.schoolName}, we believe every child carries within them an extraordinary potential. Our role as educators is to kindle that spark — to inspire curiosity, build resilience, and nurture the values that will guide them throughout their lives.
                  <br /><br />
                  We are committed to creating an environment where academic rigor meets compassionate mentorship, where every student feels seen, valued, and empowered to achieve greatness.
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">SK</div>
                  <div>
                    <p className="font-bold text-primary text-lg">Dr. Sanjay Kumar</p>
                    <p className="text-slate-500 text-sm">Principal, {siteConfig.schoolName}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Ph.D. in Education · 25 Years Experience</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Timeline ───────────────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Our Journey</h2>
            <div className="gold-line mt-3" />
            <p className="section-subtitle mt-4">Milestones that shaped who we are today.</p>
          </div>
          <div className="relative max-w-4xl mx-auto">
            {/* Center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[3px] bg-primary hidden md:block -ml-[1.5px]" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className={`flex gap-6 items-start md:items-center ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                    <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                      <div className={`bg-white rounded-3xl p-5 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-xl transition-all duration-300 ${i % 2 === 0 ? "md:ml-8" : "md:mr-8"}`}>
                        <span className="inline-block text-xs font-bold text-accent bg-accent/10 px-3 py-1 rounded-full mb-2">{m.year}</span>
                        <h4 className="font-bold text-primary">{m.title}</h4>
                        <p className="text-sm text-slate-600 mt-1">{m.desc}</p>
                      </div>
                    </div>
                    {/* Dot */}
                    <div className="hidden md:flex w-4 h-4 rounded-full bg-accent border-4 border-white shadow-md shrink-0 z-10" />
                    <div className="flex-1 hidden md:block" />
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Achievements ──────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Our Achievements</h2>
            <div className="gold-line mt-3" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {achievements.map((a, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="group bg-white rounded-3xl p-5 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:border-accent/40 hover:shadow-xl transition-all duration-300 h-full">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0 shadow-sm">
                      <Award size={20} className="text-white" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-accent">{a.year}</span>
                      <h4 className="font-bold text-primary mt-0.5">{a.title}</h4>
                      <p className="text-sm text-slate-600 mt-1">{a.description}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
