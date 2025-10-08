"use client";

import { useEffect } from "react";
import { Database } from "@/types/supabase";
import { createBrowserSupabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export function GameFetcher({
  player,
}: {
  player: {
    fBalance: number;
    demand: number;
    period: number;
  };
}) {
  const router = useRouter();

  useEffect(() => {
    localStorage.setItem(`demand${player.period - 1}`, player.demand.toFixed(4));
  
    const fetchData = async () => {
      const supabase = createBrowserSupabase();

      const { data, error } = await supabase
        .from("igames")
        .select("active, period");
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
  }, [player, router]);

  return (
    <>
      <div className="flex">Balance: {player.fBalance} GL</div>
      <div className="flex">
        Spending: {parseFloat(player.demand.toFixed(2))} GL
      </div>
      <div className="flex">Waiting for other players</div>
    </>
  );
}
