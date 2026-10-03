"use client";

import Link from "next/link";
import { useState } from "react";
import { NewPlayerAction } from "@/components/new-player-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  COMPLETED_GAME,
  COMPLETED_PERIOD,
  type EconomicGameState,
  type PeriodResult,
  calculateScore,
  getNextPeriod,
  getSubmissionGame,
} from "@/lib/economic-model";

type SubmitData = {
  i0: number;
  i1: number;
  i2: number;
  i3: number;
  i4: number;
  o0: number;
  o1: number;
  o2: number;
  o3: number;
  o4: number;
  r1: number;
  r2: number;
  r3: number;
  r4: number;
  s: number;
};

type EconomicGameProps = {
  uid: number;
  game: number;
  title: string;
  decisionLabel: string;
  tableLabel: string;
  storageKey: string;
  initialState: EconomicGameState;
  assumptions: readonly string[];
  calculatePeriod: (
    decision: number,
    previousInflation: number,
    previousOutputGap: number
  ) => PeriodResult;
  submit: (
    id: number,
    game: number,
    data: SubmitData
  ) => Promise<{ message: string } | undefined>;
  completion: {
    message: string;
    href?: string;
    label?: string;
    newPlayerLabel: string;
    newPlayerPath: "/inflation" | "/money";
  };
};

const PERIODS = [0, 1, 2, 3, 4] as const;
type Period = (typeof PERIODS)[number];

function stateValue(
  state: EconomicGameState,
  field: "rate" | "inflation" | "og",
  period: Period
) {
  return state[`${field}${period}` as keyof EconomicGameState] as number;
}

function readState(storageKey: string, initialState: EconomicGameState) {
  const stored = localStorage.getItem(storageKey);
  if (!stored) return initialState;

  try {
    return JSON.parse(stored) as EconomicGameState;
  } catch {
    return initialState;
  }
}

