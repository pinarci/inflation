import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BarChart3, Landmark, WalletCards } from "lucide-react";
import { NewPlayerAction } from "@/components/new-player-action";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "EconForAll",
  description: "Learn economics by playing interactive monetary-policy games.",
};

const games = [
  {
    href: "/inflation",
    title: "Interest Rate Game",
    description: "Use the policy interest rate to guide inflation and the output gap through a four-period simulation.",
    icon: Landmark,
    action: "Play Interest Rate",
  },
  {
    href: "/money",
    title: "Money Growth Game",
    description: "Choose money growth and see how your decisions shape inflation and economic activity over time.",
    icon: WalletCards,
    action: "Play Money Growth",
  },
] as const;

export default function Home() {
  return (
    <PageShell className="justify-center">
      <section className="mx-auto w-full max-w-5xl py-6 sm:py-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/60">
            Interactive economics laboratory
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">EconForAll</h1>
          <p className="mt-4 text-lg text-muted-foreground sm:text-xl">Learn economics by playing.</p>
          <p className="mx-auto mt-5 max-w-2xl leading-7 text-muted-foreground">
            Make policy decisions, observe their consequences, and compare your results in focused classroom-ready simulations.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {games.map(({ href, title, description, icon: Icon, action }) => (
            <article key={href} className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h2 className="mt-5 text-2xl font-semibold tracking-tight">{title}</h2>
              <p className="mt-3 flex-1 leading-7 text-muted-foreground">{description}</p>
              <Button asChild className="mt-6 w-full sm:w-fit">
                <Link href={href}>
                  {action}
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </article>
          ))}
        </div>

        <div className="mt-6 flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/results">
              <BarChart3 className="mr-2 h-4 w-4" aria-hidden="true" />
              View Results
            </Link>
          </Button>
        </div>
        <div className="mt-3 text-center">
          <NewPlayerAction label="Start new player" destination="/inflation" subtle />
        </div>
      </section>
    </PageShell>
  );
}
