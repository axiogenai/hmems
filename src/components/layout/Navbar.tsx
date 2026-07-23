"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Mail, GraduationCap, LogIn, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site.config";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/academics", label: "Academics" },
  { href: "/admissions", label: "Admissions" },
  { href: "/student-life", label: "Student Life" },
  { href: "/faculty", label: "Faculty" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* ── Top Info Bar ── */}
      <div className="bg-primary text-white hidden md:block border-b border-white/5">
        <div className="container-custom flex items-center justify-between py-1 text-xs">
          <div className="flex items-center gap-5">
            <a href={`tel:${siteConfig.phone}`} className="flex items-center gap-1.5 text-slate-300 hover:text-accent-light transition-colors">
              <Phone size={12} className="text-accent" /> {siteConfig.phone}
            </a>
            <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-1.5 text-slate-300 hover:text-accent-light transition-colors">
              <Mail size={12} className="text-accent" /> {siteConfig.email}
            </a>
          </div>
          <div className="flex items-center gap-4">
            {siteConfig.admissionOpen && (
              <Link href="/admissions" className="flex items-center gap-1.5 px-3 py-1 bg-accent/20 border border-accent/40 text-accent-light font-bold rounded-full hover:bg-accent/30 transition-all text-[11px] tracking-wide">
                <GraduationCap size={12} /> Admissions Open {siteConfig.admissionYear}
              </Link>
            )}
            <span className="text-white/20">|</span>
            <Link href="/portal/parent" className="flex items-center gap-1.5 text-slate-300 hover:text-accent-light transition-colors font-medium">
              <LogIn size={12} className="text-accent" /> Parent Portal
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Navbar ── */}
      <nav className={`sticky top-0 z-50 transition-all duration-300 border-b ${isScrolled ? "bg-white/95 backdrop-blur-md shadow-md border-slate-200" : "bg-white border-slate-100 shadow-sm"}`}>
        <div className="container-custom flex items-center justify-between h-[60px]">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-bold text-lg shadow-md">
              {siteConfig.shortName.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm xl:text-base font-extrabold text-primary leading-tight tracking-tight">
                <span className="hidden sm:inline">{siteConfig.schoolName}</span>
                <span className="inline sm:hidden">{siteConfig.shortName}</span>
              </p>
              <p className="text-[9px] xl:text-[10px] text-muted font-bold uppercase tracking-wider">{siteConfig.affiliationBoard} Affiliated</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href}
                  className={`relative px-2.5 xl:px-3 py-2 text-xs xl:text-sm font-semibold transition-all duration-200 group ${
                    isActive ? "text-primary" : "text-slate-600 hover:text-primary"
                  }`}
                >
                  {link.label}
                  <span className={`absolute bottom-[-2px] left-2.5 xl:left-3 right-2.5 xl:right-3 h-[2px] bg-accent rounded-full transition-all duration-300 ${isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100"}`} />
                </Link>
              );
            })}
          </div>

          {/* Apply Now CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/admissions"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-accent hover:bg-accent-light text-white text-xs xl:text-sm font-semibold rounded-xl shadow-md hover:shadow-lg hover:translate-y-[-2px] transition-all cursor-pointer"
            >
              <GraduationCap size={15} /> Apply Now
            </Link>
          </div>

          {/* Mobile burger */}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-800 hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-accent/50" aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-xs bg-white z-50 shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
                      {siteConfig.shortName.charAt(0)}
                    </div>
                    <span className="font-bold text-primary text-sm">{siteConfig.shortName}</span>
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-xl hover:bg-muted-bg" aria-label="Close">
                    <X size={20} className="text-primary" />
                  </button>
                </div>

                <div className="space-y-1">
                  {navLinks.map((link, i) => {
                    const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                    return (
                      <motion.div key={link.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                        <Link href={link.href} onClick={() => setIsMobileMenuOpen(false)}
                          className={`block px-4 py-3 text-sm font-semibold rounded-xl transition-colors ${isActive ? "text-primary bg-slate-100" : "text-slate-600 hover:text-primary hover:bg-slate-50"}`}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="mt-8 space-y-3">
                  <Link href="/admissions" onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full h-12 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl text-base shadow hover:shadow-lg active:shadow-md hover:translate-y-[-2px] transition-all duration-200 cursor-pointer"
                  >
                    <GraduationCap size={16} /> Apply Now
                  </Link>
                  <Link href="/portal/parent" onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full h-12 border-2 border-primary text-primary font-semibold rounded-xl text-base hover:bg-primary hover:text-white hover:translate-y-[-2px] hover:shadow-md transition-all duration-200 cursor-pointer"
                  >
                    <LogIn size={16} /> Parent Portal
                  </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-border-custom space-y-3">
                  <a href={`tel:${siteConfig.phone}`} className="flex items-center gap-2 text-xs text-muted">
                    <Phone size={13} className="text-accent" /> {siteConfig.phone}
                  </a>
                  <a href={`mailto:${siteConfig.email}`} className="flex items-center gap-2 text-xs text-muted">
                    <Mail size={13} className="text-accent" /> {siteConfig.email}
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
