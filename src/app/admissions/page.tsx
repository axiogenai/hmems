"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, ChevronRight, GraduationCap, FileText, CreditCard, Users, CheckCircle,
  ChevronDown, ArrowRight, Phone, Mail, Send, ClipboardList,
} from "lucide-react";
import { siteConfig } from "@/config/site.config";
import { admissionFAQs } from "@/data/site-data";

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

const processSteps = [
  { icon: Phone, step: "01", title: "Inquire", desc: "Fill the online form or call us. Our admissions team will reach out within 24 hours." },
  { icon: Users, step: "02", title: "Campus Visit", desc: "Schedule a guided campus tour to experience our facilities and meet our faculty." },
  { icon: FileText, step: "03", title: "Submit Application", desc: "Fill the application form and upload required documents online." },
  { icon: ClipboardList, step: "04", title: "Interaction", desc: "Attend a brief interaction session (for Class I and above) to help us understand the child." },
  { icon: GraduationCap, step: "05", title: "Enrollment", desc: "Receive your admission confirmation and complete fee payment to secure the seat." },
];

const documents = [
  "Birth Certificate (Original + Photocopy)",
  "Previous School Report Card / Transfer Certificate",
  "4 Passport-size Photographs",
  "Aadhar Card (Student + Parent)",
  "Address Proof (Any govt. document)",
  "Medical Fitness Certificate",
  "Caste Certificate (if applicable)",
];

const ageEligibility = [
  { grade: "Nursery", age: "3+ years as of June 1" },
  { grade: "LKG", age: "4+ years as of June 1" },
  { grade: "UKG", age: "5+ years as of June 1" },
  { grade: "Class I", age: "6+ years as of June 1" },
  { grade: "Class II onwards", age: "As per previous class completion" },
  { grade: "Class XI", age: "Class X passed from recognized board" },
];

