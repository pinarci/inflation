import { cookies, headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/loading-button";
import { redirect } from "next/navigation";
import { z } from "zod";
import Hamburger from "@/components/hamburger";
import dynamic from "next/dynamic";

const DGame = dynamic(() => import("@/components/mgame"), { ssr: false });

export default async function Money({
  searchParams,
}: {
  searchParams: { message: string };
}) {
  const ip = headers().get("x-real-ip") ?? "95.183.240.91";
  const username = cookies().get("username")?.value ?? "dn";

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

  const { data: player, error: playerError } = await supabase
    .from("mgame")
    .select("id, game")
    .eq("ip", ip)
    .eq("username", username);
  if (playerError) {
    redirect(`/money?message=${playerError.message}`);
  }

  async function setUsername(formData: FormData) {
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
      redirect("/money?message=Invalid%20username");
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

    const { error: newError } = await supabaseUction.from("mgame").insert({
      ip,
      username: uparsed.data.username,
      game: 0,
      s1: 0,
      s2: 0,
    });
    if (newError) {
      if (newError.code === "23505") {
        redirect("/money?message=Username%20taken");
      }
      redirect(`/money?message=${newError.message}`);
    }

    cookies().set("username", uparsed.data.username);

    redirect("/money");
  }

  if (player.length === 0) {
    if (username !== "dn") {
      const { error: existError } = await supabase.from("mgame").insert({
        ip,
        username,
        game: 0,
        s1: 0,
        s2: 0,
      });
      if (existError) {
        if (existError.code === "23505") {
          return (
            <main className="min-h-screen flex flex-col justify-center items-center p-12">
              <form className="flex flex-col gap-6" action={setUsername}>
                <div className="flex justify-center">Enter your username</div>
                <Input
                  type="text"
                  name="username"
                  className="text-sm"
                  placeholder="Username"
                  pattern="[a-zA-Z0-9]{3,11}"
                  required
                />
                <LoadingButton />
                {searchParams?.message && (
                  <p className="text-red-500 text-center">
                    {searchParams.message}
                  </p>
                )}
              </form>
            </main>
          );
        }

        redirect(`/money?message=${existError.message}`);
      }

      redirect("/money");
    }

    return (
      <main className="min-h-screen flex flex-col justify-center items-center p-12">
        <form className="flex flex-col gap-6" action={setUsername}>
          <div className="flex justify-center">Enter your username</div>
          <Input
            type="text"
            name="username"
            className="text-sm"
            placeholder="Username"
            pattern="[a-zA-Z0-9]{3,11}"
            required
          />
          <LoadingButton />
          {searchParams?.message && (
            <p className="text-red-500 text-center">{searchParams.message}</p>
          )}
        </form>
      </main>
    );
  }

  const playerId = player[0].id;
  const playerGame = player[0].game;

  return (
    <main className="min-h-screen flex flex-col">
      {/* <div className="flex flex-row justify-center border-b h-[57px]">
        <div className="flex items-center justify-between max-w-4xl w-full px-4">
          <div className="flex w-[90px] justify-start">
            <Hamburger />
          </div>
          <a href="/" className="hidden sm:flex text-3xl font-semibold">
            MacroGames
          </a>
          <div className="flex w-[90px] justify-end"></div>
        </div>
      </div> */}
      <div className="flex flex-col grow justify-center gap-6">
        <DGame uid={playerId} game={playerGame} />
        {searchParams?.message && (
          <p className="text-red-500 text-center">{searchParams.message}</p>
        )}
      </div>
    </main>
  );
}
