"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ScoreData = { username: string; s1: number; s2: number; score: number; created_at: string };
type GameScore = { s1: number; s2: number; total: number };
type LeaderboardData = { username: string; score: number; interest: GameScore; money: GameScore };

const EMPTY_SCORE: GameScore = { s1: 0, s2: 0, total: 0 };

export default function LeaderboardClient({
  initialAggregate,
  initialMaggregate,
}: {
  initialAggregate: ScoreData[];
  initialMaggregate: ScoreData[];
}) {
  const [date, setDate] = useState("");

  const leaderboard = useMemo(() => {
    const afterDate = (item: ScoreData) => !date || new Date(item.created_at) >= new Date(date);
    const interest = initialAggregate.filter(afterDate);
    const money = initialMaggregate.filter(afterDate);
    const usernames = new Set([...interest.map((item) => item.username), ...money.map((item) => item.username)]);

    return Array.from(usernames, (username): LeaderboardData => {
      const interestRow = interest.find((item) => item.username === username);
      const moneyRow = money.find((item) => item.username === username);
      const interestScore = interestRow
        ? { s1: interestRow.s1, s2: interestRow.s2, total: interestRow.score }
        : EMPTY_SCORE;
      const moneyScore = moneyRow
        ? { s1: moneyRow.s1, s2: moneyRow.s2, total: moneyRow.score }
        : EMPTY_SCORE;
      return { username, score: interestScore.total + moneyScore.total, interest: interestScore, money: moneyScore };
    }).sort((a, b) => b.score - a.score);
  }, [date, initialAggregate, initialMaggregate]);

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <label htmlFor="date-filter" className="block text-sm font-medium">Results since</label>
          <Input id="date-filter" type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} className="sm:w-64" />
        </div>
        {date ? <Button type="button" variant="outline" onClick={() => setDate("")}>Clear filter</Button> : null}
      </div>

      {leaderboard.length === 0 ? (
        <div className="p-10 text-center">
          <p className="font-medium">No leaderboard results yet</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {date ? "No scores match the selected date. Clear the filter to see all results." : "Completed game scores will appear here."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-center text-sm">
            <caption className="sr-only">Player scores across the Interest Rate and Money Growth games</caption>
            <thead className="bg-slate-900 text-white">
              <tr>
                <th scope="col" rowSpan={2} className="px-4 py-3">Rank</th>
                <th scope="col" rowSpan={2} className="px-4 py-3 text-left">Player</th>
                <th scope="col" rowSpan={2} className="px-4 py-3">Total</th>
                <th scope="colgroup" colSpan={3} className="border-l border-white/20 px-4 py-3">Interest Rate</th>
                <th scope="colgroup" colSpan={3} className="border-l border-white/20 px-4 py-3">Money Growth</th>
              </tr>
              <tr className="border-t border-white/20 text-xs text-white/80">
                <th className="border-l border-white/20 px-4 py-2">Game 1</th><th className="px-4 py-2">Game 2</th><th className="px-4 py-2">Total</th>
                <th className="border-l border-white/20 px-4 py-2">Game 1</th><th className="px-4 py-2">Game 2</th><th className="px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leaderboard.map((row, index) => (
                <tr key={row.username} className="transition-colors hover:bg-muted/50">
                  <td className="px-4 py-4 font-medium">{index + 1}</td>
                  <th scope="row" className="px-4 py-4 text-left font-medium">{row.username}</th>
                  <td className="px-4 py-4 text-base font-bold">{row.score.toFixed(2)}</td>
                  <td className="border-l px-4 py-4">{row.interest.s1.toFixed(2)}</td><td className="px-4 py-4">{row.interest.s2.toFixed(2)}</td><td className="px-4 py-4 font-semibold">{row.interest.total.toFixed(2)}</td>
                  <td className="border-l px-4 py-4">{row.money.s1.toFixed(2)}</td><td className="px-4 py-4">{row.money.s2.toFixed(2)}</td><td className="px-4 py-4 font-semibold">{row.money.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
