import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";
import { hasSupabaseEnv } from "@/lib/env";

export async function getSessionUser() {
  if (!hasSupabaseEnv()) redirect("/setup");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function getProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single<Profile>();
  return data;
}

export async function requireProfile() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  if (!profile) redirect("/login");
  return { user, profile };
}

export async function requireAdmin() {
  const ctx = await requireProfile();
  if (ctx.profile.role !== "admin") redirect("/dashboard");
  return ctx;
}
