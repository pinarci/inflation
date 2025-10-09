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
  const [aggregate, setAggregate] = useState(initialAggregate);
  const [maggregate, setMaggregate] = useState(initialMaggregate);
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

    setAggregate(filteredAggregate);
    setMaggregate(filteredMaggregate);

    const combinedLeaderboard = filteredAggregate.map((d) => {
      const m = filteredMaggregate.find((m) => m.username === d.username);
      return {
        username: d.username,
        score: d.score + (m?.score || 0),
      };
    });

    setLeaderboard(combinedLeaderboard);
  }, [date, initialAggregate, initialMaggregate]);

  return (
    <>
      <div className="flex flex-col justify-center items-center pt-6 gap-3">
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
      </div>
      <div className="flex flex-wrap grow gap-6 p-6">
        <div className="flex flex-col grow items-center justify-center gap-6">
          <div className="text-center text-4xl">Leaderboard</div>
          <ul className="flex flex-col text-2xl gap-3">
            {leaderboard
              .sort((a, b) => b.score - a.score)
              .map((d, i) => (
                <li
                  key={d.username}
                  className="flex items-center justify-between text-sm sm:text-2xl text-center gap-6"
                >
                  <div>{i + 1 + ". " + d.username}</div>
                  <div>{"Score: " + d.score.toFixed(2)}</div>
                </li>
              ))}
          </ul>
        </div>
        <div className="flex flex-col grow items-center justify-center gap-6">
          <div className="text-center text-4xl">Interest Rate Version</div>
          <ul className="flex flex-col text-2xl gap-3">
            {aggregate
              .sort((a, b) => b.score - a.score)
              .map((d, i) => (
                <li
                  key={d.username}
                  className="flex items-center justify-between text-sm sm:text-2xl text-center gap-6"
                >
                  <div>{i + 1 + ". " + d.username}</div>
                  <div className="flex flex-col text-xs sm:text-xl">
                    <div>{"Game 1: " + d.s1.toFixed(2)}</div>
                    <div>{"Game 2: " + d.s2.toFixed(2)}</div>
                  </div>
                  <div>{"Total: " + d.score.toFixed(2)}</div>
                </li>
              ))}
          </ul>
        </div>
        <div className="flex flex-col grow items-center justify-center gap-6">
          <div className="text-center text-4xl">Money Growth Version</div>
          <ul className="flex flex-col text-2xl gap-3">
            {maggregate
              .sort((a, b) => b.score - a.score)
              .map((d, i) => (
                <li
                  key={d.username + "?mg"}
                  className="flex items-center justify-between text-sm sm:text-2xl text-center gap-6"
                >
                  <div>{i + 1 + ". " + d.username}</div>
                  <div className="flex flex-col text-xs sm:text-xl">
                    <div>{"Game 1: " + d.s1.toFixed(2)}</div>
                    <div>{"Game 2: " + d.s2.toFixed(2)}</div>
                  </div>
                  <div>{"Total: " + d.score.toFixed(2)}</div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </>
  );
}
