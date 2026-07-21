import Link from "next/link";
import type { Metadata } from "next";
import { Home, ArrowLeft, GraduationCap, Mail } from "lucide-react";
import { siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: `404 - Page Not Found | ${siteConfig.schoolName}`,
  description: "The page you are looking for could not be found.",
};

export default function NotFound() {
  // Log the 404 path accessed on the server
  console.warn(`404 Page Not Found triggered for requested route.`);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4 overflow-hidden relative">
      {/* Reusable bg-dots background pattern from globals.css */}
      <div className="absolute inset-0 bg-dots opacity-[0.4]" aria-hidden="true" />

      {/* Floating background blobs (static CSS animation in globals.css) */}
      <div className="absolute top-20 right-10 w-80 h-80 rounded-full bg-accent/5 blur-3xl animate-float pointer-events-none" aria-hidden="true" />

      <div className="text-center relative z-10 max-w-lg w-full animate-fade-in px-4">
        
        {/* Large 404 text using clamp to prevent overflow */}
        <div className="mb-4">
          <span
            className="text-[clamp(80px,15vw,180px)] font-black leading-none gradient-text select-none block"
            style={{ textShadow: "0 10px 30px rgba(0,0,0,0.15)" }}
          >
            404
          </span>
        </div>

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mx-auto mb-6">
          <GraduationCap size={28} className="text-accent-light" />
        </div>

        <div role="alert" className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Page Not Found
          </h1>
          <p className="text-white/70 text-base md:text-lg leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Search Box Form */}
        <form action="/search" method="GET" className="max-w-md mx-auto mb-8 flex gap-2">
          <input
            type="text"
            name="q"
            placeholder="Search our website..."
            required
            className="flex-grow px-4 py-3 border-2 border-white/20 bg-white/10 text-white placeholder-white/50 rounded-xl focus:outline-none focus:border-accent focus:bg-white/20 transition-all text-sm"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-accent hover:bg-accent-light text-white font-bold rounded-xl transition-all cursor-pointer shadow-md hover:translate-y-[-2px]"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent hover:bg-accent-light text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all text-sm cursor-pointer"
          >
            <Home size={18} />
            Go to Homepage
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 hover:translate-y-[-2px] transition-all text-sm cursor-pointer"
          >
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>

        {/* Popular Pages and reporting option */}
        <div className="mt-10 pt-6 border-t border-white/10 text-sm text-white/50">
          <p className="mb-4">Popular pages you might be looking for:</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center mb-6">
            {[
              { href: "/about", label: "About Us" },
              { href: "/admissions", label: "Admissions" },
              { href: "/academics", label: "Academics" },
              { href: "/student-life", label: "Student Life" },
              { href: "/faculty", label: "Faculty" },
              { href: "/contact", label: "Contact Us" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-white transition-colors underline underline-offset-4 text-xs font-semibold"
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="text-xs">
            Think this is a mistake?{" "}
            <a
              href={`mailto:${siteConfig.email}?subject=Broken%20Link%20Report`}
              className="text-accent-light hover:text-accent font-bold hover:underline inline-flex items-center gap-1"
            >
              <Mail size={12} /> Contact Web Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
