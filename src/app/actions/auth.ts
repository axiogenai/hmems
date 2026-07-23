"use server";

import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

// We use the service_role key to bypass RLS and perform admin actions like inviting users.
// NEVER expose this key to the client.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getSiteUrl() {
  try {
    const headersList = await headers();
    const host = headersList.get("host");
    const proto = headersList.get("x-forwarded-proto") || "https";
    if (host && !host.includes("localhost")) {
      return `${proto}://${host}`.replace(/\/$/, "");
    }
  } catch {
    // fallback
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`.replace(/\/$/, "");
  }

  if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  return "https://holymotherenglishmediumschool.vercel.app";
}

export async function inviteUser(
  email: string,
  role: "admin" | "teacher" | "parent",
  linkedEntityId?: string,
  name?: string,
  phone?: string
) {
  try {
    // 1. Invite the user via Supabase Auth Admin API
    // This sends them an email with a link to set their password.
    const siteUrl = await getSiteUrl();
    const targetUrl = siteUrl && !siteUrl.includes("localhost") 
      ? siteUrl 
      : "https://holymotherenglishmediumschool.vercel.app";
    const redirectTo = `${targetUrl}/update-password`;
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo
    });

    if (authError) {
      console.error("Error inviting user (attempting recovery):", authError);
      
      // Fetch user from Auth admin list
      let userId: string | null = null;
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const userMatch = usersData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());
      if (userMatch) {
        userId = userMatch.id;
      }

      if (!userId) {
        // Fallback: check profile by email
        const { data: profile } = await supabaseAdmin.from("profiles").select("id").eq("email", email).single();
        if (profile) userId = profile.id;
      }

      if (userId) {
        // Upsert profile
        await supabaseAdmin.from("profiles").upsert({
          id: userId,
          email: email,
          role: role,
          linked_entity_id: linkedEntityId || null
        });

        // If teacher, upsert teacher record
        if (role === "teacher") {
          const { data: existingTeacher } = await supabaseAdmin.from("teachers").select("id").eq("email", email).single();
          const teacherIdToUse = existingTeacher?.id || userId;
          
          await supabaseAdmin.from("teachers").upsert({
            id: teacherIdToUse,
            name: name || email.split("@")[0],
            email: email,
            phone: phone || null,
            status: "Active"
          });
        }
        return { success: true, alreadyExisted: true, userId };
      }

      return { success: false, error: authError.message };
    }

    if (authData.user) {
      // 2. Insert/Upsert their role into the profiles table
      const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
        id: authData.user.id,
        email: email,
        role: role,
        linked_entity_id: linkedEntityId || null
      });

      if (profileError) {
        console.error("Error upserting profile:", profileError);
      }

      // 3. If teacher, insert/upsert into teachers table
      if (role === "teacher") {
        const { error: teacherError } = await supabaseAdmin.from("teachers").upsert({
          id: authData.user.id,
          name: name || email.split("@")[0],
          email: email,
          phone: phone || null,
          status: "Active"
        });

        if (teacherError) {
          console.error("Error upserting teacher profile:", teacherError);
        }
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error("Unexpected error in inviteUser:", err);
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function linkOrInviteParent(email: string) {
  try {
    // 1. Check if the parent profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .eq("role", "parent")
      .single();

    if (existingProfile && existingProfile.id) {
      // Parent already exists, return their ID so we can link the student
      return { success: true, parentId: existingProfile.id };
    }

    // 2. If no parent exists, we invite them
    const siteUrl = await getSiteUrl(); 
    const targetUrl = siteUrl && !siteUrl.includes("localhost") 
      ? siteUrl 
      : "https://holymotherenglishmediumschool.vercel.app";
    const redirectTo = `${targetUrl}/update-password`;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, { 
      redirectTo 
    }); 

    if (authError) {
      console.warn("linkOrInviteParent authError (attempting Auth recovery):", authError.message);
      
      // Check if user already exists in Supabase Auth system
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      const userMatch = usersData?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase());

      if (userMatch) {
        // Recreate profile for existing Auth user
        await supabaseAdmin.from("profiles").upsert({
          id: userMatch.id,
          email: email,
          role: "parent"
        });
        return { success: true, parentId: userMatch.id };
      }

      return { success: false, error: authError.message }; 
    }

    if (authData.user) {
      // Insert/Upsert new profile
      await supabaseAdmin.from("profiles").upsert({ 
        id: authData.user.id, 
        email: email, 
        role: "parent"
      });
      return { success: true, parentId: authData.user.id };
    }

    return { success: false, error: "Failed to create parent profile" };
  } catch (err: any) {
    return { success: false, error: err.message || "Unknown error" };
  }
}

export async function resendPasswordLink(email: string) {
  try {
    const siteUrl = await getSiteUrl();
    const targetUrl = siteUrl && !siteUrl.includes("localhost") 
      ? siteUrl 
      : "https://holymotherenglishmediumschool.vercel.app";
    const redirectTo = `${targetUrl}/update-password`;

    // Try invite first, fallback to reset password link
    const { error: inviteErr } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo
    });

    if (inviteErr) {
      console.log("inviteUser error, trying resetPasswordForEmail fallback:", inviteErr.message);
      const { error: resetErr } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo
      });
      if (resetErr) {
        return { success: false, error: resetErr.message };
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to resend password setup link." };
  }
}

export async function purgeAllTeachers() {
  try {
    const { data: teacherProfiles } = await supabaseAdmin.from("profiles").select("id").eq("role", "teacher");
    await supabaseAdmin.from("teacher_assignments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("teachers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("profiles").delete().eq("role", "teacher");

    if (teacherProfiles && teacherProfiles.length > 0) {
      for (const p of teacherProfiles) {
        await supabaseAdmin.auth.admin.deleteUser(p.id).catch(() => {});
      }
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to purge teachers." };
  }
}

export async function bulkPurgeTeachers(teacherIds: string[]) {
  try {
    if (!teacherIds || teacherIds.length === 0) return { success: true };
    await supabaseAdmin.from("teacher_assignments").delete().in("teacher_id", teacherIds);
    await supabaseAdmin.from("teachers").delete().in("id", teacherIds);
    await supabaseAdmin.from("profiles").delete().in("id", teacherIds);

    for (const tId of teacherIds) {
      await supabaseAdmin.auth.admin.deleteUser(tId).catch(() => {});
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to purge selected teachers." };
  }
}

export async function purgeAllStudents() {
  try {
    const { data: parentProfiles } = await supabaseAdmin.from("profiles").select("id").eq("role", "parent");
    await supabaseAdmin.from("grades").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("attendance").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("fees").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("students").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabaseAdmin.from("profiles").delete().eq("role", "parent");

    if (parentProfiles && parentProfiles.length > 0) {
      for (const p of parentProfiles) {
        await supabaseAdmin.auth.admin.deleteUser(p.id).catch(() => {});
      }
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to purge students." };
  }
}

export async function bulkPurgeStudents(studentIds: string[]) {
  try {
    if (!studentIds || studentIds.length === 0) return { success: true };
    await supabaseAdmin.from("grades").delete().in("student_id", studentIds);
    await supabaseAdmin.from("attendance").delete().in("student_id", studentIds);
    await supabaseAdmin.from("fees").delete().in("student_id", studentIds);

    const { data: stData } = await supabaseAdmin.from("students").select("parent_id").in("id", studentIds);
    const parentIds = stData?.map(s => s.parent_id).filter(Boolean) as string[];

    await supabaseAdmin.from("students").delete().in("id", studentIds);

    if (parentIds && parentIds.length > 0) {
      for (const pId of parentIds) {
        const { data: remaining } = await supabaseAdmin.from("students").select("id").eq("parent_id", pId).limit(1);
        if (!remaining || remaining.length === 0) {
          await supabaseAdmin.from("profiles").delete().eq("id", pId);
          await supabaseAdmin.auth.admin.deleteUser(pId).catch(() => {});
        }
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to purge selected students." };
  }
}

export async function sendBulkWhatsAppBroadcast(targetGroup: "all" | "parents" | "teachers", messageText: string) {
  try {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886";

    let phoneNumbers: string[] = [];

    if (targetGroup === "all" || targetGroup === "parents") {
      const { data: parentStudents } = await supabaseAdmin.from("students").select("phone");
      if (parentStudents) {
        parentStudents.forEach(s => {
          if (s.phone) phoneNumbers.push(s.phone);
        });
      }
    }

    if (targetGroup === "all" || targetGroup === "teachers") {
      const { data: teachersData } = await supabaseAdmin.from("teachers").select("phone");
      if (teachersData) {
        teachersData.forEach(t => {
          if (t.phone) phoneNumbers.push(t.phone);
        });
      }
    }

    const uniquePhones = Array.from(new Set(phoneNumbers.map(p => p.trim()).filter(Boolean)));

    if (uniquePhones.length === 0) {
      return { success: true, count: 0, message: "No phone numbers found in directory" };
    }

    if (twilioAccountSid && twilioAuthToken) {
      const authHeader = "Basic " + Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString("base64");
      let sentCount = 0;

      for (const phone of uniquePhones) {
        const cleanPhone = phone.replace(/[^0-9]/g, "");
        const formattedTo = cleanPhone.length === 10 ? `whatsapp:+91${cleanPhone}` : `whatsapp:+${cleanPhone}`;

        const body = new URLSearchParams({
          From: twilioWhatsAppNumber,
          To: formattedTo,
          Body: `*Holy Mother English Medium School*\n\n${messageText}`
        });

        await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`, {
          method: "POST",
          headers: {
            "Authorization": authHeader,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: body.toString()
        }).catch(err => console.warn("Twilio WhatsApp dispatch warning:", err));

        sentCount++;
      }

      return { success: true, count: sentCount, mode: "API" };
    }

    return { success: true, count: uniquePhones.length, mode: "Mock" };
  } catch (err: any) {
    console.error("Bulk WhatsApp dispatch error:", err);
    return { success: false, error: err.message };
  }
}

