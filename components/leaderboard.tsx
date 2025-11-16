"use client";

import { useState, useEffect } from "react";

type ScoreData = {
  username: string;
  s1: number;
  s2: number;
  score: number;
  created_at: string;
};

type LeaderboardData = {
  username: string;
  score: number;
  interest: {
    s1: number;
    s2: number;
    total: number;
  };
  money: {
    s1: number;
    s2: number;
    total: number;
  };
};

type LeaderboardClientProps = {
  initialAggregate: ScoreData[];
  initialMaggregate: ScoreData[];
};

export default function LeaderboardClient({
  initialAggregate,
  initialMaggregate,
}: LeaderboardClientProps) {
  const [date, setDate] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardData[]>([]);

  useEffect(() => {
    const filteredAggregate = date
      ? initialAggregate.filter((d) => new Date(d.created_at) >= new Date(date))
      : initialAggregate;

    const filteredMaggregate = date
      ? initialMaggregate.filter(
          (d) => new Date(d.created_at) >= new Date(date)
        )
      : initialMaggregate;

    const combinedLeaderboard = filteredAggregate.map((d) => {
      const m = filteredMaggregate.find((m) => m.username === d.username);
      return {
        username: d.username,
        score: d.score + (m?.score || 0),
        interest: {
          s1: d.s1,
          s2: d.s2,
          total: d.s1 + d.s2,
        },
        money: {
          s1: m?.s1 || 0,
          s2: m?.s2 || 0,
          total: (m?.s1 || 0) + (m?.s2 || 0),
        },
      };
    });

    setLeaderboard(combinedLeaderboard);
  }, [date, initialAggregate, initialMaggregate]);

  return (
    <>
      <div className="flex flex-row justify-center items-center pt-6 gap-3">
        <label htmlFor="date-filter" className="text-xl">
          Filter by Date
        </label>
        <input
          id="date-filter"
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border px-2 py-1"
        />
        {date && (
          <button
            onClick={() => setDate("")}
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          >
            Clear
          </button>
        )}
        {leaderboard.length === 0 && (
          <p className="text-xl">No results found.</p>
        )}
      </div>
      {leaderboard.length > 0 && (
        <div className="flex p-6">
          <table className="w-full text-sm sm:text-xl text-center">
            <thead className="text-xs sm:text-lg bg-gray-100">
              <tr>
                <th className="p-3 sm:p-4"></th>
                <th className="p-3 sm:p-4"></th>
                <th className="p-3 sm:p-4"></th>
                <th colSpan={3} className="p-3 sm:p-4 border-l">
                  Interest Rate Version
                </th>
                <th colSpan={3} className="p-3 sm:p-4 border-l">
                  Money Growth Version
                </th>
              </tr>
              <tr>
                <th className="p-3 sm:p-4">#</th>
                <th className="p-3 sm:p-4 text-left">Player</th>
                <th className="p-3 sm:p-4">Total Score</th>
                <th className="p-3 sm:p-4 border-l">Game 1</th>
                <th className="p-3 sm:p-4">Game 2</th>
                <th className="p-3 sm:p-4 font-semibold">Total</th>
                <th className="p-3 sm:p-4 border-l">Game 1</th>
                <th className="p-3 sm:p-4">Game 2</th>
                <th className="p-3 sm:p-4 font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leaderboard
                .sort((a, b) => b.score - a.score)
                .map((d, i) => (
                  <tr key={d.username} className="bg-white hover:bg-gray-50">
                    <td className="p-3 sm:p-4 font-medium">{i + 1}</td>
                    <td className="p-3 sm:p-4 font-medium text-left">
                      {d.username}
                    </td>
                    <td className="p-3 sm:p-4 font-bold text-lg sm:text-2xl">
                      {d.score.toFixed(2)}
                    </td>
                    <td className="p-3 sm:p-4 border-l">
                      {d.interest.s1.toFixed(2)}
                    </td>
                    <td className="p-3 sm:p-4">{d.interest.s2.toFixed(2)}</td>
                    <td className="p-3 sm:p-4 font-semibold">
                      {d.interest.total.toFixed(2)}
                    </td>
                    <td className="p-3 sm:p-4 border-l">
                      {d.money.s1.toFixed(2)}
                    </td>
                    <td className="p-3 sm:p-4">{d.money.s2.toFixed(2)}</td>
                    <td className="p-3 sm:p-4 font-semibold">
                      {d.money.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
