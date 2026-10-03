import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  calculateInterestPeriod,
  calculateMoneyPeriod,
  calculateScore,
  isInterestPeriodValid,
  isMoneyPeriodValid,
} from "./economic-model";

const REFERENCE_COMMIT = "a1451a6dab5fbe949892afccc21ab9bc61395c40";

const HISTORICAL_SOURCE_HASHES = {
  "components/cbgame.tsx": "0c1706923f3c16dd827b5db8a4086af0bae63861445295141570bdcadfc24137",
  "components/mgame.tsx": "d2fc65cd002a1334d80c53cf8f5f44bc17c8c9d53ae6657be26b9e7fe6d3007f",
  "components/cbsend.ts": "1784f25fb52d4d8071eb4bc19306051b14666b4a6934ce9daba4fa8b7dae5321",
  "components/msend.ts": "582fc08baac1eed17b863826058e21a03ff63eb67d0d1a55030f399f5ed835f1",
} as const;

type PeriodResult = { tinf: number; tog: number };
type SequenceResult = { periods: PeriodResult[]; score: number };

type InterestSubmission = {
  i0: number;
  i1: number;
  i2: number;
  i3: number;
  i4: number;
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

type MoneySubmission = InterestSubmission & { o0: number };
type Verdict = "accepted" | "invalid-data" | "score-mismatch";

// These functions intentionally preserve the expressions and statement order
// from the four files at REFERENCE_COMMIT. They are the differential oracle,
// not a restatement of the refactored implementation.
function historicalInterestPeriod(r: number, i: number): PeriodResult {
  const og = i - r + 1;
  const inf = i + og;
  const tog = Number(og.toFixed(2));
  const tinf = Number(inf.toFixed(2));
  return { tog, tinf };
}

function historicalMoneyPeriod(m: number, i: number, o: number): PeriodResult {
  const inf = (0.25 * i + 0.75 * (2 * m + o)) / 1.75;
  const og = m - inf + o;
  const tinf = Number(inf.toFixed(2));
  const tog = Number(og.toFixed(2));
  return { tinf, tog };
}

function historicalScore(
  inflation: readonly [number, number, number, number],
  outputGap: readonly [number, number, number, number]
) {
  const calc =
    200 -
    Math.pow(inflation[0] - 2, 2) -
    Math.pow(inflation[1] - 2, 2) -
    Math.pow(inflation[2] - 2, 2) -
    Math.pow(inflation[3] - 2, 2) +
    5 * outputGap[0] +
    5 * outputGap[1] +
    5 * outputGap[2] +
    5 * outputGap[3];
  return calc < 0 ? 0 : calc;
}

function historicalInterestVerdict(data: InterestSubmission): Verdict {
  function formula(r: number, ib: number, ia: number, oa: number) {
    const og = ib - r + 1;
    const inf = ib + og;
    const to = Number(og.toFixed(2));
    const ti = Number(inf.toFixed(2));
    if (to === oa && ti === ia) return true;
    return false;
  }

  const done = historicalScore(
    [data.i1, data.i2, data.i3, data.i4],
    [data.o1, data.o2, data.o3, data.o4]
  );
  if (
    formula(data.r1, data.i0, data.i1, data.o1) &&
    formula(data.r2, data.i1, data.i2, data.o2) &&
    formula(data.r3, data.i2, data.i3, data.o3) &&
    formula(data.r4, data.i3, data.i4, data.o4)
  ) {
    return done === data.s ? "accepted" : "score-mismatch";
  }
  return "invalid-data";
}

function currentInterestVerdict(data: InterestSubmission): Verdict {
  const done = calculateScore(
    [data.i1, data.i2, data.i3, data.i4],
    [data.o1, data.o2, data.o3, data.o4]
  );
  if (
    isInterestPeriodValid(data.r1, data.i0, data.i1, data.o1) &&
    isInterestPeriodValid(data.r2, data.i1, data.i2, data.o2) &&
    isInterestPeriodValid(data.r3, data.i2, data.i3, data.o3) &&
    isInterestPeriodValid(data.r4, data.i3, data.i4, data.o4)
  ) {
    return done === data.s ? "accepted" : "score-mismatch";
  }
  return "invalid-data";
}

function historicalMoneyVerdict(data: MoneySubmission): Verdict {
  function formula(m: number, ib: number, ia: number, ob: number, oa: number) {
    const inf = (0.25 * ib + 0.75 * (2 * m + ob)) / 1.75;
    const og = m - inf + ob;
    const ti = Number(inf.toFixed(2));
    const to = Number(og.toFixed(2));
    if (to === oa && ti === ia) return true;
    return false;
  }

  const done = historicalScore(
    [data.i1, data.i2, data.i3, data.i4],
    [data.o1, data.o2, data.o3, data.o4]
  );
  if (
    formula(data.r1, data.i0, data.i1, data.o0, data.o1) &&
    formula(data.r2, data.i1, data.i2, data.o1, data.o2) &&
    formula(data.r3, data.i2, data.i3, data.o2, data.o3) &&
    formula(data.r4, data.i3, data.i4, data.o3, data.o4)
  ) {
    return done === data.s ? "accepted" : "score-mismatch";
  }
  return "invalid-data";
}

function currentMoneyVerdict(data: MoneySubmission): Verdict {
  const done = calculateScore(
    [data.i1, data.i2, data.i3, data.i4],
    [data.o1, data.o2, data.o3, data.o4]
  );
  if (
    isMoneyPeriodValid(data.r1, data.i0, data.i1, data.o0, data.o1) &&
    isMoneyPeriodValid(data.r2, data.i1, data.i2, data.o1, data.o2) &&
    isMoneyPeriodValid(data.r3, data.i2, data.i3, data.o2, data.o3) &&
    isMoneyPeriodValid(data.r4, data.i3, data.i4, data.o3, data.o4)
  ) {
    return done === data.s ? "accepted" : "score-mismatch";
  }
  return "invalid-data";
}

function runInterestSequence(
  decisions: readonly [number, number, number, number],
  period: (rate: number, inflation: number) => PeriodResult,
  score: typeof historicalScore = historicalScore
): SequenceResult {
  let inflation = 8;
  const periods = decisions.map((decision) => {
    const result = period(decision, inflation);
    inflation = result.tinf;
    return result;
  });
  return {
    periods,
    score: score(
      periods.map((item) => item.tinf) as [number, number, number, number],
      periods.map((item) => item.tog) as [number, number, number, number]
    ),
  };
}

function runMoneySequence(
  decisions: readonly [number, number, number, number],
  period: (money: number, inflation: number, outputGap: number) => PeriodResult,
  score: typeof historicalScore = historicalScore
): SequenceResult {
  let inflation = 8;
  let outputGap = 0;
  const periods = decisions.map((decision) => {
    const result = period(decision, inflation, outputGap);
    inflation = result.tinf;
    outputGap = result.tog;
    return result;
  });
  return {
    periods,
    score: score(
      periods.map((item) => item.tinf) as [number, number, number, number],
      periods.map((item) => item.tog) as [number, number, number, number]
    ),
  };
}

function interestSubmission(
  decisions: readonly [number, number, number, number],
  result: SequenceResult
): InterestSubmission {
  return {
    i0: 8,
    i1: result.periods[0].tinf,
    i2: result.periods[1].tinf,
    i3: result.periods[2].tinf,
    i4: result.periods[3].tinf,
    o1: result.periods[0].tog,
    o2: result.periods[1].tog,
    o3: result.periods[2].tog,
    o4: result.periods[3].tog,
    r1: decisions[0],
    r2: decisions[1],
    r3: decisions[2],
    r4: decisions[3],
    s: result.score,
  };
}

function moneySubmission(
  decisions: readonly [number, number, number, number],
  result: SequenceResult
): MoneySubmission {
  return { ...interestSubmission(decisions, result), o0: 0 };
}

function assertSameNumber(actual: number, expected: number, context: string) {
  if (!Object.is(actual, expected)) {
    throw new Error(`${context}: expected ${String(expected)}, received ${String(actual)}`);
  }
}

function assertSamePeriod(actual: PeriodResult, expected: PeriodResult, context: string) {
  assertSameNumber(actual.tinf, expected.tinf, `${context} inflation`);
  assertSameNumber(actual.tog, expected.tog, `${context} output gap`);
}

function forEachDecisionSequence(
  values: readonly number[],
  callback: (decisions: [number, number, number, number]) => void
) {
  for (const r1 of values)
    for (const r2 of values)
      for (const r3 of values)
        for (const r4 of values)
          callback([r1, r2, r3, r4]);
}

const DIFFERENTIAL_VALUES = [
  -100,
  -10,
  -1.005,
  -0,
  0.0049,
  0.005,
  1.999,
  2,
  8,
  8.125,
  99.99,
] as const;

const GOLDEN_INTEREST = [
  { decisions: [9, 9, 9, 9], periods: [[8, 0], [8, 0], [8, 0], [8, 0]], score: 56 },
  { decisions: [12, 8, 4, 2], periods: [[5, -3], [3, -2], [3, 0], [5, 2]], score: 165 },
  { decisions: [8.125, -1.75, 3.333, 0.005], periods: [[8.88, 0.88], [20.51, 11.63], [38.69, 18.18], [78.38, 39.68]], score: 0 },
  { decisions: [-10, -5, 0, 5], periods: [[27, 19], [60, 33], [121, 61], [238, 117]], score: 0 },
] as const;

const GOLDEN_MONEY = [
  { decisions: [8, 8, 8, 8], periods: [[8, 0], [8, 0], [8, 0], [8, 0]], score: 56 },
  { decisions: [6, 4, 2, 0], periods: [[6.29, -0.29], [4.2, -0.49], [2.1, -0.59], [0.05, -0.64]], score: 162.89340000000004 },
  { decisions: [8.125, -1.75, 3.333, 0.005], periods: [[8.11, 0.02], [-0.33, -1.4], [2.21, -0.28], [0.2, -0.47]], score: 143.3049 },
  { decisions: [-10, -5, 0, 5], periods: [[-7.43, -2.57], [-6.45, -1.12], [-1.4, 0.28], [4.21, 1.07]], score: 11.528500000000019 },
] as const;

describe("historical source identity", () => {
  for (const [file, expectedHash] of Object.entries(HISTORICAL_SOURCE_HASHES)) {
    it(`${file} matches the audited pre-refactor blob`, () => {
      const source = execFileSync("git", ["show", `${REFERENCE_COMMIT}:${file}`]);
      expect(createHash("sha256").update(source).digest("hex")).toBe(expectedHash);
    });
  }
});

describe("historical golden sequences", () => {
  for (const golden of GOLDEN_INTEREST) {
    it(`interest ${golden.decisions.join(",")}`, () => {
      const result = runInterestSequence([...golden.decisions], calculateInterestPeriod, calculateScore);
      expect(result.periods.map((item) => [item.tinf, item.tog])).toEqual(golden.periods);
      expect(result.score).toBe(golden.score);
    });
  }

  for (const golden of GOLDEN_MONEY) {
    it(`money ${golden.decisions.join(",")}`, () => {
      const result = runMoneySequence([...golden.decisions], calculateMoneyPeriod, calculateScore);
      expect(result.periods.map((item) => [item.tinf, item.tog])).toEqual(golden.periods);
      expect(result.score).toBe(golden.score);
    });
  }
});

describe("old versus new differential properties", () => {
  it("matches every interest period calculation in the representative grid", () => {
    for (const rate of DIFFERENTIAL_VALUES) {
      for (const inflation of DIFFERENTIAL_VALUES) {
        assertSamePeriod(
          calculateInterestPeriod(rate, inflation),
          historicalInterestPeriod(rate, inflation),
          `rate=${rate}, inflation=${inflation}`
        );
      }
    }
  });

  it("matches every money period calculation in the representative grid", () => {
    for (const money of DIFFERENTIAL_VALUES) {
      for (const inflation of DIFFERENTIAL_VALUES) {
        for (const outputGap of DIFFERENTIAL_VALUES) {
          assertSamePeriod(
            calculateMoneyPeriod(money, inflation, outputGap),
            historicalMoneyPeriod(money, inflation, outputGap),
            `money=${money}, inflation=${inflation}, outputGap=${outputGap}`
          );
        }
      }
    }
  });

  it("matches all four interest periods, scores, and server verdicts", () => {
    forEachDecisionSequence(DIFFERENTIAL_VALUES, (decisions) => {
      const oldResult = runInterestSequence(decisions, historicalInterestPeriod);
      const newResult = runInterestSequence(decisions, calculateInterestPeriod, calculateScore);
      for (let index = 0; index < 4; index += 1) {
        assertSamePeriod(newResult.periods[index], oldResult.periods[index], `interest ${decisions} period ${index + 1}`);
      }
      assertSameNumber(newResult.score, oldResult.score, `interest ${decisions} score`);

      const valid = interestSubmission(decisions, oldResult);
      const invalidResult = { ...valid, i4: valid.i4 + 0.01 };
      const invalidScore = { ...valid, s: valid.s + 0.01 };
      expect(historicalInterestVerdict(valid)).toBe("accepted");
      expect(historicalInterestVerdict(invalidResult)).toBe("invalid-data");
      expect(historicalInterestVerdict(invalidScore)).toBe("score-mismatch");
      expect(currentInterestVerdict(valid)).toBe(historicalInterestVerdict(valid));
      expect(currentInterestVerdict(invalidResult)).toBe(historicalInterestVerdict(invalidResult));
      expect(currentInterestVerdict(invalidScore)).toBe(historicalInterestVerdict(invalidScore));
    });
  });

  it("matches all four money periods, scores, and server verdicts", () => {
    forEachDecisionSequence(DIFFERENTIAL_VALUES, (decisions) => {
      const oldResult = runMoneySequence(decisions, historicalMoneyPeriod);
      const newResult = runMoneySequence(decisions, calculateMoneyPeriod, calculateScore);
      for (let index = 0; index < 4; index += 1) {
        assertSamePeriod(newResult.periods[index], oldResult.periods[index], `money ${decisions} period ${index + 1}`);
      }
      assertSameNumber(newResult.score, oldResult.score, `money ${decisions} score`);

      const valid = moneySubmission(decisions, oldResult);
      const invalidResult = { ...valid, o3: valid.o3 + 0.01 };
      const invalidScore = { ...valid, s: valid.s + 0.01 };
      expect(historicalMoneyVerdict(valid)).toBe("accepted");
      expect(historicalMoneyVerdict(invalidResult)).toBe("invalid-data");
      expect(historicalMoneyVerdict(invalidScore)).toBe("score-mismatch");
      expect(currentMoneyVerdict(valid)).toBe(historicalMoneyVerdict(valid));
      expect(currentMoneyVerdict(invalidResult)).toBe(historicalMoneyVerdict(invalidResult));
      expect(currentMoneyVerdict(invalidScore)).toBe(historicalMoneyVerdict(invalidScore));
    });
  });
});

describe("non-finite and strict-equality edge behavior", () => {
  it("matches non-finite interest calculations and rejection", () => {
    const cases = [[Number.NaN, 8], [8, Number.NaN], [Infinity, 8], [-Infinity, 8]] as const;
    for (const [rate, inflation] of cases) {
      const oldResult = historicalInterestPeriod(rate, inflation);
      assertSamePeriod(calculateInterestPeriod(rate, inflation), oldResult, `interest ${rate},${inflation}`);
      expect(isInterestPeriodValid(rate, inflation, oldResult.tinf, oldResult.tog)).toBe(
        oldResult.tog === oldResult.tog && oldResult.tinf === oldResult.tinf
      );
    }
  });

  it("matches non-finite money calculations and score flooring behavior", () => {
    const cases = [
      [Number.NaN, 8, 0],
      [8, Number.NaN, 0],
      [8, 8, Number.NaN],
      [Infinity, 8, 0],
      [-Infinity, 8, 0],
    ] as const;
    for (const [money, inflation, outputGap] of cases) {
      assertSamePeriod(
        calculateMoneyPeriod(money, inflation, outputGap),
        historicalMoneyPeriod(money, inflation, outputGap),
        `money ${money},${inflation},${outputGap}`
      );
    }

    const scores = [
      [[Number.NaN, 2, 2, 2], [0, 0, 0, 0]],
      [[Infinity, 2, 2, 2], [0, 0, 0, 0]],
      [[-Infinity, 2, 2, 2], [0, 0, 0, 0]],
    ] as const;
    for (const [inflation, outputGap] of scores) {
      assertSameNumber(
        calculateScore([...inflation], [...outputGap]),
        historicalScore([...inflation], [...outputGap]),
        `score ${inflation}`
      );
    }
  });

  it("rejects NaN results and scores exactly as the historical server did", () => {
    const interest = interestSubmission(
      [9, 9, 9, 9],
      runInterestSequence([9, 9, 9, 9], historicalInterestPeriod)
    );
    const money = moneySubmission(
      [8, 8, 8, 8],
      runMoneySequence([8, 8, 8, 8], historicalMoneyPeriod)
    );
    for (const candidate of [
      { old: historicalInterestVerdict, current: currentInterestVerdict, data: { ...interest, i4: Number.NaN } },
      { old: historicalInterestVerdict, current: currentInterestVerdict, data: { ...interest, s: Number.NaN } },
      { old: historicalMoneyVerdict, current: currentMoneyVerdict, data: { ...money, o2: Number.NaN } },
      { old: historicalMoneyVerdict, current: currentMoneyVerdict, data: { ...money, s: Number.NaN } },
    ] as const) {
      expect(candidate.current(candidate.data as never)).toBe(candidate.old(candidate.data as never));
      expect(candidate.current(candidate.data as never)).not.toBe("accepted");
    }
  });
});
