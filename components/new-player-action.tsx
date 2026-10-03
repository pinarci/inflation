"use client";

import { useState } from "react";
import { startNewPlayerSession } from "@/app/player-session-actions";
import { LoadingButton } from "@/components/loading-button";
import { Button } from "@/components/ui/button";
import { PLAYER_GAME_STORAGE_KEYS } from "@/lib/player-session";
import { cn } from "@/lib/utils";

export function NewPlayerAction({
  label,
  destination,
  subtle = false,
}: {
  label: string;
  destination: "/" | "/inflation" | "/money";
  subtle?: boolean;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button
        type="button"
        variant={subtle ? "link" : "outline"}
        size={subtle ? "sm" : "default"}
        onClick={() => setConfirming(true)}
      >
        {label}
      </Button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Confirm new player session"
      className={cn(
        "max-w-md rounded-xl border bg-muted/50 p-4 text-left",
        subtle && "mx-auto"
      )}
    >
      <p className="text-sm font-semibold">Are you sure?</p>
      <p className="text-sm leading-6 text-muted-foreground">
        This will start a new player session for all games on this browser. Previous
        leaderboard results will remain saved.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <form
          action={startNewPlayerSession}
          onSubmit={() => {
            for (const key of PLAYER_GAME_STORAGE_KEYS) localStorage.removeItem(key);
          }}
        >
          <input type="hidden" name="destination" value={destination} />
          <LoadingButton idleLabel="Confirm new player" pendingLabel="Starting…" />
        </form>
        <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
