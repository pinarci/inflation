import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-[calc(100vh-4rem)] place-items-center p-6">
      <section className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">404</p>
        <h1 className="mt-2 text-3xl font-semibold">Page not found</h1>
        <p className="mt-3 text-muted-foreground">The game or page you requested does not exist.</p>
        <Button asChild className="mt-6"><Link href="/">Return to games</Link></Button>
      </section>
    </main>
  );
}
