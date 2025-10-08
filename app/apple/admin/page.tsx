import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { LoadingButton } from "@/components/loading-button";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";

export default async function Admin({
  searchParams,
}: {
  searchParams: { error: string; message: string };
}) {
  const password = cookies().get("adminpw")?.value;

  async function setCookie(formData: FormData) {
    "use server";

    const yummy = String(formData.get("adminpw"));
    cookies().set("adminpw", yummy);

    redirect("/apple/admin");
  }

  async function admin(formData: FormData) {
    "use server";

    const pw = String(formData.get("dn"));
    if (pw !== process.env.NEXT_PRIVATE_ADMIN_PASSWORD) {
      redirect("/apple/admin?error=Wrong%20password");
    }

    const supabaseAction = createClient<Database>(
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

    const id = Number(formData.get("id"));
    const per = Number(formData.get("per"));
    const inc = Number(formData.get("inc"));
    const { error: rpcError } = await supabaseAction.rpc("magic", {
      game_id: id,
      income: inc,
      perio: per,
    });
    if (rpcError) {
      redirect(`/apple/admin?error=${rpcError.message}`);
    }

    redirect(
      `/apple/admin?message=Period%20${per + 1}%20started%20successfully`
    );
  }

  async function endgame(formData: FormData) {
    "use server";

    const pw = String(formData.get("dn"));
    if (pw !== process.env.NEXT_PRIVATE_ADMIN_PASSWORD) {
      redirect("/apple/admin?error=Wrong%20password");
    }

    const supabaseAction = createClient<Database>(
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

    const id = Number(formData.get("id"));
    const { error } = await supabaseAction
      .from("igames")
      .update({
        active: false,
      })
      .eq("id", id);
    if (error) {
      redirect(`/apple/admin?error=${error.message}`);
    }

    const per = Number(formData.get("per"));
    const dinc = Number(formData.get("dinc"));
    const { error: rpcError } = await supabaseAction.rpc("magic", {
      game_id: id,
      income: dinc,
      perio: per,
    });
    if (rpcError) {
      redirect(`/apple/admin?error=${rpcError.message}`);
    }

    redirect("/apple/admin?message=Game%20ended%20successfully");
  }

  if (password === process.env.NEXT_PRIVATE_ADMIN_PASSWORD) {
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
      .from("igames")
      .select("id, active, period");
    if (gameError) {
      redirect(`/apple/admin?error=${gameError.message}`);
    }
    if (game.length === 0) {
      redirect("/apple/admin?error=Game%20not%20found");
    }

    const gameId = game[0].id;
    const isActive = game[0].active;
    const gamePeriod = game[0].period;

    const { data: won, error: appleError } = await supabase
      .from("iplayers")
      .select("username")
      .eq("game", gameId)
      .order("apple", { ascending: false })
      .limit(1);
    if (appleError) {
      redirect(`/apple/admin?error=${appleError.message}`);
    }

    const winner = won[0]?.username ?? "error.error";
    const splitter = winner.split(".");
    const firstName = splitter[0];
    const uniqueName = splitter[1];

    return (
      <main className="min-h-screen flex flex-col justify-center items-center text-2xl gap-6 p-12">
        {isActive ? (
          <span className="text-green-500">Game is active</span>
        ) : (
          <>
            <div>
              Winner is {firstName}
              <span className="opacity-25">#{uniqueName}</span>
            </div>
            <span className="text-red-500">Game Ended</span>
          </>
        )}
        <div>Period: {gamePeriod}</div>
        <form
          className="flex flex-col items-center rounded-md gap-6 p-6 bg-secondary"
          action={admin}
        >
          <div>Next Period</div>
          <Input
            type="number"
            name="inc"
            step={0.01}
            placeholder="growth rate"
            required
          />
          <LoadingButton />
          <input type="hidden" name="dn" value={password} />
          <input type="hidden" name="id" value={gameId} />
          <input type="hidden" name="per" value={gamePeriod} />
        </form>
        {searchParams?.message && (
          <span className="text-center text-green-500">
            {searchParams.message}
          </span>
        )}
        {searchParams?.error && (
          <span className="text-center text-red-500">{searchParams.error}</span>
        )}
        <form
          className="flex flex-col items-center rounded-md gap-6 p-6 bg-red-500"
          action={endgame}
        >
          <div>End Game</div>
          <Input
            type="number"
            name="dinc"
            step={0.01}
            placeholder="growth rate"
            required
          />
          <LoadingButton />
          <input type="hidden" name="dn" value={password} />
          <input type="hidden" name="id" value={gameId} />
          <input type="hidden" name="per" value={gamePeriod} />
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex justify-center items-center text-2xl p-12">
      <form className="flex flex-col justify-center gap-6" action={setCookie}>
        <Input type="password" name="adminpw" placeholder="Password" />
        <LoadingButton />
      </form>
    </main>
  );
}
