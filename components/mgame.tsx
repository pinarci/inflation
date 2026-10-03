"use client";

import { EconomicGame } from "@/components/economic-game";
import { msend } from "@/components/msend";
import { calculateMoneyPeriod, MONEY_INITIAL_STATE } from "@/lib/economic-model";
import { MONEY_STORAGE_KEY } from "@/lib/player-session";

export default function MGame({ uid, game }: { uid: number; game: number }) {
  return (
    <EconomicGame
      uid={uid}
      game={game}
      title="Money Growth Version"
      decisionLabel="Your money growth decision"
      tableLabel="Money Growth"
      storageKey={MONEY_STORAGE_KEY}
      initialState={MONEY_INITIAL_STATE}
      assumptions={[
        "Inflation target is 2 per cent",
        "Potential real growth is 0 per cent",
        "Velocity of money is assumed to be constant",
      ]}
      calculatePeriod={calculateMoneyPeriod}
      submit={msend}
      completion={{
        message: "Thanks for playing!",
        href: "/results",
        label: "View Results",
        newPlayerLabel: "Start as New Player",
        newPlayerPath: "/money",
      }}
    />
  );
}
