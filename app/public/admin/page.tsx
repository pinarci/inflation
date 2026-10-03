import { cookies } from "next/headers";
import { createServerSupabase } from "@/lib/supabase/server";
import { LoadingButton } from "@/components/loading-button";
import { Input } from "@/components/ui/input";
import { redirect } from "next/navigation";
import { createAdminSession, isAdminPassword, isAdminSession } from "@/lib/admin-session";

export default async function Admin({
  searchParams,
}: {
  searchParams: { error: string; message: string };
}) {
  const session = cookies().get("admin-session")?.value;

  async function setCookie(formData: FormData) {
    "use server";

    if (!isAdminPassword(formData.get("adminpw"))) {
      redirect("/public/admin?error=Wrong%20password");
    }
    cookies().set("admin-session", createAdminSession(), {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8,
    });

    redirect("/public/admin");
  }

  async function admin(formData: FormData) {
    "use server";

    if (!isAdminSession(cookies().get("admin-session")?.value)) {
      redirect("/public/admin?error=Wrong%20password");
    }

    const supabaseAction = createServerSupabase();

    const id = Number(formData.get("id"));
    const per = Number(formData.get("per"));
    const { error: rpcError } = await supabaseAction.rpc("goods", {
      game_id: id,
      perio: per,
    });
    if (rpcError) {
      redirect(`/public/admin?error=${rpcError.message}`);
    }

    redirect(
      `/public/admin?message=Period%20${per + 1}%20started%20successfully`
    );
  }

  async function endgame(formData: FormData) {
    "use server";

    if (!isAdminSession(cookies().get("admin-session")?.value)) {
      redirect("/public/admin?error=Wrong%20password");
    }

    const supabaseAction = createServerSupabase();

    const id = Number(formData.get("id"));
    const { error } = await supabaseAction
      .from("games")
      .update({
        active: false,
      })
      .eq("id", id);
    if (error) {
      redirect(`/public/admin?error=${error.message}`);
    }

    const per = Number(formData.get("per"));
    const { error: rpcError } = await supabaseAction.rpc("goods", {
      game_id: id,
      perio: per,
    });
    if (rpcError) {
      redirect(`/public/admin?error=${rpcError.message}`);
    }

    redirect("/public/admin?message=Game%20ended%20successfully");
  }

  if (isAdminSession(session)) {
    const supabase = createServerSupabase();

    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("id, active, period");
    if (gameError) {
      throw new Error(gameError.message);
    }
    if (game.length === 0) {
      redirect("/public/admin?error=Game%20not%20found");
    }

    const gameId = game[0].id;
    const isActive = game[0].active;
    const gamePeriod = game[0].period;

    const { data: won, error: appleError } = await supabase
      .from("players")
      .select("username")
      .eq("game", gameId)
      .order("balance", { ascending: false })
      .limit(1);
    if (appleError) {
      throw new Error(appleError.message);
    }

    const winner = won[0]?.username ?? "error.error";
    const splitter = winner.split(".");
    const firstName = splitter[0];
    const uniqueName = splitter[1];

    return (
      <main className="min-h-screen flex flex-col justify-center items-center text-2xl gap-6 p-12">
        <div className="flex text-center text-4xl">
          Public Goods Admin Panel
        </div>
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
        <div>Game: {gameId}</div>
        <div>Period: {gamePeriod}</div>
        <form className="flex flex-col items-center gap-6" action={admin}>
          <div className="flex">Next Period</div>
          <LoadingButton />
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
          className="flex flex-col items-center gap-6 pt-24"
          action={endgame}
        >
          <div className="flex text-red-500">End Game</div>
          <LoadingButton />
          <input type="hidden" name="id" value={gameId} />
          <input type="hidden" name="per" value={gamePeriod} />
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex justify-center items-center p-6">
      <form className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6 shadow-sm" action={setCookie}>
        <h1 className="text-center text-2xl font-semibold">Public Goods Admin</h1>
        <Input type="password" name="adminpw" placeholder="Password" />
        <LoadingButton className="w-full" idleLabel="Sign in" pendingLabel="Signing in…" />
        {searchParams.error ? <p role="alert" className="text-center text-sm text-destructive">{searchParams.error}</p> : null}
      </form>
    </main>
  );
}
