-- Enable RLS on teachers, teacher_assignments, and profiles
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies to allow authenticated users full access to teachers & assignments
DROP POLICY IF EXISTS "Allow authenticated full access to teachers" ON public.teachers;
CREATE POLICY "Allow authenticated full access to teachers" ON public.teachers FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated full access to teacher_assignments" ON public.teacher_assignments;
CREATE POLICY "Allow authenticated full access to teacher_assignments" ON public.teacher_assignments FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated full access to profiles" ON public.profiles;
CREATE POLICY "Allow authenticated full access to profiles" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow public read access for website faculty directory
DROP POLICY IF EXISTS "Allow anon read teachers" ON public.teachers;
CREATE POLICY "Allow anon read teachers" ON public.teachers FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Allow anon read teacher_assignments" ON public.teacher_assignments;
CREATE POLICY "Allow anon read teacher_assignments" ON public.teacher_assignments FOR SELECT TO anon USING (true);
