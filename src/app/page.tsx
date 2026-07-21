import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { TestimonialCarousel } from "@/components/home/TestimonialCarousel";
import { EventsSection } from "@/components/home/EventsSection";
import { CTASection } from "@/components/home/CTASection";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import { FadeIn } from "@/components/ui/FadeIn";
import { SafeImage } from "@/components/ui/SafeImage";

export const metadata: Metadata = {
  title: `Welcome to ${siteConfig.schoolName}`,
  description: siteConfig.description,
  openGraph: {
    images: [{ url: `${siteConfig.siteUrl}${siteConfig.ogImage}`, width: 1200, height: 630, alt: siteConfig.schoolName }],
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": siteConfig.siteUrl,
  "name": siteConfig.schoolName,
  "potentialAction": {
    "@type": "SearchAction",
    "target": `${siteConfig.siteUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};

export default function HomePage() {
  return (
    <>
      {/* Website JSON-LD Structured Data Schema */}
      <Script id="ld-website-json" type="application/ld+json" strategy="afterInteractive">
        {JSON.stringify(websiteJsonLd)}
      </Script>

      <div id="main-content" className="overflow-x-hidden flex flex-col w-full">
        
        {/* HERO SECTION */}
        <HeroSection />

        {/* STATS SECTION */}
        <StatsSection />

        {/* WHY CHOOSE US / VALUES SECTION */}
        <section className="section-padding bg-white w-full" role="region" aria-label="Our Values">
          <div className="container-custom px-4 md:px-6 lg:px-8">
            <SectionHeader
              label="About Us"
              title="Why Choose Us?"
              subtitle="We are committed to nurturing every student's potential through academic excellence, character development, and holistic education."
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {siteConfig.values.map((val, i) => (
                <FadeIn key={i} delay={i * 50} className="h-full">
                  <div className="group bg-white rounded-2xl p-6 border border-gray-200 shadow-card hover:border-emerald-400/40 hover:shadow-xl md:hover:translate-y-[-4px] transition-all duration-300 h-full flex flex-col">
                    <div className="w-12 h-12 rounded-xl bg-[#0F172A] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shrink-0">
                      <DynamicIcon name={val.icon} size={22} className="text-white" />
                    </div>
                    <h3 className="text-base font-bold text-[#0F172A] mb-2">{val.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed flex-1">{val.description}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
            
            <FadeIn className="text-center mt-10">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-[#0F172A] font-bold hover:underline transition-all duration-200"
              >
                Learn more about us &rarr;
              </Link>
            </FadeIn>
          </div>
        </section>

        {/* FACILITIES GRID SECTION */}
        <section className="section-padding bg-[#FAFAFA] w-full" role="region" aria-label="Our Facilities">
          <div className="container-custom px-4 md:px-6 lg:px-8">
            <SectionHeader
              label="Infrastructure"
              title="World-Class Facilities"
              subtitle="Our campus is equipped with modern infrastructure designed to support every aspect of student development."
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {siteConfig.facilities.map((facility, i) => (
                <FadeIn key={i} delay={i * 50} className="h-full">
                  <div className="group bg-white rounded-2xl border border-gray-200 shadow-card overflow-hidden hover:shadow-xl md:hover:translate-y-[-4px] transition-all duration-300 flex flex-col h-full">
                    {/* Facility Image Thumbnail */}
                    <div className="relative aspect-video w-full overflow-hidden shrink-0 bg-gray-100">
                      <SafeImage
                        src={`/images/facilities/${facility.name.toLowerCase().replace(/\s+/g, "-")}.jpg`}
                        alt={facility.name}
                        fallbackText={facility.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 300px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    
                    {/* Text Details */}
                    <div className="p-5 flex-grow flex flex-col">
                      <h4 className="text-sm font-bold text-[#0F172A] mb-2 flex items-center gap-2">
                        <DynamicIcon name={facility.icon} size={16} className="text-emerald-500" />
                        {facility.name}
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed flex-grow">{facility.description}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS SECTION */}
        <section className="section-padding bg-white w-full" role="region" aria-label="Testimonials">
          <div className="container-custom px-4 md:px-6 lg:px-8">
            <SectionHeader
              label="Testimonials"
              title="What Parents & Alumni Say"
              subtitle="Hear from the families and students who have been part of our school community."
            />
            <TestimonialCarousel />
          </div>
        </section>

        {/* EVENTS SECTION */}
        <EventsSection />

        {/* CTA BANNER */}
        <CTASection />

      </div>
    </>
  );
}
