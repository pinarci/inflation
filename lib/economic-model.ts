export const GAME_PERIODS = 4 as const;
export const COMPLETED_PERIOD = 5 as const;
export const COMPLETED_GAME = 2 as const;

export function getNextPeriod(period: 1 | 2 | 3 | 4) {
  return period === 4 ? COMPLETED_PERIOD : period + 1;
}

export function getSubmissionGame(game: number) {
  if (game === 0) return 1;
  if (game === 1) return 2;
  return undefined;
}

export function getScoreColumn(game: number) {
  return game === 1 ? "s1" : "s2";
}

export type EconomicGameState = {
  period: number;
  inflation0: number;
  inflation1: number;
  inflation2: number;
  inflation3: number;
  inflation4: number;
  og0: number;
  og1: number;
  og2: number;
  og3: number;
  og4: number;
  rate0: number;
  rate1: number;
  rate2: number;
  rate3: number;
  rate4: number;
  score: number;
};

export const INTEREST_INITIAL_STATE: EconomicGameState = {
  period: 1,
  inflation0: 8,
  inflation1: 0,
  inflation2: 0,
  inflation3: 0,
  inflation4: 0,
  og0: 0,
  og1: 0,
  og2: 0,
  og3: 0,
  og4: 0,
  rate0: 9,
  rate1: 0,
  rate2: 0,
  rate3: 0,
  rate4: 0,
  score: 7,
};

export const MONEY_INITIAL_STATE: EconomicGameState = {
  ...INTEREST_INITIAL_STATE,
  rate0: 8,
};

export type PeriodResult = { tinf: number; tog: number };

export function calculateInterestPeriod(
  rate: number,
  previousInflation: number
): PeriodResult {
  const og = previousInflation - rate + 1;
  const inf = previousInflation + og;
  const tog = Number(og.toFixed(2));
  const tinf = Number(inf.toFixed(2));
  return { tog, tinf };
}

export function calculateMoneyPeriod(
  moneyGrowth: number,
  previousInflation: number,
  previousOutputGap: number
): PeriodResult {
  const inf =
    (0.25 * previousInflation +
      0.75 * (2 * moneyGrowth + previousOutputGap)) /
    1.75;
  const og = moneyGrowth - inf + previousOutputGap;
  const tinf = Number(inf.toFixed(2));
  const tog = Number(og.toFixed(2));
  return { tinf, tog };
}

export function calculateScore(
  inflation: readonly [number, number, number, number],
  outputGap: readonly [number, number, number, number]
): number {
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

export function isInterestPeriodValid(
  rate: number,
  previousInflation: number,
  inflation: number,
  outputGap: number
): boolean {
  const result = calculateInterestPeriod(rate, previousInflation);
  return result.tog === outputGap && result.tinf === inflation;
}

export function isMoneyPeriodValid(
  moneyGrowth: number,
  previousInflation: number,
  inflation: number,
  previousOutputGap: number,
  outputGap: number
): boolean {
  const result = calculateMoneyPeriod(
    moneyGrowth,
    previousInflation,
    previousOutputGap
  );
  return result.tog === outputGap && result.tinf === inflation;
}
