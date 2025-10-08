import { cookies, headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { DeezButton } from "@/components/deez-button";
import { DeezCounter } from "@/components/deez-counter";
import { LoadingButton } from "@/components/loading-button";
import { PublicFetcher } from "@/components/public-fetcher";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { z } from "zod";
import Hamburger from "@/components/hamburger";

export default async function Public() {
  const header = headers();
  const ip = header.get("x-real-ip") ?? "95.183.240.91"; // header.get("x-forwarded-for")
  const reverseIp = ip.split(".").reverse();
  const iHope = reverseIp[0] + reverseIp[1];

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

  const { data: game, error: gameError } = await supabase
    .from("games")
    .select("id, active, period")
    .order("created_at", { ascending: false })
    .limit(1);
  if (gameError) {
    redirect(`/public?error=${gameError.message}`);
  }

  if (game.length === 0) {
    return (
      <main className="min-h-screen flex justify-center items-center text-2xl p-12">
        <div className="flex">Game not found</div>
      </main>
    );
  }

  const gameId = game[0].id;
  const gamePeriod = game[0].period;
  const gameActive = game[0].active;

  const { data: player, error: playerError } = await supabase
    .from("players")
    .select("id, balance, contri, period, username")
    .eq("ip", ip)
    .eq("game", gameId);
  if (playerError) {
    redirect(`/public?error=${playerError.message}`);
  }

  const playerId = player[0]?.id;
  const balance = player[0]?.balance ?? 10;
  const contri = player[0]?.contri ?? 0;
  const playerPeriod = player[0]?.period ?? 0;
  const playerName = player[0]?.username ?? "deez.nuts";

  const splitter = playerName.split(".");
  const firstName = splitter[0];
  const uniqueName = splitter[1];

  const fBalance = parseFloat(balance.toFixed(2));
  const fContri = parseFloat(contri.toFixed(2));

  if (!gameActive) {
    const { data: winners } = await supabase
      .from("players")
      .select("balance, username")
      .eq("game", gameId)
      .order("balance", { ascending: false })
      .limit(5);

    return (
      <main className="min-h-screen flex flex-col">
        <div className="flex flex-row justify-center border-b h-[57px]">
          <div className="flex items-center justify-between max-w-4xl w-full px-4">
            <div className="flex w-[90px] justify-start">
              <Hamburger />
            </div>
            <a href="/" className="hidden sm:flex text-3xl font-semibold">
              MacroGames
            </a>
            <div className="flex w-[90px] justify-end"></div>
          </div>
        </div>
        <div className="flex flex-col grow justify-center items-center gap-6 p-12">
          {playerPeriod > 0 && (
            <div className="flex flex-col items-center text-2xl">
              <div>
                {firstName}
                <span className="opacity-25">#{uniqueName}</span>
              </div>
              <div className="flex gap-1">
                Your balance:
                <span className="text-green-500">{fBalance}</span> GL
              </div>
            </div>
          )}
          {winners && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex text-2xl">Leaderboard</div>
              <ul className="flex flex-col gap-3">
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
                      <span className="text-green-500">
                        {winner.balance.toFixed(0)}
                      </span>{" "}
                      GL
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex flex-col">
            <div className="text-2xl py-2">TEDU ERU</div>
            <Button asChild variant="secondary">
              <a
                href="https://sites.google.com/view/erutedu/home"
                target="_blank"
              >
                About us
              </a>
            </Button>
          </div>
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
      <main className="min-h-screen flex justify-center items-center text-2xl p-12">
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
      redirect("/public?error=Invalid%20username");
    }

    const supabaseUction = createClient<Database>(
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

    const unique = uparsed.data.username + "." + iHope;
    cookies().set("username", unique);

    const { error: newError } = await supabaseUction.from("players").insert({
      ip,
      game: gameId,
      username: unique,
    });
    if (newError) {
      redirect(`/public?error=${newError.message}`);
    }

    redirect("/public");
  }

  if (player.length === 0 && gamePeriod === 0) {
    const cookiename = cookies().get("username")?.value;
    if (cookiename) {
      const { error: nahhError } = await supabase.from("players").insert({
        ip,
        game: gameId,
        username: cookiename,
      });
      if (nahhError) {
        redirect(`/public?error=${nahhError.message}`);
      }

      redirect("/public");
    }

    return (
      <main className="min-h-screen flex flex-col justify-center items-center p-12">
        <form className="flex flex-col gap-6" action={username}>
          <div className="flex justify-center">Enter your username</div>
          <Input
            type="text"
            name="username"
            placeholder="Username"
            pattern="[a-zA-Z0-9]{3,11}"
            required
          />
          <LoadingButton />
        </form>
      </main>
    );
  }

  const playerData = {
    fBalance,
    fContri,
    period: playerPeriod,
  };

  if (gamePeriod < playerPeriod) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center gap-6 text-2xl p-12">
        <PublicFetcher player={playerData} />
      </main>
    );
  }

  async function play(formData: FormData) {
    "use server";

    const schema = z.object({
      bid: z.number().min(0).max(balance),
    });
    const parsed = schema.safeParse({
      bid: Number(formData.get("bid")),
    });
    if (!parsed.success) {
      redirect("/public?error=Invalid%20contribution%20amount");
    }

    const supabaseEction = createClient<Database>(
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

    const { error: rpcError } = await supabaseEction.rpc("publicg", {
      cont: parsed.data.bid,
      game_id: gameId,
      peri: gamePeriod,
      player_id: playerId,
    });
    if (rpcError) {
      redirect(`/public?error=${rpcError.message}`);
    }

    redirect("/public");
  }

  return (
    <main className="min-h-screen flex flex-col justify-center items-center gap-6 text-lg sm:text-2xl p-12">
      <div>
        {firstName}
        <span className="opacity-25">#{uniqueName}</span>
      </div>
      <div>
        You have <span className="font-bold text-green-400">{fBalance}</span>{" "}
        Game Liras (GL)
      </div>
      <form className="flex flex-col gap-6 items-center" action={play}>
        <div className="flex font-bold text-center">
          How much would you contribute?
        </div>
        <div>
          <div className="flex">
            <DeezButton val={balance} />
            <DeezButton val={balance * 0.75} />
          </div>
          <div className="flex">
            <DeezButton val={balance * 0.5} />
            <DeezButton val={0} />
          </div>
        </div>
        <DeezCounter />
      </form>
    </main>
  );
}
