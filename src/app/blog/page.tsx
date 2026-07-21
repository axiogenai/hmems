"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Home, ChevronRight, ArrowRight, CalendarDays } from "lucide-react";
import { blogPosts } from "@/data/site-data";

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

const categoryColors: Record<string, string> = {
  Achievements: "bg-green-100 text-green-700",
  Infrastructure: "bg-blue-100 text-blue-700",
  Admissions: "bg-emerald-100 text-emerald-700",
  Academic: "bg-purple-100 text-purple-700",
};

const categoryGradients = [
  "from-blue-400 to-blue-600",
  "from-green-400 to-emerald-600",
  "from-purple-400 to-pink-600",
  "from-emerald-400 to-teal-600",
];

const allCategories = ["All", ...Array.from(new Set(blogPosts.map((p) => p.category)))];

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? blogPosts
    : blogPosts.filter((p) => p.category === activeCategory);

  return (
    <div>
      {/* Header */}
      <section className="bg-primary py-4 md:py-5 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="container-custom relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold text-white">News & Blog</h1>
            <div className="hidden md:block w-8 h-1 bg-accent rounded-full" />
            <p className="hidden lg:block text-white/70 text-sm ml-2">Stories from our community.</p>
          </div>
          <nav className="flex items-center gap-2 text-white/50 text-xs font-medium">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1"><Home size={12} /> Home</Link>
            <ChevronRight size={12} />
            <span className="text-white/80">News & Blog</span>
          </nav>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="container-custom py-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === cat
                    ? "bg-primary text-white shadow-md"
                    : "bg-surface border border-border-custom text-muted hover:text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Grid */}
      <section className="section-padding bg-surface">
        <div className="container-custom">
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {filtered.map((post, i) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Link href={`/blog/${post.slug}`} className="group block bg-white rounded-2xl border border-border-custom overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                    {/* Image placeholder */}
                    <div className={`h-48 bg-gradient-to-br ${categoryGradients[i % categoryGradients.length]} relative overflow-hidden`}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-white text-lg font-bold text-center px-6 leading-tight">{post.title}</p>
                      </div>
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${categoryColors[post.category] || "bg-gray-100 text-gray-600"}`}>
                          {post.category}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-muted">
                          <CalendarDays size={12} />
                          {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <h3 className="font-bold text-primary text-base mb-2 group-hover:text-accent transition-colors leading-snug">{post.title}</h3>
                      <p className="text-sm text-muted leading-relaxed mb-4">{post.excerpt}</p>
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent group-hover:gap-2.5 transition-all">
                        Read More <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
