"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { GraduationCap, ChevronRight, Star, ShieldCheck, Award, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site.config";

export function HeroSection() {
  const [heroBg, setHeroBg] = useState("/images/school-campus-hero.jpg");

  useEffect(() => {
    const saved = localStorage.getItem("hmems_hero_bg_image");
    if (saved) setHeroBg(saved);

    const handleUpdate = () => {
      const updated = localStorage.getItem("hmems_hero_bg_image");
      if (updated) setHeroBg(updated);
      else setHeroBg("/images/school-campus-hero.jpg");
    };

    window.addEventListener("hero_bg_updated", handleUpdate);
    return () => window.removeEventListener("hero_bg_updated", handleUpdate);
  }, []);

  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden bg-slate-950 text-white">
      {/* Full-width Background Campus Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroBg}
          alt={`${siteConfig.schoolName} Campus Background`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center transform scale-105 filter brightness-[0.80] contrast-[1.02]"
        />
        {/* MID-Level Balanced Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/55 via-transparent to-slate-950/25" />
      </div>

      {/* Subtle Grid Radial Pattern */}
      <div
        className="absolute inset-0 opacity-[0.05] z-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        aria-hidden="true"
      />

      <div className="container-custom px-4 md:px-6 lg:px-8 relative z-10 w-full">
        <div className="max-w-3xl space-y-6 md:space-y-8">
          
          {/* Affiliation & Heritage Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 rounded-full text-xs md:text-sm font-bold backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
            <GraduationCap size={16} className="text-emerald-400" />
            <span>{siteConfig.affiliationBoard} Affiliated</span>
            <span className="opacity-40">•</span>
            <span>Est. {siteConfig.foundedYear}</span>
          </div>

          {/* Main Hero Heading */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white leading-[1.15] sm:leading-[1.1] uppercase drop-shadow-md">
              {siteConfig.schoolName}
            </h1>
            <p className="text-lg md:text-3xl text-emerald-400 font-extrabold tracking-wide uppercase">
              {siteConfig.tagline}
            </p>
          </div>

          {/* School Description */}
          <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-2xl font-medium leading-relaxed drop-shadow-sm">
            {siteConfig.description}
          </p>

          {/* Call-to-Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
            <Link
              href="/admissions"
              className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-3.5 sm:py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-400/40 hover:-translate-y-0.5 transition-all text-sm sm:text-base tracking-wide cursor-pointer uppercase w-full sm:w-auto"
            >
              <GraduationCap size={20} />
              <span>Apply for {siteConfig.admissionYear}</span>
            </Link>

            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 border-2 border-white/30 hover:border-white text-white font-bold rounded-2xl backdrop-blur-md hover:-translate-y-0.5 transition-all text-sm sm:text-base tracking-wide cursor-pointer shadow-lg w-full sm:w-auto"
            >
              <span>Explore School</span>
              <ChevronRight size={18} />
            </Link>
          </div>

          {/* Social Proof & Rating Strip */}
          <div className="pt-4 flex flex-wrap items-center gap-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["A", "B", "C", "D"].map((letter) => (
                  <div
                    key={letter}
                    className="w-9 h-9 rounded-full bg-emerald-600 border-2 border-slate-950 flex items-center justify-center text-xs font-black text-white shadow-md"
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                  <span className="font-extrabold text-white text-sm ml-1">4.9/5</span>
                </div>
                <p className="text-xs text-slate-300 font-medium">Trusted by 2000+ happy parents</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-300 bg-white/5 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-sm">
              <Award size={16} className="text-amber-400" />
              <span>Top-Ranked Institution 2026</span>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Wave Transition */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M0 48H1440V16C1200 48 720 0 0 32V48Z" fill="#F8FAFC" />
        </svg>
      </div>
    </section>
  );
}
