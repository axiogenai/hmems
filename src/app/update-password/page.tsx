"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if the user is actually logged in (which happens when clicking the invite link)
    const checkSession = async () => {
      // Small delay to allow Supabase to process the URL hash if it's a new invite link
      setTimeout(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setError("Your session has expired or the link is invalid. Please contact the administrator.");
          return;
        }

        // Check if they are accidentally still logged in as admin
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
        if (profile && profile.role === "admin") {
          setError("Warning: You are currently logged in as an Admin. If you set a password now, you will change your ADMIN password, not the parent's password. Please log out of the admin dashboard first, or open the email link in an Incognito/Private window.");
        }
      }, 500);
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      setSuccess(true);
      
      // Get the profile to know where to redirect
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      
      // Sign the user out so they are forced to log in with their new password
      await supabase.auth.signOut();
      
      setTimeout(() => {
        if (profile && profile.role === "admin") {
          router.push("/portal/admin");
        } else if (profile && profile.role === "teacher") {
          router.push("/portal/teacher");
        } else if (profile && profile.role === "parent") {
          router.push("/portal/parent");
        } else {
          router.push("/portal/parent"); // Fallback to a login page
        }
      }, 2000);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col items-center">
      <div className="w-full">
        <PageHeader title="Set Your Password" breadcrumb="Account Setup" />
      </div>

      <div className="w-full max-w-md mt-12 bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent">
            <Lock size={32} />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">Create Password</h2>
        <p className="text-sm text-center text-slate-500 mb-8">
          Welcome to the school portal! Please set a secure password for your account.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-50 text-green-600 p-6 rounded-xl text-center border border-green-100">
            <h3 className="font-bold text-lg mb-2">Password Set Successfully!</h3>
            <p className="text-sm">You are now being redirected to the login page...</p>
            <Loader2 className="animate-spin mx-auto mt-4" size={24} />
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all text-slate-700"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all text-slate-700"
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-slate-800 text-white rounded-xl font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 mt-8"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Saving...
                </>
              ) : (
                "Save Password & Continue"
              )}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
