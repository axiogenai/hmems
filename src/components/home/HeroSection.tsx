import Link from "next/link";
import Image from "next/image";
import { GraduationCap, ChevronRight, Star } from "lucide-react";
import { siteConfig } from "@/config/site.config";

export function HeroSection() {
  return (
    <section className="relative pt-20 pb-12 md:pt-32 md:pb-20 bg-primary overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} aria-hidden="true" />
      
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 right-10 w-64 h-64 md:w-80 md:h-80 rounded-full bg-accent/10 blur-3xl animate-float" style={{ animationDuration: "8s" }} />
        <div className="absolute bottom-10 left-10 w-80 h-80 md:w-96 md:h-96 rounded-full bg-cyan-400/10 blur-3xl animate-float" style={{ animationDuration: "10s", animationDelay: "2s" }} />
      </div>

      <div className="container-custom px-4 md:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-full text-xs md:text-sm font-medium backdrop-blur-sm mb-6">
              <GraduationCap size={14} className="text-accent-light" />
              {siteConfig.affiliationBoard} Affiliated · Est. {siteConfig.foundedYear}
            </span>

            <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-5">
              {siteConfig.schoolName}
            </h1>

            <p className="text-lg md:text-xl text-white font-light mb-4 leading-relaxed">
              {siteConfig.tagline}
            </p>

            <p className="text-xs md:text-sm text-white/80 mb-8 leading-relaxed font-normal">
              {siteConfig.description}
            </p>

            <div className="flex flex-wrap gap-3 md:gap-4 mb-6">
              <Link href="/admissions"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-accent hover:bg-accent-light text-white font-bold rounded-xl hover:shadow-lg hover:translate-y-[-2px] transition-all text-base cursor-pointer shadow-md"
              >
                <GraduationCap size={16} /> Apply for {siteConfig.admissionYear}
              </Link>
              <Link href="/about"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-white/40 text-white hover:border-white hover:bg-white/10 hover:translate-y-[-2px] hover:shadow-lg font-bold rounded-xl transition-all text-base cursor-pointer shadow-md"
              >
                Explore School <ChevronRight size={16} />
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3 text-white/80 text-xs md:text-sm">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8.5 h-8.5 rounded-full bg-accent border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-white">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={12} className="text-accent fill-accent" />
                  ))}
                  <span className="font-bold text-white ml-1">4.9/5</span>
                </div>
                <span>Trusted by 2000+ happy parents</span>
              </div>
            </div>
          </div>

          {/* Right Campus Image Column */}
          <div className="lg:col-span-5 hidden md:block w-full">
            <div className="relative aspect-video lg:aspect-square w-full rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
              <Image
                src="/images/school-campus.jpg"
                alt={`${siteConfig.schoolName} Campus`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 500px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/45 via-transparent to-transparent pointer-events-none" />
            </div>
          </div>
          
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none" aria-hidden="true">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 60L1440 60L1440 20C1200 60 720 0 0 40L0 60Z" fill="var(--surface)" />
        </svg>
      </div>
    </section>
  );
}
