"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, GraduationCap, ArrowUp, Clock } from "lucide-react";
import { siteConfig } from "@/config/site.config";

// Custom SVG social icons
const SvgFacebook = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const SvgInstagram = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);
const SvgYoutube = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.95C18.88 4 12 4 12 4s-6.88 0-8.59.47a2.78 2.78 0 0 0-1.95 1.95C1 8.12 1 12 1 12s0 3.88.46 5.58a2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95C23 15.88 23 12 23 12s0-3.88-.46-5.58z" />
    <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
);
const SvgTwitter = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const SvgLinkedin = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

type SocialIcon = () => React.JSX.Element;
const socialIcons: Record<string, SocialIcon> = {
  facebook: SvgFacebook,
  instagram: SvgInstagram,
  youtube: SvgYoutube,
  twitter: SvgTwitter,
  linkedin: SvgLinkedin,
};

const quickLinks = [
  { href: "/about", label: "About Us" },
  { href: "/academics", label: "Academics" },
  { href: "/admissions", label: "Admissions" },
  { href: "/student-life", label: "Student Life" },
  { href: "/faculty", label: "Faculty" },
  { href: "/blog", label: "News & Blog" },
  { href: "/contact", label: "Contact Us" },
];

const portalLinks = [
  { href: "/portal/parent", label: "Parent Portal" },
  { href: "/portal/teacher", label: "Teacher Dashboard" },
  { href: "/portal/admin", label: "Admin Panel" },
];

export function Footer() {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="bg-primary text-white relative overflow-hidden">
      {/* Top gold accent line */}
      <div className="h-1 bg-gradient-to-r from-accent via-accent-light to-accent" />

      <div className="container-custom py-10 md:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8 md:gap-10">

          {/* Col 1 — School Info (Spans 2 cols on mobile, 1 on desktop) */}
          <div className="col-span-2 lg:col-span-1 flex flex-col items-start text-left space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-accent flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-lg shrink-0">
                {siteConfig.shortName.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-sm sm:text-base font-extrabold text-white leading-tight tracking-tight">{siteConfig.schoolName}</p>
                <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-0.5">{siteConfig.affiliationBoard} Affiliated · Est. {siteConfig.foundedYear}</p>
              </div>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-medium">{siteConfig.description}</p>
            <div className="flex items-center gap-2 pt-1">
              {Object.entries(siteConfig.socialLinks).map(([platform, url]) => {
                if (!url) return null;
                const SvgIcon = socialIcons[platform];
                if (!SvgIcon) return null;
                return (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" aria-label={platform}
                    className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white/70 hover:bg-accent hover:text-white hover:scale-105 transition-all duration-200"
                  >
                    <SvgIcon />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Col 2 — Quick Links (Left column on mobile 2-grid) */}
          <div className="col-span-1 flex flex-col items-start text-left">
            <h4 className="text-xs sm:text-sm font-extrabold text-white mb-3 sm:mb-4 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-1.5 h-3.5 bg-accent rounded-full inline-block" />
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs sm:text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors hover:translate-x-1 inline-block py-0.5">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Portals & Admissions (Right column on mobile 2-grid) */}
          <div className="col-span-1 flex flex-col items-start text-left">
            <h4 className="text-xs sm:text-sm font-extrabold text-white mb-3 sm:mb-4 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-1.5 h-3.5 bg-accent rounded-full inline-block" />
              Portals
            </h4>
            <ul className="space-y-2 mb-4 w-full">
              {portalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-xs sm:text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors hover:translate-x-1 inline-block py-0.5">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {siteConfig.admissionOpen && (
              <div className="p-3 sm:p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 w-full flex flex-col items-start backdrop-blur-sm space-y-1.5 shadow-inner">
                <div className="flex items-center gap-1.5">
                  <GraduationCap size={14} className="text-emerald-400" />
                  <span className="text-[11px] sm:text-xs font-bold text-emerald-300">Admissions Open</span>
                </div>
                <p className="text-[10px] text-slate-300 font-medium">Session {siteConfig.admissionYear}</p>
                <Link href="/admissions"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 px-3 py-1 rounded-lg transition-all shadow-md cursor-pointer mt-1"
                >
                  Apply →
                </Link>
              </div>
            )}
          </div>

          {/* Col 4 — Contact Us (Spans 2 cols on mobile, 1 on desktop) */}
          <div className="col-span-2 lg:col-span-1 flex flex-col items-start text-left pt-2 sm:pt-0 border-t border-white/10 lg:border-t-0">
            <h4 className="text-xs sm:text-sm font-extrabold text-white mb-3 sm:mb-4 flex items-center gap-2 uppercase tracking-wider">
              <span className="w-1.5 h-3.5 bg-accent rounded-full inline-block" />
              Contact Us
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 w-full">
              <a href={`tel:${siteConfig.phone}`} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors">
                <Phone size={15} className="shrink-0 text-emerald-400 mt-0.5" />
                <div>
                  <p>{siteConfig.phone}</p>
                  {siteConfig.altPhone && <p className="text-slate-400 text-xs mt-0.5">{siteConfig.altPhone}</p>}
                </div>
              </a>

              <a href={`mailto:${siteConfig.email}`} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 hover:text-emerald-400 font-medium transition-colors">
                <Mail size={15} className="shrink-0 text-emerald-400 mt-0.5" />
                <span className="break-all">{siteConfig.email}</span>
              </a>

              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 font-medium">
                <MapPin size={15} className="shrink-0 text-emerald-400 mt-0.5" />
                <span>{siteConfig.address}, {siteConfig.city}, {siteConfig.state} — {siteConfig.pincode}</span>
              </div>

              <div className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300 font-medium">
                <Clock size={15} className="shrink-0 text-emerald-400 mt-0.5" />
                <span>{siteConfig.workingHours}</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-slate-950/60">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-xs text-slate-400 font-medium">
            © {new Date().getFullYear()} {siteConfig.schoolName}. All rights reserved. <span className="hidden sm:inline mx-1.5 text-white/20">|</span> <br className="sm:hidden" /><span className="text-emerald-400 font-semibold tracking-wide">Powered by Team Axiogen</span>
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs text-slate-400 hover:text-white transition-colors font-medium">Privacy Policy</Link>
            <Link href="#" className="text-xs text-slate-400 hover:text-white transition-colors font-medium">Terms of Use</Link>
          </div>
        </div>
      </div>

      {/* Scroll-to-top */}
      <button onClick={scrollToTop} aria-label="Scroll to top"
        className="fixed bottom-6 right-6 w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-xl shadow-emerald-500/25 hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-40 cursor-pointer"
      >
        <ArrowUp size={18} className="stroke-[3]" />
      </button>
    </footer>
  );
}
