"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Landmark, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation: ReadonlyArray<{ href: string; label: string; icon?: LucideIcon }> = [
  { href: "/", label: "Home" },
  { href: "/inflation", label: "Interest Rate" },
  { href: "/money", label: "Money Growth" },
  { href: "/results", label: "Results", icon: BarChart3 },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2 sm:flex-nowrap sm:px-6 sm:py-0">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-900 text-white">
            <Landmark className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>EconForAll</span>
        </Link>
        <nav aria-label="Primary navigation" className="order-2 w-full min-w-0 sm:order-none sm:flex-1">
          <ul className="grid grid-cols-4 items-center gap-1 sm:flex">
            {navigation.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === href : pathname.startsWith(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-1 text-center text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto sm:px-3 sm:text-sm",
                      active && "bg-muted text-foreground"
                    )}
                  >
                    {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