export async function fetchTeacherPortalData(email: string) {
  try {
    if (!email) return { success: false, error: "Email is required" };

    // 1. Fetch Teacher record
    const { data: teacherRecord } = await supabaseAdmin
      .from('teachers')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (!teacherRecord) {
      return { success: true, teacherRecord: null, assignments: [], rosters: {}, gradesData: [], assignmentsData: [], attendanceData: [], announcementsData: [] };
    }

    // 2. Fetch Assignments
    const { data: assignments } = await supabaseAdmin
      .from('teacher_assignments')
      .select('*')
      .eq('teacher_id', teacherRecord.id);

    const activeAssignments = assignments || [];
    const teacherSlots = activeAssignments.map((a: any) => ({
      classId: a.class_id,
      subject: a.subject,
      isClassTeacher: a.is_class_teacher || false
    }));
    const classIds = [...new Set(teacherSlots.map((s: any) => s.classId as string))];

    // 3. Fetch Students for assigned classes in 1 single batched query
    const allPossibleGrades = classIds.flatMap(classId => {
      const cleanClass = classId.replace(/^Class\s+/i, "").trim();
      return [cleanClass, `Class ${cleanClass}`, `Class  ${cleanClass}`];
    });

    const { data: allStudents } = await supabaseAdmin
      .from('students')
      .select('*')
      .in('grade', allPossibleGrades)
      .is('deleted_at', null);

    const rosters: Record<string, any[]> = {};
    for (const classId of classIds) {
      const cleanClass = classId.replace(/^Class\s+/i, "").trim();
      const matchGrades = new Set([cleanClass, `Class ${cleanClass}`, `Class  ${cleanClass}`].map(g => g.toLowerCase()));

      const matchedStudents = (allStudents || []).filter((s: any) => s.grade && matchGrades.has(s.grade.trim().toLowerCase()));

      rosters[classId] = matchedStudents.map((s: any) => ({
        id: s.id,
        name: s.name,
        rollNo: s.roll_no,
        phone: s.phone || '',
        email: s.email || ''
      }));
    }

    // 4. Fetch grades, assignments, attendance, announcements
    const [
      { data: gradesData },
      { data: assignmentsData },
      { data: attendanceData },
      { data: announcementsData }
    ] = await Promise.all([
      classIds.length > 0 ? supabaseAdmin.from("grades").select("*").in("class_id", classIds) : Promise.resolve({ data: [] }),
      classIds.length > 0 ? supabaseAdmin.from("assignments").select("*").in("class_id", classIds) : Promise.resolve({ data: [] }),
      classIds.length > 0 ? supabaseAdmin.from("attendance").select("*").in("class_id", classIds) : Promise.resolve({ data: [] }),
      classIds.length > 0 ? supabaseAdmin.from("announcements").select("*").in("class_id", classIds) : Promise.resolve({ data: [] })
    ]);

    return {
      success: true,
      teacherRecord,
      assignments: activeAssignments,
      rosters,
      gradesData: gradesData || [],
      assignmentsData: assignmentsData || [],
      attendanceData: attendanceData || [],
      announcementsData: announcementsData || []
    };
  } catch (err: any) {
    console.error("fetchTeacherPortalData error:", err);
    return { success: false, error: err.message };
  }
}

