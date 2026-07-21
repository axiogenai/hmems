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
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
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
    const redirectTo = siteUrl ? `${siteUrl}/update-password` : undefined;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, { 
      redirectTo 
    }); 

    if (authError) { 
      return { success: false, error: authError.message }; 
    }

    if (authData.user) {
      // Insert new profile
      await supabaseAdmin.from("profiles").insert({ 
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