// FAQ Item
function FAQItem({ faq }: { faq: { question: string; answer: string } }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border-custom rounded-2xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted-bg/50 transition-colors"
      >
        <span className="font-semibold text-primary text-sm pr-4">{faq.question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} className="text-muted shrink-0" />
        </motion.div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 pt-1">
              <p className="text-sm text-muted leading-relaxed">{faq.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdmissionsPage() {
  const [formData, setFormData] = useState({
    parentName: "", phone: "", email: "", childName: "", dob: "", grade: "", prevSchool: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    let errorMsg = "";
    const cleanVal = value.trim();

    if (name === "parentName") {
      if (!cleanVal || cleanVal.length < 3) {
        errorMsg = "Please enter parent's full name (at least 3 characters)";
      } else if (!/^[a-zA-Z\s'.]+$/.test(cleanVal)) {
        errorMsg = "Parent name must contain letters only";
      }
    } else if (name === "childName") {
      if (!cleanVal || cleanVal.length < 2) {
        errorMsg = "Please enter student's full name";
      } else if (!/^[a-zA-Z\s'.]+$/.test(cleanVal)) {
        errorMsg = "Student name must contain letters only";
      }
    } else if (name === "email") {
      if (!cleanVal || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(cleanVal)) {
        errorMsg = "Please enter a valid email address (e.g. parent@gmail.com)";
      }
    } else if (name === "phone") {
      const digitsOnly = cleanVal.replace(/[\s+.-]/g, "");
      if (!cleanVal || !/^\d{10,12}$/.test(digitsOnly) || /[a-zA-Z]/.test(cleanVal)) {
        errorMsg = "Please enter a valid 10-digit phone number (numbers only)";
      }
    } else if (name === "grade") {
      if (!value) {
        errorMsg = "Please select target grade for admission";
      }
    }

    setErrors(prev => ({ ...prev, [name]: errorMsg }));
    return !errorMsg;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

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
    const isParentValid = validateField("parentName", formData.parentName);
    const isChildValid = validateField("childName", formData.childName);
    const isEmailValid = validateField("email", formData.email);
    const isPhoneValid = validateField("phone", formData.phone);
    const isGradeValid = validateField("grade", formData.grade);

    if (!isParentValid || !isChildValid || !isEmailValid || !isPhoneValid || !isGradeValid) {
      return;
    }
    setIsSubmitting(true);
    try {
      const { supabase } = await import("@/lib/supabase");
      await supabase.from("applications").insert({
        name: formData.childName,
        email: formData.email,
        phone: formData.phone,
        grade: formData.grade,
        parent_name: formData.parentName,
        parent_phone: formData.phone,
        parent_email: formData.email,
        notes: formData.message ? `Previous School: ${formData.prevSchool || 'N/A'}. Note: ${formData.message}` : `Previous School: ${formData.prevSchool || 'N/A'}`,
        status: "Pending"
      });
    } catch (err) {
      console.error("Admissions inquiry submission error:", err);
    } finally {
      setIsSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <div>
      <PageHeader title={`Admissions ${siteConfig.admissionYear}`} breadcrumb="Admissions" />

      {/* ── Process Steps ───────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-accent mb-3 px-4 py-1.5 bg-accent/10 rounded-full border border-accent/20">How to Apply</span>
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Admission Process</h2>
            <div className="gold-line mt-3" />
          </div>
          {/* Desktop: horizontal */}
          <div className="hidden md:flex items-start gap-0 relative">
            <div className="absolute top-8 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-accent via-secondary to-accent opacity-30" />
            {processSteps.map((s, i) => (
              <FadeIn key={i} delay={i * 0.12} className="flex-1 text-center px-3">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="w-full h-full rounded-2xl bg-primary flex items-center justify-center shadow-lg relative z-10">
                    <s.icon size={24} className="text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center z-20">
                    {s.step}
                  </span>
                </div>
                <h4 className="font-bold text-primary mb-2">{s.title}</h4>
                <p className="text-xs text-muted leading-relaxed">{s.desc}</p>
              </FadeIn>
            ))}
          </div>
          {/* Mobile: vertical */}
          <div className="md:hidden space-y-4">
            {processSteps.map((s, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="flex gap-4 bg-surface rounded-2xl p-5 border border-border-custom">
                  <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                    <s.icon size={20} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-accent mb-0.5">Step {s.step}</p>
                    <h4 className="font-bold text-primary">{s.title}</h4>
                    <p className="text-sm text-muted mt-1">{s.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fee Structure ───────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Fee Structure {siteConfig.admissionYear}</h2>
            <div className="gold-line mt-3" />
          </div>
          <FadeIn>
            <div className="bg-white rounded-2xl border border-border-custom overflow-hidden shadow-sm max-w-2xl mx-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-primary to-secondary text-white">
                    <th className="text-left px-6 py-4 text-sm font-semibold">Grade</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold">Annual Fees</th>
                    <th className="text-center px-6 py-4 text-sm font-semibold">Admission Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {siteConfig.feeStructure.map((f, i) => (
                    <tr key={i} className={`border-t border-border-custom ${i % 2 === 0 ? "" : "bg-muted-bg/30"}`}>
                      <td className="px-6 py-4 text-sm font-medium text-foreground">{f.grade}</td>
                      <td className="px-6 py-4 text-center text-sm font-bold text-primary">{f.annual}</td>
                      <td className="px-6 py-4 text-center text-sm text-muted">{f.admission}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4 bg-accent/10 border-t border-accent/20">
                <p className="text-xs text-emerald-700">* Admission fee is a one-time payment. Annual fees are subject to revision. Transport fees are charged separately. Contact admissions for detailed breakup.</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Eligibility + Documents ─────────────── */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <FadeIn>
              <h3 className="text-2xl font-bold text-primary mb-6">Age Eligibility</h3>
              <div className="space-y-3">
                {ageEligibility.map((ae, i) => (
                  <div key={i} className="flex justify-between items-center py-3 border-b border-border-custom last:border-0">
                    <span className="font-semibold text-sm text-primary">{ae.grade}</span>
                    <span className="text-sm text-muted">{ae.age}</span>
                  </div>
                ))}
              </div>
            </FadeIn>
            <FadeIn delay={0.15}>
              <h3 className="text-2xl font-bold text-primary mb-6">Required Documents</h3>
              <ul className="space-y-3">
                {documents.map((doc, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-success mt-0.5 shrink-0" />
                    <span className="text-sm text-muted">{doc}</span>
                  </li>
                ))}
              </ul>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── Inquiry Form ────────────────────────── */}
      <section className="section-padding bg-surface">
        <div className="container-custom max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Submit Your Inquiry</h2>
            <div className="gold-line mt-3" />
            <p className="section-subtitle mt-4">Fill in your details and our admissions team will contact you within 24 hours.</p>
          </div>
          <FadeIn>
            <div className="bg-white rounded-3xl border border-border-custom shadow-sm p-8">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle size={40} className="text-success" />
                  </div>
                  <h3 className="text-2xl font-bold text-primary mb-2">Inquiry Submitted!</h3>
                  <p className="text-muted mb-6">Thank you, {formData.parentName}! We&apos;ll contact you at {formData.phone} within 24 hours.</p>
                  <button
                    onClick={() => { setSubmitted(false); setFormData({ parentName: "", phone: "", email: "", childName: "", dob: "", grade: "", prevSchool: "", message: "" }); }}
                    className="px-6 py-3 bg-accent text-white font-semibold rounded-xl"
                  >
                    Submit Another
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="parentName" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Parent / Guardian Name *</label>
                      <input
                        id="parentName"
                        type="text"
                        name="parentName"
                        placeholder="Full Name"
                        value={formData.parentName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                          errors.parentName
                            ? "border-rose-500 focus:ring-rose-500/20 bg-rose-50/30"
                            : "border-border focus:ring-accent/30 focus:border-accent bg-slate-50/50 hover:bg-slate-50"
                        } text-slate-800 placeholder-slate-400`}
                      />
                      {errors.parentName && <p className="text-xs text-rose-600 mt-1 font-bold flex items-center gap-1">⚠️ {errors.parentName}</p>}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Phone Number *</label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.phone}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                          errors.phone
                            ? "border-rose-500 focus:ring-rose-500/20 bg-rose-50/30"
                            : "border-border focus:ring-accent/30 focus:border-accent bg-slate-50/50 hover:bg-slate-50"
                        } text-slate-800 placeholder-slate-400`}
                      />
                      {errors.phone && <p className="text-xs text-rose-600 mt-1 font-bold flex items-center gap-1">⚠️ {errors.phone}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Email Address *</label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="parent@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                          errors.email
                            ? "border-rose-500 focus:ring-rose-500/20 bg-rose-50/30"
                            : "border-border focus:ring-accent/30 focus:border-accent bg-slate-50/50 hover:bg-slate-50"
                        } text-slate-800 placeholder-slate-400`}
                      />
                      {errors.email && <p className="text-xs text-rose-600 mt-1 font-bold flex items-center gap-1">⚠️ {errors.email}</p>}
                    </div>

                    <div>
                      <label htmlFor="childName" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Child's Name *</label>
                      <input
                        id="childName"
                        type="text"
                        name="childName"
                        placeholder="Full Name"
                        value={formData.childName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                          errors.childName
                            ? "border-rose-500 focus:ring-rose-500/20 bg-rose-50/30"
                            : "border-border focus:ring-accent/30 focus:border-accent bg-slate-50/50 hover:bg-slate-50"
                        } text-slate-800 placeholder-slate-400`}
                      />
                      {errors.childName && <p className="text-xs text-rose-600 mt-1 font-bold flex items-center gap-1">⚠️ {errors.childName}</p>}
                    </div>

                    <div>
                      <label htmlFor="dob" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Date of Birth</label>
                      <input
                        id="dob"
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-slate-50/50 hover:bg-slate-50 text-slate-800"
                      />
                    </div>

                    <div>
                      <label htmlFor="prevSchool" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Previous School</label>
                      <input
                        id="prevSchool"
                        type="text"
                        name="prevSchool"
                        placeholder="School Name (if any)"
                        value={formData.prevSchool}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-slate-50/50 hover:bg-slate-50 text-slate-800 placeholder-slate-400"
                      />
                    </div>
                  </div>
                  {/* Grade Select */}
                  <div>
                    <label htmlFor="grade" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Grade Applying For *</label>
                    <select
                      id="grade"
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all text-slate-800 ${
                        errors.grade 
                          ? "border-rose-500 focus:ring-rose-500/20 bg-rose-50/30" 
                          : "border-border focus:ring-accent/30 focus:border-accent bg-slate-50/50 hover:bg-slate-50"
                      }`}
                    >
                      <option value="">Select a grade</option>
                      {["Nursery", "LKG", "UKG", ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)].map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                    {errors.grade && <p className="text-xs text-rose-600 mt-1 font-bold flex items-center gap-1">⚠️ {errors.grade}</p>}
                  </div>
                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Message (Optional)</label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Any specific questions or requirements..."
                      value={formData.message}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent bg-slate-50/50 hover:bg-slate-50 text-slate-800 resize-none placeholder-slate-400 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 h-12 bg-accent hover:bg-accent-light text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all text-base cursor-pointer"
                  >
                    <Send size={18} />
                    Submit Inquiry
                  </button>
                </form>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────── */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-primary">Frequently Asked Questions</h2>
            <div className="gold-line mt-3" />
          </div>
          <div className="space-y-3">
            {admissionFAQs.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <FAQItem faq={faq} />
              </FadeIn>
            ))}
          </div>
          <FadeIn className="mt-10 text-center">
            <p className="text-muted text-sm mb-5">Still have questions? We&apos;re here to help.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <a href={`tel:${siteConfig.phone}`}
                className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-light transition-colors text-sm w-full sm:w-auto"
              >
                <Phone size={15} /> {siteConfig.phone}
              </a>
              <a href={`mailto:${siteConfig.admissionEmail}`}
                className="inline-flex items-center justify-center gap-2 px-7 py-3 border-2 border-primary text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-colors text-sm w-full sm:w-auto"
              >
                <Mail size={15} /> Email Admissions
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
