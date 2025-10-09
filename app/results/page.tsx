import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { redirect } from "next/navigation";
import LeaderboardClient from "@/components/leaderboard";

import { cookies } from "next/headers";

export default async function Results() {
  const username = cookies().get("username")?.value;

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

  const { data, error } = await supabase
    .from("cbgame")
    .select("username, s1, s2, created_at");
  if (error || data.length === 0) {
    redirect("/");
  }

  const { data: mg, error: mge } = await supabase
    .from("mgame")
    .select("username, s1, s2, created_at");
  if (mge || mg.length === 0) {
    redirect("/money");
  }

  const aggregate = data.map((d) => {
    return {
      username: d.username,
      s1: d.s1,
      s2: d.s2,
      score: d.s1 + d.s2,
      created_at: d.created_at,
    };
  });

  const maggregate = mg.map((d) => {
    return {
      username: d.username,
      s1: d.s1,
      s2: d.s2,
      score: d.s1 + d.s2,
      created_at: d.created_at,
    };
  });

  return (
    <main className="min-h-screen flex flex-col">
      <LeaderboardClient
        initialAggregate={aggregate}
        initialMaggregate={maggregate}
      />
    </main>
  );
}
