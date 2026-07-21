import Link from "next/link";
import { CalendarDays, Clock, ArrowRight } from "lucide-react";
import { events } from "@/data/site-data";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FadeIn } from "@/components/ui/FadeIn";
import { SafeImage } from "@/components/ui/SafeImage";

export const eventCategoryStyles: Record<string, string> = {
  Sports: "bg-accent/10 text-accent border-accent/20",
  Academic: "bg-primary/10 text-primary border-primary/20",
  Cultural: "bg-secondary/10 text-secondary border-secondary/20",
  Meeting: "bg-muted-bg text-body border-border",
  National: "bg-muted-bg text-body border-border",
};

export function EventsSection() {
  return (
    <section className="section-padding bg-surface w-full" role="region" aria-label="Upcoming Events">
      <div className="container-custom px-4 md:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <SectionHeader
              label="Upcoming"
              title="School Events"
              align="left"
            />
          </div>
          <Link href="/student-life" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {events.slice(0, 3).map((event, i) => (
            <FadeIn key={event.id} delay={i * 50} className="h-full">
              <div className="bg-white rounded-3xl border border-border shadow-card overflow-hidden hover:shadow-xl md:hover:translate-y-[-4px] transition-all duration-300 group flex flex-col h-full min-h-[22rem] ">
                {/* Event Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden shrink-0 bg-slate-100">
                  <SafeImage
                    src={event.image}
                    alt={event.title}
                    fallbackText={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 350px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Date Header */}
                <div className="px-6 pt-6 pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-slate-500 min-w-0">
                    <CalendarDays size={15} className="text-accent shrink-0" />
                    <span className="text-xs font-semibold" suppressHydrationWarning>{event.date}</span>
                  </div>
                  <span className={`shrink-0 text-[9px] md:text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${eventCategoryStyles[event.category] || "bg-slate-100 text-slate-600 border-slate-200"}`}>
                    {event.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-primary mb-2 group-hover:text-accent transition-colors text-base leading-snug">
                      {event.title}
                    </h3>
                    <p className="text-sm text-body leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 mt-4 flex items-center gap-1.5 font-medium">
                    <LucideIcons.Clock size={14} className="text-slate-400 shrink-0" />
                    {event.time}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link href="/student-life" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View all events <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

import * as LucideIcons from "lucide-react";
