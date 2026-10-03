"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminSession, isAdminPassword, isAdminSession } from "@/lib/admin-session";
import { createServerSupabase } from "@/lib/supabase/server";
import { messageUrl } from "@/lib/validation";

type GameTable = "cbgame" | "mgame";
type MutationTarget = GameTable | "all";
type MutationMode = "reset" | "clear";

const tableLabels: Record<GameTable, string> = {
  cbgame: "Interest Rate",
  mgame: "Money Growth",
};

function requireAdminSession() {
  if (!isAdminSession(cookies().get("admin-session")?.value)) {
    redirect(messageUrl("/admin", "error", "Your admin session is invalid or has expired."));
  }
}

function parseMutation(formData: FormData): {
  target: MutationTarget;
  mode: MutationMode;
  confirmation: string;
} {
  const target = String(formData.get("target"));
  const mode = String(formData.get("mode"));
  const confirmation = String(formData.get("confirmation") ?? "");

  if (target !== "cbgame" && target !== "mgame" && target !== "all") {
    redirect(messageUrl("/admin", "error", "Invalid maintenance target."));
  }
  if (mode !== "reset" && mode !== "clear") {
    redirect(messageUrl("/admin", "error", "Invalid maintenance action."));
  }

  return { target, mode, confirmation };
}

async function mutateTable(table: GameTable, mode: MutationMode) {
  const supabase = createServerSupabase();
  const result =
    mode === "reset"
      ? await supabase
          .from(table)
          .update({ game: 0, s1: 0, s2: 0 })
          .not("id", "is", null)
      : await supabase.from(table).delete().not("id", "is", null);

  if (result.error) throw new Error(`${tableLabels[table]}: ${result.error.message}`);
}

export async function signIn(formData: FormData) {
  if (!isAdminPassword(formData.get("adminpw"))) {
    redirect(messageUrl("/admin", "error", "Wrong password."));
  }

  cookies().set("admin-session", createAdminSession(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
  });
  redirect("/admin");
}

export async function signOut() {
  cookies().delete("admin-session");
  redirect("/admin");
}

export async function mutateGameData(formData: FormData) {
  requireAdminSession();
  const { target, mode, confirmation } = parseMutation(formData);
  const expectedConfirmation = mode === "reset" ? "RESET" : "CLEAR";

  if (confirmation !== expectedConfirmation) {
    redirect(
      messageUrl(
        "/admin",
        "error",
        `Type ${expectedConfirmation} exactly to confirm this action.`
      )
    );
  }

  const tables: GameTable[] = target === "all" ? ["cbgame", "mgame"] : [target];

  try {
    for (const table of tables) await mutateTable(table, mode);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Database maintenance failed.";
    redirect(messageUrl("/admin", "error", message));
  }

  const targetLabel = target === "all" ? "both games" : tableLabels[target];
  const successMessage =
    mode === "reset"
      ? `Scores and progress reset for ${targetLabel}. Player accounts were kept.`
      : `Players and results cleared for ${targetLabel}.`;
  redirect(messageUrl("/admin", "message", successMessage));
}
