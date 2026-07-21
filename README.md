# HMEMS SchoolSite Pro 🎓

A modern, fully dynamic, database-backed School Management Platform & Website built with **Next.js 16 (App Router)**, **Tailwind CSS v4**, **TypeScript**, and **Supabase**.

---

## 🌟 Key Features

- **School Website**: Homepage, About Us, Academics, Admissions, Student Life, Faculty Directory, News/Blog (`/blog/[slug]`), and Contact.
- **Admin Portal (`/portal/admin`)**:
  - Teacher Directory & Class Assignments (`teacher_assignments`).
  - Student Directory with CSV Batch Import/Export (with automatic parent invite email generation).
  - Admissions Inquiries tracking & approval.
  - Financial records & receipt tracking.
- **Teacher Portal (`/portal/teacher`)**:
  - Live assigned class rosters & student profiles.
  - Daily Attendance Register (Present / Absent / Late / Leave).
  - Student Grades & Score Entry with CSV export.
  - Class Homework Assignments & Noticeboard Announcements.
- **Parent Portal (`/portal/parent`)**:
  - Multi-child student profile selector.
  - Real-time grade cards, attendance rates, and pending fee records.
  - Fee payments with dynamic receipt download generators.

---

## 🛠️ Environment Variables (`.env.local`)

To run the application locally or deploy to production, create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

---

## 🚀 How to Push to GitHub (`hmems`)

1. Open your terminal in the project directory.
2. Run the included helper script or execute standard git commands:

```bash
git init
git add .
git commit -m "Initial commit of HMEMS SchoolSite Pro"
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/hmems.git
git push -u origin main
```

---

## ☁️ Deployment (Vercel)

1. Import your `hmems` repository on [Vercel](https://vercel.com/new).
2. Add your environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`).
3. Set `NEXT_PUBLIC_SITE_URL` to your production URL (e.g., `https://hmems.vercel.app`).
4. Click **Deploy**!
