import { cookies } from "next/headers";
import { DeezButton } from "@/components/deez-button";
import { DeezCounter } from "@/components/deez-counter";
import { LoadingButton } from "@/components/loading-button";
import { GameFetcher } from "@/components/game-fetcher";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createServerSupabase } from "@/lib/supabase/server";
import { getPlayerSuffix, getRequestIp } from "@/lib/request";

import dynamic from "next/dynamic";
const ResultPage = dynamic(() => import("@/components/result-page"), {
  ssr: false,
});
const Consume = dynamic(() => import("@/components/consume"), {
  ssr: false,
});

export default async function Apple({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const ip = getRequestIp();
  const iHope = getPlayerSuffix(ip);
  const supabase = createServerSupabase();

  const { data: game, error: gameError } = await supabase
    .from("igames")
    .select("id, active, period");
  if (gameError) {
    throw new Error(gameError.message);
  }

  if (game.length === 0) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex justify-center items-center p-6 text-center text-xl">
        <div className="flex">Game not found</div>
      </main>
    );
  }

  const gameId = game[0].id;
  const gamePeriod = game[0].period;
  const gameActive = game[0].active;

  const { data: player, error: playerError } = await supabase
    .from("iplayers")
    .select("id, username, apple, balance, demand, period")
    .eq("ip", ip)
    .eq("game", gameId);
  if (playerError) {
    throw new Error(playerError.message);
  }

  const playerId = player[0]?.id;
  const playerName = player[0]?.username ?? "deez.nuts";
  const splitter = playerName.split(".");
  const firstName = splitter[0];
  const uniqueName = splitter[1];
  const apple = player[0]?.apple ?? 0;
  const demand = player[0]?.demand ?? 0;
  const balance = player[0]?.balance ?? 10;
  const playerPeriod = player[0]?.period ?? 0;

  const fApple = parseFloat(apple.toFixed(2));
  const fBalance = parseFloat(balance.toFixed(2));

  if (!gameActive) {
    const { data: logs, error: logsError } = await supabase
      .from("ilogs")
      .select("balances, expenditure, period, price")
      .eq("game", gameId);
    if (logsError) {
      throw new Error(logsError.message);
    }

    const { data: winners } = await supabase
      .from("iplayers")
      .select("apple, username")
      .eq("game", gameId)
      .order("apple", { ascending: false })
      .limit(5);

    return (
      <main className="min-h-[calc(100vh-4rem)] flex flex-col">
        <div className="flex flex-col grow justify-center items-center gap-4 p-6 sm:p-12">
          {fApple > 0 && (
            <>
              <div className="text-2xl">
                {firstName}
                <span className="opacity-25">#{uniqueName}</span>
              </div>
              <div className="flex items-center text-sm gap-1">
                Your total apple consumption:
                <span className="text-red-500">{fApple}</span> kg
              </div>
            </>
          )}
          {winners && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex text-2xl">Leaderboard</div>
              <ul className="flex flex-col text-sm gap-3">
                {winners.map((winner, index) => (
                  <li
                    key={winner.username}
                    className="flex justify-between gap-3"
                  >
                    <div>
                      {index + 1}. {winner.username.split(".")[0]}
                      <span className="opacity-25">
                        #{winner.username.split(".")[1]}
                      </span>
                    </div>
                    <div>
                      <span className="text-red-500">
                        {winner.apple.toFixed(2)}
                      </span>{" "}
                      kg
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <ResultPage data={logs} />
        </div>
      </main>
    );
  }

  // if (ip.startsWith("95.183.240")) {
  //   return (
  //     <main className="min-h-screen flex justify-center items-center text-2xl p-12">
  //       <div className="flex text-center">Please use your cellular network</div>
  //     </main>
  //   );
  // }

  if (player.length === 0 && gamePeriod > 0) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex justify-center items-center p-6 text-center text-xl">
        <div className="flex">You are late</div>
      </main>
    );
  }

  async function username(formData: FormData) {
    "use server";

    const uchema = z.object({
      username: z
        .string()
        .min(3)
        .max(11)
        .regex(/^[a-zA-Z0-9]+$/),
    });
    const uparsed = uchema.safeParse({
      username: formData.get("username"),
    });
    if (!uparsed.success) {
      redirect("/apple?error=Invalid%20username");
    }

    const supabaseUction = createServerSupabase();

    const unique = uparsed.data.username + "." + iHope;
    cookies().set("username", unique);

    const { error: newError } = await supabaseUction.from("iplayers").insert({
      ip,
      game: gameId,
      username: unique,
    });
    if (newError) {
      redirect(`/apple?error=${newError.message}`);
    }

    redirect("/apple");
  }

  if (player.length === 0 && gamePeriod === 0) {
    const cookiename = cookies().get("username")?.value;
    if (cookiename) {
      const { error: nahhError } = await supabase.from("iplayers").insert({
        ip,
        game: gameId,
        username: cookiename,
      });
      if (nahhError) {
        redirect(`/apple?error=${nahhError.message}`);
      }

      redirect("/apple");
    }

    return (
      <main className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center p-6">
        <form className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6 shadow-sm" action={username}>
          <label htmlFor="apple-username" className="block text-center text-xl font-semibold">Enter your username</label>
          <Input
            id="apple-username"
            type="text"
            name="username"
            placeholder="Username"
            pattern="[a-zA-Z0-9]{3,11}"
            required
          />
          <LoadingButton />
          {searchParams.error ? <p role="alert" className="text-center text-sm text-destructive">{searchParams.error}</p> : null}
        </form>
      </main>
    );
  }

  const playerData = {
    fBalance,
    demand,
    period: playerPeriod,
  };

  if (gamePeriod < playerPeriod) {
    return (
      <main className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center gap-4 p-6 text-xl">
        <GameFetcher player={playerData} gameId={gameId} />
      </main>
    );
  }

  async function play(formData: FormData) {
    "use server";

    const schema = z.object({
      amount: z.number().min(0).max(balance),
    });
    const parsed = schema.safeParse({
      amount: Number(formData.get("bid")),
    });
    if (!parsed.success) {
      redirect("/apple?error=Invalid%20bid%20amount");
    }

    const supabaseEction = createServerSupabase();

    const { error: rpcError } = await supabaseEction.rpc("safeplay", {
      dema: parsed.data.amount,
      game_id: gameId,
      peri: gamePeriod,
      player_id: playerId,
    });
    if (rpcError) {
      redirect(`/apple?error=${rpcError.message}`);
    }

    redirect("/apple");
  }

  const { data: log, error: logError } = await supabase
    .from("ilogs")
    .select("price")
    .eq("game", gameId)
    .eq("period", gamePeriod - 1);
  if (logError) {
    throw new Error(logError.message);
  }

  const price = log[0]?.price ?? 0;

  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center gap-6 p-6 text-lg sm:text-xl">
      <div>
        {firstName}
        <span className="opacity-25">#{uniqueName}</span>
      </div>
      <div>
        You have <span className="font-bold text-green-400">{fBalance}</span>{" "}
        Game Liras (GL)
      </div>
      <Consume period={gamePeriod} price={price} />
      <form className="flex flex-col gap-6 items-center" action={play}>
        <div className="flex font-bold text-center">
          How much would you spend?
        </div>
        <div>
          <div className="flex">
            <DeezButton val={balance} />
            <DeezButton val={balance * 0.75} />
          </div>
          <div className="flex">
            <DeezButton val={balance * 0.5} />
            <DeezButton val={balance * 0.25} />
          </div>
        </div>
        <DeezCounter />
        {searchParams.error ? <p role="alert" className="text-center text-sm text-destructive">{searchParams.error}</p> : null}
      </form>
    </main>
  );
}
