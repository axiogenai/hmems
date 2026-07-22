const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const supabaseServiceKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log("Fetching students...");
  const { data: students, error } = await supabase
    .from('students')
    .select('id, name, roll_no, grade, parent_id')
    .is('deleted_at', null);

  if (error) {
    console.error("Error fetching students:", error);
    return;
  }

  console.log(`Found ${students.length} active students.`);

  // Group by grade and roll_no
  const groups = {};
  students.forEach(s => {
    const key = `${s.grade.toLowerCase().trim()}_${s.roll_no.toLowerCase().trim()}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(s);
  });

  const duplicates = Object.values(groups).filter(g => g.length > 1);
  console.log(`Found ${duplicates.length} duplicate groups.`);

  if (duplicates.length === 0) {
    console.log("No duplicate student records found!");
    return;
  }

  for (const group of duplicates) {
    // Keep the first student, delete the others
    const keep = group[0];
    const deleteList = group.slice(1);
    console.log(`Keeping student: ${keep.name} (Roll: ${keep.roll_no}, Class: ${keep.grade}, ID: ${keep.id})`);
    
    for (const s of deleteList) {
      console.log(`Deleting duplicate student: ${s.name} (Roll: ${s.roll_no}, Class: ${s.grade}, ID: ${s.id})`);
      
      // Delete child associations
      await supabase.from('grades').delete().eq('student_id', s.id);
      await supabase.from('attendance').delete().eq('student_id', s.id);
      await supabase.from('fees').delete().eq('student_id', s.id);
      
      // Delete student row
      const { error: delErr } = await supabase.from('students').delete().eq('id', s.id);
      if (delErr) {
        console.error(`Failed to delete student ${s.id}:`, delErr.message);
      } else {
        console.log(`Successfully deleted duplicate student ${s.id}`);
      }
    }
  }

  console.log("Cleanup complete!");
}

main();
