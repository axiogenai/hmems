"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home, ChevronRight, Phone, Mail, MapPin, Clock, Send, CheckCircle, MessageSquare,
} from "lucide-react";
import { siteConfig } from "@/config/site.config";

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.6, delay }}
    className={className}
  >
    {children}
  </motion.div>
);

import { PageHeader } from "@/components/ui/PageHeader";

const contactCards = [
  {
    icon: Phone,
    label: "Phone",
    lines: [siteConfig.phone, siteConfig.altPhone].filter(Boolean),
    href: `tel:${siteConfig.phone}`,
    color: "from-blue-500 to-blue-700",
  },
  {
    icon: Mail,
    label: "Email",
    lines: [siteConfig.email, siteConfig.admissionEmail],
    href: `mailto:${siteConfig.email}`,
    color: "from-green-500 to-green-700",
  },
  {
    icon: MapPin,
    label: "Address",
    lines: [siteConfig.address, `${siteConfig.city}, ${siteConfig.state} — ${siteConfig.pincode}`],
    href: "#map",
    color: "from-purple-500 to-purple-700",
  },
  {
    icon: Clock,
    label: "Working Hours",
    lines: [siteConfig.workingHours, "Sunday: Closed"],
    href: undefined,
    color: "from-emerald-500 to-emerald-700",
  },
];

