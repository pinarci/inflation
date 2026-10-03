"use server";

import { redirect } from "next/navigation";
import { calculateScore, getScoreColumn, isMoneyPeriodValid } from "@/lib/economic-model";
import { createServerSupabase } from "@/lib/supabase/server";

export async function msend(
  id: number,
  game: number,
  data: {
    i0: number;
    i1: number;
    i2: number;
    i3: number;
    i4: number;
    o0: number;
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
    isMoneyPeriodValid(data.r1, data.i0, data.i1, data.o0, data.o1) &&
    isMoneyPeriodValid(data.r2, data.i1, data.i2, data.o1, data.o2) &&
    isMoneyPeriodValid(data.r3, data.i2, data.i3, data.o2, data.o3) &&
    isMoneyPeriodValid(data.r4, data.i3, data.i4, data.o3, data.o4)
  ) {
    if (done === data.s) {
      const { error } = await supabase
        .from("mgame")
        .update(updateObject)
        .eq("id", id);
      if (error) {
        return { message: error.message };
      }

      redirect("/money");
    }

    return { message: "Score does not match with the server" };
  }

  return { message: "Invalid data" };
}
