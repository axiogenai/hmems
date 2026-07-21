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

-- 9. Create Activity Logs Table
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    text TEXT NOT NULL,
    type TEXT NOT NULL,
    timestamp BIGINT NOT NULL
);

-- Set up Row Level Security (RLS) policies if needed. 
-- For a basic setup where the frontend talks directly to the DB without auth,
-- you might want to disable RLS, but it's heavily recommended to enable it in production.
-- (RLS is disabled by default for these new tables, meaning full access for Anon key).
