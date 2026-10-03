"use server";

import { redirect } from "next/navigation";
import { calculateScore, getScoreColumn, isInterestPeriodValid } from "@/lib/economic-model";
import { createServerSupabase } from "@/lib/supabase/server";

export async function cbsend(
  id: number,
  game: number,
  data: {
    i0: number;
    i1: number;
    i2: number;
    i3: number;
    i4: number;
    o1: number;
    o2: number;
    o3: number;
    o4: number;
    r1: number;
    r2: number;
    r3: number;
    r4: number;
    s: number;
  }
) {
  const supabase = createServerSupabase();
  const done = calculateScore(
    [data.i1, data.i2, data.i3, data.i4],
    [data.o1, data.o2, data.o3, data.o4]
  );

  const updateObject =
    getScoreColumn(game) === "s1"
      ? { id, game, s1: data.s }
      : { id, game, s2: data.s };

  if (
    isInterestPeriodValid(data.r1, data.i0, data.i1, data.o1) &&
    isInterestPeriodValid(data.r2, data.i1, data.i2, data.o2) &&
    isInterestPeriodValid(data.r3, data.i2, data.i3, data.o3) &&
    isInterestPeriodValid(data.r4, data.i3, data.i4, data.o4)
  ) {
    if (done === data.s) {
      const { error } = await supabase
        .from("cbgame")
        .update(updateObject)
        .eq("id", id);
      if (error) {
        return { message: error.message };
      }

      redirect("/inflation");
    }

    return { message: "Score does not match with the server" };
  }

  return { message: "Invalid data" };
}
