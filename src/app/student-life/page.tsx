"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, ChevronRight, Trophy, CalendarDays, Music, Palette, BookOpen,
  Dumbbell, Bot, MessageSquare, Leaf, Users, Star, X,
} from "lucide-react";
import { events, achievements, galleryImages, galleryCategories } from "@/data/site-data";

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

import { PageHeader } from "@/components/ui/PageHeader";

const clubs = [
  { icon: Dumbbell, name: "Cricket Club", desc: "Weekly practice sessions, inter-school tournaments, and state-level coaching." },
  { icon: Users, name: "Basketball Club", desc: "Indoor and outdoor courts with professional coaching for all age groups." },
  { icon: Music, name: "Dance & Music", desc: "Classical and contemporary dance, plus keyboard, guitar, and vocal training." },
  { icon: Palette, name: "Art & Craft", desc: "Painting, sculpture, pottery, and digital art with regular exhibitions." },
  { icon: Bot, name: "Robotics Club", desc: "Build and program robots using industry-grade kits and compete nationally." },
  { icon: MessageSquare, name: "Debate Society", desc: "Sharpen your oratory skills. Our team has won 3 consecutive district titles." },
  { icon: BookOpen, name: "Literary Club", desc: "Creative writing, poetry, book reviews, and the school literary magazine." },
  { icon: Leaf, name: "Eco Club", desc: "Campus greening initiatives, sustainability projects, and environmental awareness." },
];

const categoryGradients: Record<string, string> = {
  Campus: "from-blue-400 to-blue-600",
  Classrooms: "from-green-400 to-emerald-600",
  Sports: "from-orange-400 to-red-600",
  "Cultural Events": "from-purple-400 to-pink-600",
  "Science Lab": "from-cyan-400 to-blue-600",
  Library: "from-emerald-400 to-teal-600",
};

const eventCategoryColors: Record<string, string> = {
  Sports: "bg-accent/15 text-accent border border-accent/20",
  Academic: "bg-primary/10 text-primary border border-primary/20",
  Cultural: "bg-blue-50 text-blue-700 border border-blue-100",
  Meeting: "bg-slate-100 text-slate-700 border border-slate-200",
  National: "bg-slate-100 text-slate-700 border border-slate-200",
};

import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function StudentLifePage() {
  const [gallery] = useLocalStorage("cms_cultural_gallery", galleryImages);
  const [eventList] = useLocalStorage("cms_school_events", events);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);

  const filteredImages = activeCategory === "All"
    ? gallery
    : gallery.filter((img: any) => img.category === activeCategory);

  return (
    <div>
      <PageHeader
        title="Student Life"
        breadcrumb="Student Life"
        subtitle="Beyond the classroom — sports, arts, culture, and community that shape well-rounded individuals."
      />

      {/* -- Gallery -- */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent mb-3 px-4 py-1.5 bg-accent/10 rounded-full border border-accent/20">Gallery</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Campus Life in Pictures</h2>
            <div className="gold-line mt-3" />
          </div>
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {galleryCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-md"
                    : "bg-surface border border-border-custom text-muted hover:text-primary hover:border-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Grid */}
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {filteredImages.map((img, i) => {
                const gradient = categoryGradients[img.category] || "from-gray-400 to-gray-600";
                return (
                  <motion.div
                    key={img.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i * 0.03 }}
                    className="aspect-square rounded-2xl overflow-hidden cursor-pointer group relative"
                    onClick={() => setLightboxImage({ src: img.src, alt: img.alt })}
                  >
                    <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                      <p className="text-white text-center text-sm font-medium px-4 text-shadow">{img.alt}</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                        <Star size={16} className="text-white" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-2xl w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-white text-xl font-semibold">{lightboxImage.alt}</p>
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
              >
                <X size={18} className="text-white" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Clubs & Activities ──────────────────── */}
      <section className="section-padding bg-surface">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Clubs & Activities</h2>
            <div className="gold-line mt-3" />
            <p className="section-subtitle mt-4">15+ extracurricular activities to explore passions, build skills, and make lifelong friends.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {clubs.map((club, i) => (
              <FadeIn key={i} delay={i * 0.08} className="h-full">
                <div className="group bg-white rounded-3xl p-6 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:border-accent/40 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shrink-0">
                    <club.icon size={22} className="text-white" />
                  </div>
                  <h4 className="font-bold text-primary mb-2">{club.name}</h4>
                  <p className="text-sm text-[#475569] leading-relaxed flex-1">{club.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div></div>
      </section>

      {/* ── Events ──────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">School Events</h2>
            <div className="gold-line mt-3" />
          </div>
          <div className="space-y-4 max-w-3xl mx-auto">
            {events.map((event, i) => (
              <FadeIn key={event.id} delay={i * 0.08}>
                <div className="bg-white rounded-3xl border border-border shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden hover:shadow-xl transition-all duration-300">
                  <div className="flex items-stretch">
                    {/* Date Strip */}
                    <div className="bg-gradient-to-b from-primary to-secondary w-20 shrink-0 flex flex-col items-center justify-center py-4 px-3 text-white">
                      <span className="text-2xl font-bold">{new Date(event.date).getDate()}</span>
                      <span className="text-xs uppercase tracking-wide opacity-70">
                        {new Date(event.date).toLocaleString("en-IN", { month: "short" })}
                      </span>
                      <span className="text-xs opacity-50">{new Date(event.date).getFullYear()}</span>
                    </div>
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-bold text-primary">{event.title}</h4>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full border shrink-0 ${eventCategoryColors[event.category] || "bg-slate-100 text-slate-600"}`}>
                          {event.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{event.description}</p>
                      <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5 font-medium">
                        <CalendarDays size={12} className="text-slate-400" />
                        {event.time}
                      </p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Achievements Timeline ───────────────── */}
      <section className="section-padding bg-surface">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Our Achievements</h2>
            <div className="gold-line mt-3" />
          </div>
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute left-6 top-3 bottom-3 w-[3px] bg-gradient-to-b from-accent via-secondary to-primary -ml-[1.5px]" />
            <div className="space-y-6">
              {achievements.map((a, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <div className="flex gap-6 items-start relative">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0 shadow-md z-10 relative">
                      <Trophy size={20} className="text-white" />
                    </div>
                    <div className="bg-white rounded-3xl p-5 border border-border shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex-1 hover:shadow-xl transition-all duration-300">
                      <span className="text-xs font-bold text-accent">{a.year}</span>
                      <h4 className="font-bold text-primary mt-0.5">{a.title}</h4>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{a.description}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
