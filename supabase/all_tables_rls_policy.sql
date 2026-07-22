-- Enable RLS & Create Policies for All Public Tables in SchoolSite Pro
-- Run this in Supabase SQL Editor to grant read/write access to all tables for anon and authenticated users

-- 1. Students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access to students" ON public.students;
CREATE POLICY "Allow full access to students" ON public.students FOR ALL USING (true) WITH CHECK (true);

-- 2. Teachers
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access to teachers" ON public.teachers;
CREATE POLICY "Allow full access to teachers" ON public.teachers FOR ALL USING (true) WITH CHECK (true);

-- 3. Teacher Assignments
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access to teacher_assignments" ON public.teacher_assignments;
CREATE POLICY "Allow full access to teacher_assignments" ON public.teacher_assignments FOR ALL USING (true) WITH CHECK (true);

-- 4. Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access to profiles" ON public.profiles;
CREATE POLICY "Allow full access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- 5. Grades
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access to grades" ON public.grades;
CREATE POLICY "Allow full access to grades" ON public.grades FOR ALL USING (true) WITH CHECK (true);

-- 6. Attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access to attendance" ON public.attendance;
CREATE POLICY "Allow full access to attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);

-- 7. Fees
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access to fees" ON public.fees;
CREATE POLICY "Allow full access to fees" ON public.fees FOR ALL USING (true) WITH CHECK (true);

-- 8. Applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access to applications" ON public.applications;
CREATE POLICY "Allow full access to applications" ON public.applications FOR ALL USING (true) WITH CHECK (true);

-- 9. Announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow full access to announcements" ON public.announcements;
CREATE POLICY "Allow full access to announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
