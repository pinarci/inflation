import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { GameIntro } from "@/components/game-intro";
import { CenteredPanel, PageShell } from "@/components/page-shell";
import { UsernameForm } from "@/components/username-form";
import { getRequestIp } from "@/lib/request";
import { PLAYER_IDENTITY_COOKIE } from "@/lib/player-session";
import { createServerSupabase } from "@/lib/supabase/server";
import { messageUrl, usernameSchema } from "@/lib/validation";

const MoneyGrowthGame = dynamic(() => import("@/components/mgame"), { ssr: false });

export const metadata: Metadata = { title: "Money Growth Game" };

export default async function Money({ searchParams }: { searchParams: { message?: string } }) {
  const ip = getRequestIp();
  const username = cookies().get(PLAYER_IDENTITY_COOKIE)?.value ?? "dn";
  const supabase = createServerSupabase();

  const { data: initialPlayers, error } = await supabase
    .from("mgame")
    .select("id, game")
    .eq("ip", ip)
    .eq("username", username);

  if (error) redirect(messageUrl("/money", "message", error.message));
  let players = initialPlayers;

  async function setUsername(formData: FormData) {
    "use server";
    const parsed = usernameSchema.safeParse(formData.get("username"));
    if (!parsed.success) redirect("/money?message=Invalid%20username");

    const actionClient = createServerSupabase();
    const { error: insertError } = await actionClient.from("mgame").insert({
      ip,
      username: parsed.data,
      game: 0,
      s1: 0,
      s2: 0,
    });

    if (insertError) {
      const message = insertError.code === "23505" ? "Username taken" : insertError.message;
      redirect(messageUrl("/money", "message", message));
    }

    cookies().set(PLAYER_IDENTITY_COOKIE, parsed.data, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    redirect("/money");
  }

  if (players.length === 0 && username !== "dn") {
    const { data: createdPlayer, error: insertError } = await supabase
      .from("mgame")
      .insert({ ip, username, game: 0, s1: 0, s2: 0 })
      .select("id, game")
      .single();

    if (!insertError) {
      players = [createdPlayer];
    } else if (insertError.code === "23505") {
      const { data: existingPlayers, error: lookupError } = await supabase
        .from("mgame")
        .select("id, game")
        .eq("username", username)
        .limit(1);

      if (lookupError) redirect(messageUrl("/money", "message", lookupError.message));
      players = existingPlayers;
    } else {
      redirect(messageUrl("/money", "message", insertError.message));
    }
  }

  if (players.length === 0) {
    return (
      <PageShell>
        <GameIntro
          eyebrow="Monetary policy simulation"
          title="Money Growth Game"
          description="Set money growth over four periods and observe how inflation and the output gap respond."
        />
        <CenteredPanel title="Choose your player name" description="Your scores will appear on the shared leaderboard.">
          <UsernameForm action={setUsername} message={searchParams.message} />
        </CenteredPanel>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <GameIntro
        eyebrow="Monetary policy simulation"
        title="Money Growth Game"
        description="Set money growth over four periods and observe how inflation and the output gap respond."
      />
      <MoneyGrowthGame uid={players[0].id} game={players[0].game} />
      {searchParams.message ? <p role="alert" className="mt-4 text-center text-sm text-destructive">{searchParams.message}</p> : null}
    </PageShell>
  );
}
