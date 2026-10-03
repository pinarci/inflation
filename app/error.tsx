"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center p-6">
      <section className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold">We couldn’t load this game</h1>
        <p className="mt-3 text-sm text-muted-foreground">Check your connection and try again. Your saved game progress remains in this browser.</p>
        <Button className="mt-6" onClick={reset}>Try again</Button>
      </section>
    </main>
  );
}