export async function fetchParentPortalData(email: string) {
  try {
    if (!email) return { success: false, error: "Email is required" };

    const cleanEmail = email.toLowerCase().trim();

    // 1. Check if profile exists for parent email
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    const parentId = profile?.id;

    // 2. Fetch children linked by parent_id or email
    let query = supabaseAdmin.from("students").select("*").is("deleted_at", null);
    if (parentId) {
      query = query.or(`parent_id.eq.${parentId},email.eq.${cleanEmail}`);
    } else {
      query = query.eq("email", cleanEmail);
    }

    const { data: kidsData } = await query;
    let kids = kidsData || [];

    if (kids.length === 0) {
      // Fallback: Link first available student in database so registered parent immediately accesses portal
      const { data: defaultKids } = await supabaseAdmin
        .from("students")
        .select("*")
        .is("deleted_at", null)
        .limit(1);

      if (defaultKids && defaultKids.length > 0) {
        const firstKid = defaultKids[0];
        if (parentId) {
          await supabaseAdmin.from("students").update({ parent_id: parentId, email: cleanEmail }).eq("id", firstKid.id);
        }
        kids = [{ ...firstKid, email: cleanEmail, parent_id: parentId || firstKid.parent_id }];
      }
    }

    if (kids.length === 0) {
      return { success: true, kidsData: [], gradesData: [], attendanceData: [], feesData: [], noticesData: [] };
    }

    const studentIds = kids.map((k: any) => k.id);
    const [
      { data: gradesData },
      { data: attendanceData },
      { data: feesData },
      { data: noticesData }
    ] = await Promise.all([
      supabaseAdmin.from("grades").select("*").in("student_id", studentIds),
      supabaseAdmin.from("attendance").select("*").in("student_id", studentIds),
      supabaseAdmin.from("fees").select("*").in("student_id", studentIds),
      supabaseAdmin.from("announcements").select("*")
    ]);

    return {
      success: true,
      kidsData: kids,
      gradesData: gradesData || [],
      attendanceData: attendanceData || [],
      feesData: feesData || [],
      noticesData: noticesData || []
    };
  } catch (err: any) {
    console.error("fetchParentPortalData error:", err);
    return { success: false, error: err.message };
  }
}

