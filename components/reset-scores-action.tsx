"use client";

import { useState } from "react";
import { resetLeaderboardScores } from "@/app/results/actions";
import { LoadingButton } from "@/components/loading-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ResetScoresAction() {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setConfirming(true)}>
        Reset scores
      </Button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Confirm score reset"
      className="w-full max-w-md rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-left"
    >
      <p className="text-sm font-semibold">Are you sure?</p>
      <p id="score-reset-description" className="mt-1 text-sm leading-6 text-muted-foreground">
        This resets every player score in both games to zero. Player records and game
        progress will remain saved.
      </p>
      <form action={resetLeaderboardScores} className="mt-3 space-y-3">
        <label htmlFor="score-reset-password" className="sr-only">Admin password</label>
        <Input
          id="score-reset-password"
          type="password"
          name="adminpw"
          placeholder="Admin password"
          autoComplete="current-password"
          aria-describedby="score-reset-description"
          required
        />
        <div className="flex flex-wrap gap-2">
          <LoadingButton
            idleLabel="Reset all scores"
            pendingLabel="Resetting…"
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          />
          <Button type="button" variant="ghost" onClick={() => setConfirming(false)}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
