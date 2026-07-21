-- SUPABASE SQL SCHEMA FOR SCHOOLSITE PRO

-- 1. Create Students Table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    roll_no TEXT NOT NULL,
    grade TEXT NOT NULL,
    section TEXT,
    parent TEXT NOT NULL,
    parent_id TEXT,
    status TEXT DEFAULT 'Active',
    dob DATE,
    email TEXT,
    phone TEXT,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- 2. Create Applications Table (Admissions)
CREATE TABLE public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    grade TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    parent_name TEXT,
    parent_phone TEXT,
    parent_email TEXT,
    document TEXT,
    applied_date DATE DEFAULT CURRENT_DATE,
    reviewed_date DATE,
    reviewed_by TEXT,
    notes TEXT
);

-- 3. Create Grades Table
CREATE TABLE public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id TEXT NOT NULL, -- e.g., 'IX-A'
    subject TEXT NOT NULL,
    test TEXT NOT NULL,
    score NUMERIC NOT NULL,
    max_score NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create Assignments Table
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    due_date DATE NOT NULL,
    total NUMERIC NOT NULL,
    submitted NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create Attendance Table
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    class_id TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL, -- 'Present', 'Absent', 'Late', 'Leave'
    reason TEXT,
    remarks TEXT,
    UNIQUE (student_id, date) -- One record per student per day
);

-- 6. Create Announcements Table
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    class_id TEXT, -- Null means school-wide
    subject TEXT, -- Null means not subject-specific
    date DATE DEFAULT CURRENT_DATE,
    priority TEXT DEFAULT 'Normal',
    target TEXT DEFAULT 'All',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create Fee Records Table
CREATE TABLE public.fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    term TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    status TEXT DEFAULT 'Pending',
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create Payment Logs Table
CREATE TABLE public.payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    family TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    method TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    reference_no TEXT NOT NULL,
    receipt_url TEXT,
    status TEXT DEFAULT 'Success',
    term TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create Profiles Table (User roles mapping)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL, -- 'admin', 'teacher', 'parent'
    linked_entity_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Create Teachers Table
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Create Teacher Assignments Table
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.teachers(id) ON DELETE CASCADE,
    class_id TEXT NOT NULL, -- e.g., 'IX-A'
    subject TEXT NOT NULL,  -- e.g., 'Mathematics'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (teacher_id, class_id, subject)
);

-- Enable RLS & Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow full access to profiles" ON public.profiles;
CREATE POLICY "Allow full access to profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to teachers" ON public.teachers;
CREATE POLICY "Allow full access to teachers" ON public.teachers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow full access to teacher_assignments" ON public.teacher_assignments;
CREATE POLICY "Allow full access to teacher_assignments" ON public.teacher_assignments FOR ALL USING (true) WITH CHECK (true);