const subjectOptions = ["General Inquiry", "Admissions", "Fee Payment", "Student Progress", "Transportation", "Other"];

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    let errorMsg = "";
    const cleanVal = value.trim();

    if (name === "name") {
      if (!cleanVal || cleanVal.length < 3) {
        errorMsg = "Please enter your full name (at least 3 characters)";
      } else if (!/^[a-zA-Z\s'.]+$/.test(cleanVal)) {
        errorMsg = "Full Name must contain letters only (no symbols or numbers)";
      }
    } else if (name === "email") {
      if (!cleanVal || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanVal)) {
        errorMsg = "Please enter a valid email address (e.g. parent@gmail.com)";
      }
    } else if (name === "phone") {
      if (cleanVal) {
        const digitsOnly = cleanVal.replace(/[\s+.-]/g, "");
        if (!/^\d{10,12}$/.test(digitsOnly) || /[a-zA-Z]/.test(cleanVal)) {
          errorMsg = "Please enter a valid 10-digit phone number (numbers only)";
        }
      }
    } else if (name === "subject") {
      if (!value) {
        errorMsg = "Please select an inquiry subject from the list";
      }
    } else if (name === "message") {
      if (!cleanVal || cleanVal.length < 10) {
        errorMsg = "Message must be at least 10 characters long";
      }
    }

    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    return !errorMsg;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Strict input filtering: Phone number only accepts numeric digits, +, -
    if (name === "phone" && value && !/^[\d\s+-]*$/.test(value)) {
      setErrors(prev => ({ ...prev, phone: "Phone number accepts numeric digits only" }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    validateField(e.target.name, e.target.value);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields on submit
    const isNameValid = validateField("name", formData.name);
    const isEmailValid = validateField("email", formData.email);
    const isPhoneValid = validateField("phone", formData.phone);
    const isSubjectValid = validateField("subject", formData.subject);
    const isMessageValid = validateField("message", formData.message);

    if (!isNameValid || !isEmailValid || !isPhoneValid || !isSubjectValid || !isMessageValid) {
      return;
    }

    setIsSubmitting(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.from("applications").insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "N/A",
        grade: "Contact Inquiry",
        parent_name: formData.name,
        parent_phone: formData.phone || "N/A",
        parent_email: formData.email,
        notes: `Subject: ${formData.subject || 'General Inquiry'}. Message: ${formData.message}`,
        status: "Pending"
      });
    } catch (err) {
      console.error("Contact form Supabase error:", err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div>
      <PageHeader title="Contact Us" breadcrumb="Contact" />

      {/* ── Contact Cards ───────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {contactCards.map((card, i) => {
              const inner = (
                <div className="group bg-surface rounded-2xl border border-border-custom p-6 hover:shadow-lg hover:-translate-y-1 transition-all h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                    <card.icon size={22} className="text-white" />
                  </div>
                  <h4 className="font-bold text-primary mb-2">{card.label}</h4>
                  {card.lines.map((line, j) => (
                    <p key={j} className={`text-sm ${j === 0 ? "text-foreground font-medium" : "text-muted"}`}>{line}</p>
                  ))}
                </div>
              );
              return (
                <FadeIn key={i} delay={i * 0.1}>
                  {card.href ? <a href={card.href}>{inner}</a> : inner}
                </FadeIn>
              );
            })}
          </div>

          {/* ── Map + Form ───────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Map */}
            <FadeIn>
              <h3 className="text-2xl font-bold text-primary mb-5">Find Us</h3>
              <div className="rounded-3xl overflow-hidden border border-border-custom shadow-sm h-[380px] bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
                {siteConfig.mapEmbedUrl ? (
                  <iframe
                    src={siteConfig.mapEmbedUrl}
                    width="100%"
                    height="380"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="School location on map"
                  />
                ) : (
                  <div className="text-center p-8">
                    <MapPin size={48} className="text-muted/30 mx-auto mb-3" />
                    <p className="text-muted">{siteConfig.address}</p>
                    <p className="text-muted text-sm">{siteConfig.city}, {siteConfig.state}</p>
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between flex-wrap gap-4 text-sm text-slate-600">
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-accent mt-0.5 shrink-0" />
                  <span>{siteConfig.address}, {siteConfig.city}</span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(siteConfig.address + " " + siteConfig.city)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline hover:text-accent-light"
                >
                  <MapPin size={14} /> Open in Google Maps &rarr;
                </a>
              </div>
            </FadeIn>

            {/* Contact Form */}
            <FadeIn delay={0.15}>
              <h3 className="text-2xl font-bold text-primary mb-5">Send a Message</h3>
              <div className="bg-surface rounded-3xl border border-border-custom p-7">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                  >
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={32} className="text-success" />
                    </div>
                    <h4 className="text-xl font-bold text-primary mb-2">Message Received!</h4>
                    <p className="text-muted text-sm mb-5">We&apos;ll get back to you at {formData.email} within 24 hours.</p>
                    <button
                      onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                      className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl"
                    >
                      Send Another
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Your Name *</label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-slate-50/50 hover:bg-slate-50 text-slate-800 transition-all placeholder-slate-400 ${
                          errors.name ? "border-rose-500 focus:ring-rose-500/20 bg-rose-50/30" : "border-border focus:ring-accent/30 focus:border-accent"
                        }`}
                      />
                      {errors.name && <p className="text-xs text-rose-600 mt-1 font-bold flex items-center gap-1">⚠️ {errors.name}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Email Address *</label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="you@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-slate-50/50 hover:bg-slate-50 text-slate-800 transition-all placeholder-slate-400 ${
                          errors.email ? "border-rose-500 focus:ring-rose-500/20 bg-rose-50/30" : "border-border focus:ring-accent/30 focus:border-accent"
                        }`}
                      />
                      {errors.email && <p className="text-xs text-rose-600 mt-1 font-bold flex items-center gap-1">⚠️ {errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Phone Number</label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-slate-50/50 hover:bg-slate-50 text-slate-800 transition-all placeholder-slate-400 ${
                          errors.phone ? "border-rose-500 focus:ring-rose-500/20 bg-rose-50/30" : "border-border focus:ring-accent/30 focus:border-accent"
                        }`}
                      />
                      {errors.phone && <p className="text-xs text-rose-600 mt-1 font-bold flex items-center gap-1">⚠️ {errors.phone}</p>}
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Subject *</label>
                      <select
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-slate-50/50 hover:bg-slate-50 text-slate-800 transition-all ${
                          errors.subject ? "border-rose-500 focus:ring-rose-500/20 bg-rose-50/30" : "border-border focus:ring-accent/30 focus:border-accent"
                        }`}
                      >
                        <option value="">Select a subject</option>
                        {subjectOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {errors.subject && <p className="text-xs text-rose-600 mt-1 font-bold flex items-center gap-1">⚠️ {errors.subject}</p>}
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Message *</label>
                      <textarea
                        id="message"
                        name="message"
                        placeholder="How can we help you?"
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows={4}
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 bg-slate-50/50 hover:bg-slate-50 text-slate-800 resize-none transition-all placeholder-slate-400 ${
                          errors.message ? "border-rose-500 focus:ring-rose-500/20 bg-rose-50/30" : "border-border focus:ring-accent/30 focus:border-accent"
                        }`}
                      />
                      {errors.message && <p className="text-xs text-rose-600 mt-1 font-bold flex items-center gap-1">⚠️ {errors.message}</p>}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-accent hover:bg-accent-light text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={16} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Visit CTA ───────────────────────────── */}
      <section className="py-16 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <FadeIn className="container-custom text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-5">
            <MessageSquare size={28} className="text-accent-light" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Come See Us in Person</h2>
          <p className="text-white/70 text-lg max-w-xl mx-auto mb-8">
            We&apos;d love to show you around our campus. Schedule a visit and experience {siteConfig.schoolName} firsthand.
          </p>
          <a
            href={`tel:${siteConfig.phone}`}
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.03] transition-all"
          >
            <Phone size={18} />
            Call to Schedule a Visit
          </a>
        </FadeIn>
      </section>
    </div>
  );
}
