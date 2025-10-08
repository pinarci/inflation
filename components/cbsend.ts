"use server";

import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { redirect } from "next/navigation";

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
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  function formula(r: number, ib: number, ia: number, oa: number) {
    const og = ib - r + 1;
    const inf = ib + og;
    const to = Number(og.toFixed(2));
    const ti = Number(inf.toFixed(2));
    if (to === oa && ti === ia) return true;
    return false;
  }

  const calc =
    200 -
    Math.pow(data.i1 - 2, 2) -
    Math.pow(data.i2 - 2, 2) -
    Math.pow(data.i3 - 2, 2) -
    Math.pow(data.i4 - 2, 2) +
    5 * data.o1 +
    5 * data.o2 +
    5 * data.o3 +
    5 * data.o4;
  const done = calc < 0 ? 0 : calc;

  const updateObject = {
    id,
    game,
    ...(game === 1 ? { s1: data.s } : { s2: data.s }),
  };

  if (
    formula(data.r1, data.i0, data.i1, data.o1) &&
    formula(data.r2, data.i1, data.i2, data.o2) &&
    formula(data.r3, data.i2, data.i3, data.o3) &&
    formula(data.r4, data.i3, data.i4, data.o4)
  ) {
    if (done === data.s) {
      const { error } = await supabase
        .from("cbgame")
        .update(updateObject)
        .eq("id", id);
      if (error) {
        return { message: error.message };
      }

      redirect("/");
    }

    return { message: "Score does not match with the server" };
  }

  return { message: "Invalid data" };
}
