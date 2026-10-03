"use client";

import { EconomicGame } from "@/components/economic-game";
import { cbsend } from "@/components/cbsend";
import { calculateInterestPeriod, INTEREST_INITIAL_STATE } from "@/lib/economic-model";
import { INTEREST_STORAGE_KEY } from "@/lib/player-session";

export default function CBGame({ uid, game }: { uid: number; game: number }) {
  return (
    <EconomicGame
      uid={uid}
      game={game}
      title="Interest Rate Version"
      decisionLabel="Your rate decision"
      tableLabel="Nominal Interest Rate"
      storageKey={INTEREST_STORAGE_KEY}
      initialState={INTEREST_INITIAL_STATE}
      assumptions={[
        "Inflation target is 2 per cent",
        "Neutral real rate is assumed to be 1 per cent",
      ]}
      calculatePeriod={(rate, inflation) => calculateInterestPeriod(rate, inflation)}
      submit={async (id, nextGame, data) => {
        const { o0: _o0, ...interestData } = data;
        return cbsend(id, nextGame, interestData);
      }}
      completion={{
        message: "Interest Rate Version Completed",
        href: "/money",
        label: "Play Money Growth Version",
        newPlayerLabel: "Play Again as New Player",
        newPlayerPath: "/inflation",
      }}
    />
  );
}
