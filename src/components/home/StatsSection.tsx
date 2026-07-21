import { siteConfig } from "@/config/site.config";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { FadeIn } from "@/components/ui/FadeIn";

export function StatsSection() {
  return (
    <section className="py-12 bg-surface w-full" role="region" aria-label="School Statistics">
      <div className="container-custom px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {siteConfig.stats.map((stat, i) => (
            <FadeIn key={i} delay={i * 50} className="h-full">
              <div className="bg-white border border-border rounded-2xl p-6 min-h-32 flex flex-col justify-center text-center shadow-card hover:border-accent/30 transition-all">
                <p className="text-3xl font-bold text-accent">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm text-card-text mt-2 font-medium">{stat.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
