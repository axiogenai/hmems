/**
 * ============================================================
 * SCHOOLSITE PRO — WHITE-LABEL CONFIGURATION
 * ============================================================
 * Change values here to rebrand the entire website for any school.
 * No other files need to be modified for basic rebranding.
 * ============================================================
 */

export const siteConfig = {
  // ─── School Identity ───────────────────────────────────────
  schoolName: "Holy Mother English Medium School",
  shortName: "HMEMS",
  tagline: "Nurturing Tomorrow's Leaders",
  description:
    "A premier English medium institution committed to academic excellence, character development, and holistic growth — shaping confident, compassionate, and capable young minds.",
  foundedYear: 1995,
  affiliationBoard: "SCC",
  affiliationNumber: "1030XXXX",
  logo: "/images/logo.svg",

  // ─── Contact Details ───────────────────────────────────────
  phone: "+91 98765 43210",
  altPhone: "+91 98765 43211",
  email: "info@holymotherschool.edu.in",
  admissionEmail: "admissions@holymotherschool.edu.in",
  address: "Raut Colony, Peth Vadgaon",
  city: "Kolhapur",
  state: "Maharashtra",
  pincode: "416112",
  mapEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d243.03500696082222!2d74.30785367192513!3d16.829136686817264!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc10679bb2b0f85%3A0x23d8fb41c46ebb15!2sHoly%20Mother%20English%20Medium%20School!5e1!3m2!1sen!2sin!4v1782813134247!5m2!1sen!2sin",
  workingHours: "Monday – Saturday: 8:00 AM – 3:30 PM",

  // ─── Social Media ──────────────────────────────────────────
  socialLinks: {
    facebook: "https://facebook.com/holymotherschool",
    instagram: "https://instagram.com/holymotherschool",
    youtube: "https://youtube.com/@holymotherschool",
    twitter: "https://twitter.com/holymotherschl",
    linkedin: "",
  },

  // ─── Admissions ────────────────────────────────────────────
  admissionYear: "2026–27",
  admissionOpen: true,
  admissionStartDate: "January 15, 2026",
  admissionEndDate: "March 31, 2026",

  // ─── Color Palette ─────────────────────────────────────
  colors: {
    primary: "#0B1120",       // Rich midnight
    primaryLight: "#162032",
    secondary: "#1A365D",     // Deep sapphire
    accent: "#10B981",        // Emerald green
    accentLight: "#34D399",
    background: "#F8FAFC",
    foreground: "#0F172A",
    muted: "#64748B",
    mutedBg: "#F1F5F9",
    border: "#E2E8F0",
    success: "#16A34A",
    destructive: "#DC2626",
    white: "#FFFFFF",
  },

  // ─── SEO & Meta ────────────────────────────────────────────
  siteUrl: "https://holymotherschool.edu.in",
  ogImage: "/images/og-image.jpg",

  // ─── Navigation Labels ─────────────────────────────────────
  nav: {
    home: "Home",
    about: "About Us",
    academics: "Academics",
    admissions: "Admissions",
    studentLife: "Student Life",
    faculty: "Faculty",
    blog: "News & Blog",
    contact: "Contact",
    parentPortal: "Parent Portal",
  },

  // ─── Key Stats ─────────────────────────────────────────────
  stats: [
    { label: "Years of Excellence", value: 30, suffix: "+" },
    { label: "Students Enrolled",   value: 2500, suffix: "+" },
    { label: "Expert Faculty",      value: 120, suffix: "+" },
    { label: "Board Result %",      value: 98, suffix: "%" },
  ],

  // ─── School Mission / Vision / Values ─────────────────────
  mission:
    "To empower every student with knowledge, character, and confidence to thrive in a dynamic world through innovative teaching, inclusive values, and a nurturing environment.",
  vision:
    "To be a beacon of educational excellence that transforms young minds into responsible global citizens and future leaders.",
  values: [
    {
      title: "Academic Excellence",
      description: "We maintain rigorous academic standards while fostering curiosity and critical thinking.",
      icon: "GraduationCap",
    },
    {
      title: "Character Building",
      description: "We nurture integrity, empathy, and leadership in every student.",
      icon: "Heart",
    },
    {
      title: "Innovation",
      description: "We embrace modern teaching methodologies and technology-driven learning.",
      icon: "Lightbulb",
    },
    {
      title: "Inclusivity",
      description: "We celebrate diversity and create a welcoming environment for all.",
      icon: "Users",
    },
  ],

  // ─── Facilities ────────────────────────────────────────────
  facilities: [
    { name: "Smart Classrooms",  icon: "Monitor",      description: "Digital boards and interactive learning in every classroom" },
    { name: "Science Labs",      icon: "FlaskConical",  description: "Fully equipped Physics, Chemistry, and Biology labs" },
    { name: "Computer Lab",      icon: "Laptop",        description: "60+ systems with high-speed internet connectivity" },
    { name: "Library",           icon: "BookOpen",      description: "10,000+ books, digital resources, and reading zone" },
    { name: "Transport",         icon: "Bus",           description: "GPS-tracked buses covering all major city routes" },
    { name: "Medical Room",      icon: "Stethoscope",   description: "Full-time nurse and first-aid on campus" },
  ],

  // ─── Grades Offered ────────────────────────────────────────
  grades: [
    { level: "Pre-Primary",      classes: "Nursery, LKG, UKG", ageGroup: "3–5 years" },
    { level: "Primary",          classes: "Class I – V",        ageGroup: "6–10 years" },
    { level: "Middle School",    classes: "Class VI – VIII",     ageGroup: "11–13 years" },
    { level: "Secondary",        classes: "Class IX – X",        ageGroup: "14–15 years" },
    { level: "Senior Secondary", classes: "Class XI – XII",      ageGroup: "16–17 years" },
  ],

  // ─── Fee Structure ─────────────────────────────────────────
  feeStructure: [
    { grade: "Nursery – UKG",   annual: "₹45,000", admission: "₹10,000" },
    { grade: "Class I – V",     annual: "₹55,000", admission: "₹12,000" },
    { grade: "Class VI – VIII", annual: "₹65,000", admission: "₹15,000" },
    { grade: "Class IX – X",    annual: "₹75,000", admission: "₹15,000" },
    { grade: "Class XI – XII",  annual: "₹85,000", admission: "₹18,000" },
  ],
} as const;

export type SiteConfig = typeof siteConfig;
