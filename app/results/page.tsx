import type { Metadata } from "next";
import Link from "next/link";
import LeaderboardClient from "@/components/leaderboard";
import { NewPlayerAction } from "@/components/new-player-action";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { createServerSupabase } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Results" };
export const dynamic = "force-dynamic";

export default async function Results() {
  const supabase = createServerSupabase();
  const [interestResult, moneyResult] = await Promise.all([
    supabase.from("cbgame").select("username, s1, s2, created_at"),
    supabase.from("mgame").select("username, s1, s2, created_at"),
  ]);

  if (interestResult.error) throw new Error(interestResult.error.message);
  if (moneyResult.error) throw new Error(moneyResult.error.message);

  const toScores = (rows: typeof interestResult.data) =>
    rows.map((row) => ({
      username: row.username,
      s1: row.s1,
      s2: row.s2,
      score: row.s1 + row.s2,
      created_at: row.created_at,
    }));

  return (
    <PageShell>
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary/60">Performance</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Leaderboard</h1>
          <p className="mt-3 text-muted-foreground">Compare Game 1, Game 2, and combined scores across both monetary-policy simulations.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm"><Link href="/">Home</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href="/inflation">Interest Rate</Link></Button>
          <Button asChild variant="outline" size="sm"><Link href="/money">Money Growth</Link></Button>
          <NewPlayerAction label="Reset player" destination="/inflation" subtle />
        </div>
      </div>
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <p className="font-semibold">Interest Rate</p>
          <p className="mt-1 text-sm text-muted-foreground">{interestResult.data.length} player {interestResult.data.length === 1 ? "record" : "records"}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="font-semibold">Money Growth</p>
          <p className="mt-1 text-sm text-muted-foreground">{moneyResult.data.length} player {moneyResult.data.length === 1 ? "record" : "records"}</p>
        </div>
      </div>
      <LeaderboardClient initialAggregate={toScores(interestResult.data)} initialMaggregate={toScores(moneyResult.data)} />
    </PageShell>
  );
}
