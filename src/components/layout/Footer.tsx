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

      <div className="container-custom py-8 md:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">

          {/* Col 1 — School Info */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center text-white font-bold text-lg shadow-lg shrink-0">
                {siteConfig.shortName.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-white leading-tight">{siteConfig.schoolName}</p>
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">{siteConfig.affiliationBoard} Affiliated</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-5">{siteConfig.description}</p>
            <div className="flex items-center gap-2.5">
              {Object.entries(siteConfig.socialLinks).map(([platform, url]) => {
                if (!url) return null;
                const SvgIcon = socialIcons[platform];
                if (!SvgIcon) return null;
                return (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" aria-label={platform}
                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white/60 hover:bg-accent hover:text-white hover:scale-110 transition-all duration-200"
                  >
                    <SvgIcon />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Col 2 — Quick Links */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-0.5 h-4 bg-accent rounded-full inline-block" />
              Quick Links
            </h4>
            <ul className="space-y-1.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[13px] text-slate-300 hover:text-accent-light transition-colors hover:translate-x-1 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Portals */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-0.5 h-4 bg-accent rounded-full inline-block" />
              Portals
            </h4>
            <ul className="space-y-1.5 mb-4">
              {portalLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-[13px] text-slate-300 hover:text-accent-light transition-colors hover:translate-x-1 inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            {siteConfig.admissionOpen && (
              <div className="p-4 rounded-xl border border-accent/30 bg-accent/10 w-full max-w-[200px] flex flex-col items-center sm:items-start">
                <div className="flex items-center gap-2 mb-1.5">
                  <GraduationCap size={14} className="text-accent-light" />
                  <span className="text-xs font-bold text-accent-light">Admissions Open</span>
                </div>
                <p className="text-[11px] text-white/45 mb-3">For {siteConfig.admissionYear}</p>
                <Link href="/admissions"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-accent hover:bg-accent-light px-3 py-1.5 rounded-lg transition-colors"
                >
                  Apply Now →
                </Link>
              </div>
            )}
          </div>

          {/* Col 4 — Contact */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-0.5 h-4 bg-accent rounded-full inline-block" />
              Contact Us
            </h4>
            <ul className="space-y-2.5">
              <li>
                <a href={`tel:${siteConfig.phone}`} className="flex flex-col sm:flex-row items-center sm:items-start gap-2.5 text-[13px] text-slate-300 hover:text-accent-light transition-colors">
                  <Phone size={14} className="shrink-0" />
                  <div>
                    <p>{siteConfig.phone}</p>
                    {siteConfig.altPhone && <p className="text-white/35">{siteConfig.altPhone}</p>}
                  </div>
                </a>
              </li>
              <li>
                <a href={`mailto:${siteConfig.email}`} className="flex flex-col sm:flex-row items-center sm:items-start gap-2.5 text-[13px] text-slate-300 hover:text-accent-light transition-colors">
                  <Mail size={14} className="shrink-0" />
                  <span>{siteConfig.email}</span>
                </a>
              </li>
              <li className="flex flex-col sm:flex-row items-center sm:items-start gap-2.5 text-[13px] text-slate-300">
                <MapPin size={14} className="shrink-0" />
                <span>{siteConfig.address}<br />{siteConfig.city}, {siteConfig.state} — {siteConfig.pincode}</span>
              </li>
              <li className="flex flex-col sm:flex-row items-center sm:items-start gap-2.5 text-[13px] text-slate-300">
                <Clock size={14} className="shrink-0" />
                <span>{siteConfig.workingHours}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-custom py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-white/40">
            © {new Date().getFullYear()} {siteConfig.schoolName}. All rights reserved. <span className="mx-1 font-bold text-white/20">|</span> <span className="text-emerald-400 font-semibold tracking-wide">Powered by Team Axiogen</span>
          </p>
          <div className="flex items-center gap-5">
            <Link href="#" className="text-[11px] text-white/35 hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-[11px] text-white/35 hover:text-white/60 transition-colors">Terms of Use</Link>
          </div>
        </div>
      </div>

      {/* Scroll-to-top */}
      <button onClick={scrollToTop} aria-label="Scroll to top"
        className="fixed bottom-6 right-6 w-10 h-10 rounded-full bg-accent text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center z-40"
      >
        <ArrowUp size={16} />
      </button>
    </footer>
  );
}
