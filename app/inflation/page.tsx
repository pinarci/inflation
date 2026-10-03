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

const InterestRateGame = dynamic(() => import("@/components/cbgame"), { ssr: false });

export const metadata: Metadata = { title: "Interest Rate Game" };

export default async function Inflation({ searchParams }: { searchParams: { message?: string } }) {
  const ip = getRequestIp();
  const username = cookies().get(PLAYER_IDENTITY_COOKIE)?.value ?? "dn";
  const supabase = createServerSupabase();

  const { data: players, error } = await supabase
    .from("cbgame")
    .select("id, game")
    .eq("ip", ip)
    .eq("username", username);

  if (error) redirect(messageUrl("/inflation", "message", error.message));

  async function setUsername(formData: FormData) {
    "use server";
    const parsed = usernameSchema.safeParse(formData.get("username"));
    if (!parsed.success) redirect("/inflation?message=Invalid%20username");

    const actionClient = createServerSupabase();
    const { error: insertError } = await actionClient.from("cbgame").insert({
      ip,
      username: parsed.data,
      game: 0,
      s1: 0,
      s2: 0,
    });

    if (insertError) {
      const message = insertError.code === "23505" ? "Username taken" : insertError.message;
      redirect(messageUrl("/inflation", "message", message));
    }

    cookies().set(PLAYER_IDENTITY_COOKIE, parsed.data, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    redirect("/inflation");
  }

  if (players.length === 0) {
    return (
      <PageShell>
        <GameIntro
          eyebrow="Monetary policy simulation"
          title="Interest Rate Game"
          description="Set the policy rate over four periods and observe how inflation and the output gap respond."
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
        title="Interest Rate Game"
        description="Set the policy rate over four periods and observe how inflation and the output gap respond."
      />
      <InterestRateGame uid={players[0].id} game={players[0].game} />
      {searchParams.message ? (
        <p role="alert" className="mt-4 text-center text-sm text-destructive">
          {searchParams.message}
        </p>
      ) : null}
    </PageShell>
  );
}
