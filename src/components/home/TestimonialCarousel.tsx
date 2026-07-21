"use client";

import React, { useState, useEffect, useRef } from "react";
import { Quote, Star, ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { testimonials } from "@/data/site-data";

export function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const media = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(media.matches);
      if (media.matches) {
        setIsPlaying(false);
      }
    }
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (!isPlaying || reducedMotion) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, reducedMotion]);

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement && containerRef.current?.contains(document.activeElement)) {
        if (e.key === "ArrowLeft") {
          setIsPlaying(false);
          setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
        } else if (e.key === "ArrowRight") {
          setIsPlaying(false);
          setActiveIndex((prev) => (prev + 1) % testimonials.length);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative max-w-3xl mx-auto"
      onMouseEnter={() => setIsPlaying(false)}
      onMouseLeave={() => !reducedMotion && setIsPlaying(true)}
    >
      {/* Live region for accessibility */}
      <div
        id="testimonial-container"
        aria-live="polite"
        role="region"
        aria-label="Parents & Alumni Testimonials"
        className="bg-white rounded-3xl p-8 md:p-10 border border-border shadow-sm relative w-full min-h-[24rem] md:min-h-[18rem] flex flex-col justify-between"
      >
        <Quote size={48} className="absolute top-6 right-8 text-accent/10 pointer-events-none" aria-hidden="true" />
        <div>
          {/* Stars */}
          <div className="flex gap-1 mb-5">
            {Array.from({ length: testimonials[activeIndex].rating }).map((_, i) => (
              <Star key={i} size={16} className="text-accent fill-accent" />
            ))}
          </div>
          <blockquote className="text-base md:text-lg text-body-text font-medium leading-relaxed mb-6 italic">
            &ldquo;{testimonials[activeIndex].quote}&rdquo;
          </blockquote>
        </div>
        <div className="flex items-center gap-4 mt-auto">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm shrink-0">
            {testimonials[activeIndex].name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="font-bold text-primary text-sm md:text-base">{testimonials[activeIndex].name}</p>
            <p className="text-xs md:text-sm text-slate-500 font-medium">{testimonials[activeIndex].role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-8">
        <button
          onClick={() => { setIsPlaying(false); setActiveIndex((p) => (p - 1 + testimonials.length) % testimonials.length); }}
          className="p-3 md:p-2.5 rounded-full border border-border hover:bg-slate-50 active:bg-slate-100 transition-all cursor-pointer flex items-center justify-center"
          aria-label="Previous slide"
          aria-controls="testimonial-container"
        >
          <ChevronLeft size={20} className="text-[#0F172A]" />
        </button>
        
        {/* Play/Pause Button */}
        {!reducedMotion && (
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 md:p-2.5 rounded-full border border-border hover:bg-slate-50 active:bg-slate-100 transition-all cursor-pointer flex items-center justify-center"
            aria-label={isPlaying ? "Pause auto-play" : "Play auto-play"}
          >
            {isPlaying ? <Pause size={18} className="text-[#0F172A]" /> : <Play size={18} className="text-[#0F172A]" />}
          </button>
        )}

        <div className="flex gap-1">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => { setIsPlaying(false); setActiveIndex(i); }}
              className="p-2 cursor-pointer focus:outline-none"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === activeIndex ? "true" : "false"}
              aria-controls="testimonial-container"
            >
              <div className={`transition-all duration-300 rounded-full h-3 ${i === activeIndex ? "w-6 bg-accent" : "w-3 bg-slate-300 hover:bg-slate-400"}`} />
            </button>
          ))}
        </div>

        <button
          onClick={() => { setIsPlaying(false); setActiveIndex((p) => (p + 1) % testimonials.length); }}
          className="p-3 md:p-2.5 rounded-full border border-border hover:bg-slate-50 active:bg-slate-100 transition-all cursor-pointer flex items-center justify-center"
          aria-label="Next slide"
          aria-controls="testimonial-container"
        >
          <ChevronRight size={20} className="text-[#0F172A]" />
        </button>
      </div>
    </div>
  );
}