function DataTable({ state, tableLabel }: { state: EconomicGameState; tableLabel: string }) {
  const visiblePeriods = PERIODS.slice(0, state.period);
  const latestPeriod = visiblePeriods.at(-1);

  return (
    <div className="w-full rounded-2xl border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h3 className="font-semibold">Economic history</h3>
        <p className="mt-1 text-sm text-muted-foreground">Recorded values through the latest completed period.</p>
      </div>
      <div className="overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-center text-sm sm:text-base">
        <caption className="sr-only">
          Period-by-period {tableLabel.toLowerCase()}, inflation, and output gap
        </caption>
        <thead className="bg-slate-900 text-white">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">Period</th>
            <th scope="col" className="px-4 py-3 font-medium">{tableLabel}</th>
            <th scope="col" className="px-4 py-3 font-medium">Inflation</th>
            <th scope="col" className="px-4 py-3 font-medium">Output Gap</th>
          </tr>
        </thead>
        <tbody>
          {visiblePeriods.map((period) => (
            <tr key={period} className={period === latestPeriod ? "border-t bg-accent/60" : "border-t even:bg-muted/60"}>
              <th scope="row" className="px-4 py-3 font-semibold">{period}</th>
              <td className="px-4 py-3">{stateValue(state, "rate", period)}%</td>
              <td className="px-4 py-3">{stateValue(state, "inflation", period)}%</td>
              <td className="px-4 py-3">{stateValue(state, "og", period)}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export function EconomicGame(props: EconomicGameProps) {
  const [state, setState] = useState(() => readState(props.storageKey, props.initialState));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const isDecisionPeriod =
    state.period === 1 ||
    state.period === 2 ||
    state.period === 3 ||
    state.period === 4;
  const isFinalPeriod = state.period === COMPLETED_PERIOD;

  if (props.game === COMPLETED_GAME) {
    return (
      <section className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-2xl border bg-card p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">{props.completion.message}</h1>
        {props.completion.href && props.completion.label ? (
          <div>
            <Button asChild><Link href={props.completion.href}>{props.completion.label}</Link></Button>
            <p className="mt-2 text-xs text-muted-foreground">Continue as the current player.</p>
          </div>
        ) : null}
        <NewPlayerAction
          label={props.completion.newPlayerLabel}
          destination={props.completion.newPlayerPath}
        />
      </section>
    );
  }

  const advance = () => {
    const period = state.period as 1 | 2 | 3 | 4;
    const result = props.calculatePeriod(
      stateValue(state, "rate", period),
      stateValue(state, "inflation", (period - 1) as Period),
      stateValue(state, "og", (period - 1) as Period)
    );
    const nextState: EconomicGameState = {
      ...state,
      period: getNextPeriod(period),
      [`inflation${period}` as "inflation1" | "inflation2" | "inflation3" | "inflation4"]: result.tinf,
      [`og${period}` as "og1" | "og2" | "og3" | "og4"]: result.tog,
    };

    if (period === 4) {
      nextState.score = calculateScore(
        [nextState.inflation1, nextState.inflation2, nextState.inflation3, nextState.inflation4],
        [nextState.og1, nextState.og2, nextState.og3, nextState.og4]
      );
    }

    localStorage.setItem(props.storageKey, JSON.stringify(nextState));
    setState(nextState);
  };

  const submitResult = async () => {
    setSubmitting(true);
    setSubmitError("");
    localStorage.setItem(props.storageKey, JSON.stringify(props.initialState));

    const submissionGame = getSubmissionGame(props.game);
    if (submissionGame === undefined) return;

    const result = await props.submit(props.uid, submissionGame, {
      i0: state.inflation0,
      i1: state.inflation1,
      i2: state.inflation2,
      i3: state.inflation3,
      i4: state.inflation4,
      o0: state.og0,
      o1: state.og1,
      o2: state.og2,
      o3: state.og3,
      o4: state.og4,
      r1: state.rate1,
      r2: state.rate2,
      r3: state.rate3,
      r4: state.rate4,
      s: state.score,
    });

    if (result?.message) {
      setSubmitError(result.message);
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6">
      <div className="flex w-full flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Current round</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight">{props.title}</h2>
        </div>
        <p className="w-fit rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white" aria-live="polite">
          {isFinalPeriod ? "Round complete" : `Period ${state.period} of 4`}
        </p>
      </div>

      {state.period === 1 && props.game === 0 ? (
        <div className="w-full rounded-2xl border bg-muted/50 p-5">
          <h3 className="mb-3 text-center text-sm font-semibold">Model assumptions</h3>
          <div className="grid gap-2 text-sm sm:grid-cols-3">
          {props.assumptions.map((assumption) => (
            <p key={assumption} className="text-center text-muted-foreground">{assumption}</p>
          ))}
          </div>
        </div>
      ) : null}

      {isDecisionPeriod || isFinalPeriod ? (
        <DataTable state={state} tableLabel={props.tableLabel} />
      ) : null}

      {isDecisionPeriod ? (
        <div className="w-full max-w-md rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
          <p className="text-center text-sm font-medium text-muted-foreground">Your decision</p>
          <label htmlFor={`decision-${state.period}`} className="mb-3 mt-1 block text-center text-lg font-semibold">
            {props.decisionLabel}: {stateValue(state, "rate", state.period as Period)}%
          </label>
          <div className="flex gap-3">
            <Input
              id={`decision-${state.period}`}
              type="number"
              inputMode="decimal"
              step="any"
              placeholder="Enter value"
              aria-label={props.decisionLabel}
              value={stateValue(state, "rate", state.period as Period)}
              onChange={(event) => {
                if (event.target.value !== "") {
                  setState({
                    ...state,
                    [`rate${state.period}` as "rate1" | "rate2" | "rate3" | "rate4"]: Number(event.target.value),
                  });
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  advance();
                }
              }}
              autoFocus={state.period > 1}
            />
            <Button type="button" onClick={advance}>Apply decision</Button>
          </div>
        </div>
      ) : isFinalPeriod ? (
        <div className="flex w-full max-w-md flex-col items-center gap-5 rounded-2xl border bg-card p-6 text-center shadow-sm" aria-live="polite">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Round score</p>
            <p className="mt-2 text-4xl font-semibold sm:text-5xl">
            <span className={state.score > 0 ? "text-emerald-600" : "text-destructive"}>
              {state.score > 0 ? Number(state.score.toFixed(2)) : 0}
            </span>
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={submitResult} disabled={submitting}>
            {submitting ? "Saving…" : props.game === 0 ? "Play Again" : "Continue"}
          </Button>
          {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
