import Link from "next/link";
import { GraduationCap, Phone, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { FadeIn } from "@/components/ui/FadeIn";

export function CTASection() {
  return (
    <section className="relative py-20 bg-primary overflow-hidden" role="region" aria-label="Admissions CTA">
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} aria-hidden="true" />
      
      <div className="container-custom relative z-10 text-center px-4 md:px-6 lg:px-8">
        <FadeIn>
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-accent/20 border border-accent/40 text-accent-light rounded-full text-xs md:text-sm mb-6">
            <Sparkles size={14} className="text-accent-light" />
            Admissions Deadline: {siteConfig.admissionEndDate}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
            Ready to Join Our Family?
          </h2>
          <p className="text-slate-300 text-sm md:text-lg max-w-2xl mx-auto mb-6 leading-relaxed font-normal">
            Give your child the education they deserve. <strong>Limited seats for {siteConfig.admissionYear}. Early bird registration discount ends soon.</strong> Apply now and be part of a legacy of excellence.
          </p>
          
          {/* Trust Badge */}
          <div className="inline-block px-5 py-2.5 bg-white/5 border border-white/10 rounded-2xl mb-10 text-white text-xs md:text-sm font-medium">
            🎒 Admissions closing shortly · Secure your seat today!
          </div>

          <div className="flex flex-wrap gap-3 md:gap-4 justify-center">
            <Link
              href="/admissions"
              className="inline-flex items-center justify-center gap-2 h-11 md:h-12 px-6 md:px-8 bg-accent hover:bg-accent-light text-white font-semibold rounded-xl hover:shadow-lg hover:translate-y-[-2px] transition-all text-xs md:text-base cursor-pointer shadow-md"
            >
              <GraduationCap size={20} />
              Apply Now
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 h-11 md:h-12 px-6 md:px-8 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 hover:translate-y-[-2px] hover:shadow-lg transition-all text-xs md:text-base cursor-pointer shadow-md"
            >
              <Phone size={18} />
              Schedule a Visit
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