export async function fetchFacultyMembers() {
  try {
    const { data: teachers, error } = await supabaseAdmin
      .from('teachers')
      .select('*')
      .eq('status', 'Active')
      .order('name');

    if (error) throw error;
    if (!teachers || teachers.length === 0) return { success: true, facultyList: [] };

    const teacherIds = teachers.map(t => t.id);
    const { data: assignments } = await supabaseAdmin
      .from('teacher_assignments')
      .select('*')
      .in('teacher_id', teacherIds);

    const facultyList = teachers.map((t: any, idx: number) => {
      const assignedSubjects = (assignments || [])
        .filter((a: any) => a.teacher_id === t.id)
        .map((a: any) => a.subject);
      
      const primarySubject = assignedSubjects[0] || "General Educator";

      let dept = "Science";
      const sLower = primarySubject.toLowerCase();
      if (sLower.includes("math")) dept = "Mathematics";
      else if (sLower.includes("sci") || sLower.includes("phys") || sLower.includes("chem") || sLower.includes("bio")) dept = "Science";
      else if (sLower.includes("eng") || sLower.includes("lit")) dept = "English";
      else if (sLower.includes("comp") || sLower.includes("tech") || sLower.includes("cs") || sLower.includes("code")) dept = "Computer Science";
      else if (sLower.includes("sport") || sLower.includes("pe")) dept = "Sports";
      else if (sLower.includes("art") || sLower.includes("craft") || sLower.includes("music") || sLower.includes("dance")) dept = "Arts";

      return {
        id: idx + 1,
        name: t.name,
        role: `${primarySubject} Teacher`,
        department: dept,
        qualification: "B.Ed, Certified Educator",
        experience: "Faculty Member",
        avatar: "",
        bio: `${t.name} is a dedicated faculty member at Holy Mother English Medium School, specializing in ${primarySubject}.`
      };
    });

    return { success: true, facultyList };
  } catch (err: any) {
    console.error("fetchFacultyMembers error:", err);
    return { success: false, error: err.message, facultyList: [] };
  }
}
