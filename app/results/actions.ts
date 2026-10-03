"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminPassword } from "@/lib/admin-session";
import { createServerSupabase } from "@/lib/supabase/server";
import { messageUrl } from "@/lib/validation";

export async function resetLeaderboardScores(formData: FormData) {
  if (!isAdminPassword(formData.get("adminpw"))) {
    redirect(messageUrl("/results", "error", "Wrong admin password."));
  }

  const supabase = createServerSupabase();
  const results = await Promise.all([
    supabase.from("cbgame").update({ s1: 0, s2: 0 }).not("id", "is", null),
    supabase.from("mgame").update({ s1: 0, s2: 0 }).not("id", "is", null),
  ]);
  const error = results.find((result) => result.error)?.error;

  if (error) {
    redirect(messageUrl("/results", "error", error.message));
  }

  revalidatePath("/results");
  redirect(messageUrl("/results", "message", "All player scores were reset to zero."));
}
