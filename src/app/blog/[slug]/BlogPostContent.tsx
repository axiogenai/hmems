"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarDays, User, Tag } from "lucide-react";
import { blogPosts } from "@/data/site-data";

const categoryColors: Record<string, string> = {
  Achievements: "bg-green-100 text-green-700",
  Infrastructure: "bg-blue-100 text-blue-700",
  Admissions: "bg-amber-100 text-amber-700",
  Academic: "bg-purple-100 text-purple-700",
};

export default function BlogPostContent({ slug }: { slug: string }) {
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center">
          <p className="text-6xl font-bold text-primary mb-4">404</p>
          <h1 className="text-2xl font-bold text-primary mb-2">Post Not Found</h1>
          <p className="text-muted mb-6">This blog post doesn&apos;t exist or has been removed.</p>
          <Link href="/blog" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  // Parse content into paragraphs
  const paragraphs = post.content.split("\n\n").filter(Boolean);

  return (
    <div>
      {/* Header */}
      <section className="bg-primary py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="container-custom relative z-10 max-w-4xl">
          <Link href="/blog" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
          <div className="flex flex-wrap gap-3 mb-4">
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${categoryColors[post.category] || "bg-gray-100 text-gray-600"}`}>
              {post.category}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-5 text-white/60 text-sm">
            <span className="flex items-center gap-1.5">
              <CalendarDays size={14} />
              {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1.5">
              <User size={14} />
              {post.author}
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-3xl border border-border-custom p-8 md:p-12 shadow-sm"
          >
            {/* Excerpt callout */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-5 border-l-4 border-accent mb-8">
              <p className="text-foreground/80 font-medium italic">{post.excerpt}</p>
            </div>

            {/* Body paragraphs */}
            <div className="prose max-w-none">
              {paragraphs.map((para, i) => {
                // Handle headings (## )
                if (para.startsWith("## ")) {
                  return (
                    <h2 key={i} className="text-2xl font-bold text-primary mt-8 mb-4">
                      {para.replace("## ", "")}
                    </h2>
                  );
                }
                // Handle tables (| ... |)
                if (para.trim().startsWith("|")) {
                  const rows = para.trim().split("\n").filter((r) => !r.match(/^\|[-| ]+\|$/));
                  return (
                    <div key={i} className="overflow-x-auto my-6">
                      <table className="w-full border-collapse border border-border-custom rounded-xl overflow-hidden text-sm">
                        {rows.map((row, ri) => {
                          const cells = row.split("|").filter((c) => c.trim());
                          const isHeader = ri === 0;
                          return (
                            <tr key={ri} className={isHeader ? "bg-primary text-white" : ri % 2 === 0 ? "" : "bg-muted-bg/30"}>
                              {cells.map((cell, ci) =>
                                isHeader ? (
                                  <th key={ci} className="px-4 py-3 text-left text-xs font-semibold uppercase">{cell.trim()}</th>
                                ) : (
                                  <td key={ci} className="px-4 py-3 border-t border-border-custom text-muted">{cell.trim()}</td>
                                )
                              )}
                            </tr>
                          );
                        })}
                      </table>
                    </div>
                  );
                }
                // Handle bullet lists (- item)
                if (para.includes("\n- ") || para.startsWith("- ")) {
                  const items = para.split("\n- ").map((s) => s.replace(/^- /, "").trim()).filter(Boolean);
                  return (
                    <ul key={i} className="my-4 space-y-2">
                      {items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-muted text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                          <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, "<strong class='text-primary'>$1</strong>") }} />
                        </li>
                      ))}
                    </ul>
                  );
                }
                // Regular paragraph
                return (
                  <p key={i} className="text-muted leading-relaxed mb-4 text-sm"
                    dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, "<strong class='text-primary font-semibold'>$1</strong>") }}
                  />
                );
              })}
            </div>
          </motion.div>

          {/* Back link */}
          <div className="mt-8 text-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 px-7 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors"
            >
              <ArrowLeft size={16} /> Back to All Posts
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
