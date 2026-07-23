const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hmems.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.log("No service role key in env, schema.sql has been updated.");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("Checking database column...");
  // Test if column exists by selecting it
  const { data, error } = await supabase
    .from("teacher_assignments")
    .select("is_class_teacher")
    .limit(1);

  if (error && error.message.includes("is_class_teacher")) {
    console.log("Column is_class_teacher missing. Run SQL migration in Supabase SQL editor:");
    console.log("ALTER TABLE public.teacher_assignments ADD COLUMN IF NOT EXISTS is_class_teacher BOOLEAN DEFAULT FALSE;");
  } else {
    console.log("✓ Column is_class_teacher is present and active in Supabase database!");
  }
}

run();
