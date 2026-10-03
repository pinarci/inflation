"use client";

import { useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function PublicFetcher({
  player,
  gameId,
}: {
  player: {
    fBalance: number;
    fContri: number;
    period: number;
  };
  gameId: number;
}) {
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem(
      `contri${player.period - 1}`,
      player.fContri.toFixed(2)
    );

    const fetchData = async () => {
      const supabase = createBrowserSupabase();

      const { data, error } = await supabase
        .from("games")
        .select("active, period")
        .eq("id", gameId);
      if (error || data.length === 0) {
        return;
      }

      const isActive = data[0].active;

      if (!isActive || data[0].period === player.period) {
        return router.refresh();
      }
    };

    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [gameId, player, router]);

  return (
    <section className="w-full max-w-md rounded-2xl border bg-card p-6 text-center shadow-sm" aria-live="polite">
      <h1 className="text-2xl font-semibold">Waiting for the next period</h1>
      <div className="mt-5">Balance: {player.fBalance} GL</div>
      <div>Contribution: {player.fContri} GL</div>
      <p className="mt-4 text-sm text-muted-foreground">This page updates automatically when all players are ready.</p>
    </section>
  );
}
