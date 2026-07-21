-- 1. Create Profiles Table for Role-Based Access
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'teacher', 'parent')),
    email TEXT NOT NULL,
    linked_entity_id TEXT, -- E.g. parent name or student UUID depending on role
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for Profiles (Optional, but good practice)
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
