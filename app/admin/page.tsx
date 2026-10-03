import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AlertTriangle, Database, LogOut, RotateCcw, Trash2 } from "lucide-react";
import { LoadingButton } from "@/components/loading-button";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isAdminSession } from "@/lib/admin-session";
import { mutateGameData, signIn, signOut } from "./actions";

export const metadata: Metadata = { title: "Administration" };

type Target = "cbgame" | "mgame" | "all";

function MaintenanceForm({
  target,
  mode,
  title,
  description,
}: {
  target: Target;
  mode: "reset" | "clear";
  title: string;
  description: string;
}) {
  const isClear = mode === "clear";
  const confirmation = isClear ? "CLEAR" : "RESET";
  const inputId = `${target}-${mode}-confirmation`;

  return (
    <form action={mutateGameData} className="rounded-xl border bg-background p-5">
      <input type="hidden" name="target" value={target} />
      <input type="hidden" name="mode" value={mode} />
      <div className="flex items-start gap-3">
        <span className={isClear ? "mt-0.5 text-destructive" : "mt-0.5 text-amber-700"}>
          {isClear ? <Trash2 className="h-5 w-5" aria-hidden="true" /> : <RotateCcw className="h-5 w-5" aria-hidden="true" />}
        </span>
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p id={`${inputId}-description`} className="mt-1 text-sm leading-6 text-muted-foreground">
            {description} Type <strong className="text-foreground">{confirmation}</strong> to confirm.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <label htmlFor={inputId} className="sr-only">Type {confirmation} to confirm {title}</label>
        <Input
          id={inputId}
          name="confirmation"
          placeholder={confirmation}
          autoComplete="off"
          aria-describedby={`${inputId}-description`}
          required
        />
        <LoadingButton
          idleLabel={isClear ? "Clear permanently" : "Reset scores"}
          pendingLabel={isClear ? "Clearing…" : "Resetting…"}
          className={isClear ? "shrink-0 bg-destructive text-destructive-foreground hover:bg-destructive/90" : "shrink-0"}
        />
      </div>
    </form>
  );
}

export default function Admin({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  const session = cookies().get("admin-session")?.value;

  if (!isAdminSession(session)) {
    return (
      <PageShell className="justify-center">
        <form className="mx-auto w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6 shadow-sm sm:p-8" action={signIn}>
          <div className="text-center">
            <span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
              <Database className="h-5 w-5" aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight">Administration</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sign in to manage game scores and player records.</p>
          </div>
          <label htmlFor="admin-password" className="sr-only">Admin password</label>
          <Input id="admin-password" type="password" name="adminpw" placeholder="Password" autoComplete="current-password" required />
          <LoadingButton className="w-full" idleLabel="Sign in" pendingLabel="Signing in…" />
          {searchParams.error ? <p role="alert" className="text-center text-sm text-destructive">{searchParams.error}</p> : null}
        </form>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/60">Restricted area</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Game administration</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">Manage Interest Rate and Money Growth records. Every action below requires a typed confirmation.</p>
        </div>
        <form action={signOut}>
          <Button type="submit" variant="outline">
            <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
            Sign out
          </Button>
        </form>
      </div>

      {searchParams.message ? <p role="status" className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{searchParams.message}</p> : null}
      {searchParams.error ? <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{searchParams.error}</p> : null}

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Reset scores and progress</h2>
        <p className="mt-2 text-sm text-muted-foreground">Sets game, s1, and s2 to zero while keeping every player row.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <MaintenanceForm target="cbgame" mode="reset" title="Reset Interest Rate" description="Keep Interest Rate players and restart their progress." />
          <MaintenanceForm target="mgame" mode="reset" title="Reset Money Growth" description="Keep Money Growth players and restart their progress." />
          <MaintenanceForm target="all" mode="reset" title="Reset both games" description="Keep all players and restart progress in both games." />
        </div>
      </section>

      <section className="mt-10 rounded-2xl border border-destructive/30 bg-destructive/5 p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
          <div>
            <h2 className="text-xl font-semibold">Clear players and results</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">These actions permanently delete player rows and all recorded scores. They cannot be undone from this panel.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <MaintenanceForm target="cbgame" mode="clear" title="Clear Interest Rate" description="Delete all Interest Rate players and results." />
          <MaintenanceForm target="mgame" mode="clear" title="Clear Money Growth" description="Delete all Money Growth players and results." />
          <MaintenanceForm target="all" mode="clear" title="Clear both games" description="Delete all players and results from both games." />
        </div>
      </section>
    </PageShell>
  );
}
