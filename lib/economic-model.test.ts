import { describe, expect, it } from "vitest";
import {
  calculateInterestPeriod,
  calculateMoneyPeriod,
  calculateScore,
  INTEREST_INITIAL_STATE,
  COMPLETED_GAME,
  COMPLETED_PERIOD,
  getNextPeriod,
  getScoreColumn,
  getSubmissionGame,
  isInterestPeriodValid,
  isMoneyPeriodValid,
  MONEY_INITIAL_STATE,
} from "./economic-model";

describe("protected economic model", () => {
  it("locks the initial values", () => {
    expect(INTEREST_INITIAL_STATE).toEqual({
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
    });
    expect(MONEY_INITIAL_STATE).toEqual({
      ...INTEREST_INITIAL_STATE,
      rate0: 8,
    });
  });

  it("locks period transitions, two-game completion, and score columns", () => {
    expect([1, 2, 3, 4].map((period) => getNextPeriod(period as 1 | 2 | 3 | 4))).toEqual([2, 3, 4, 5]);
    expect(COMPLETED_PERIOD).toBe(5);
    expect(getSubmissionGame(0)).toBe(1);
    expect(getSubmissionGame(1)).toBe(2);
    expect(getSubmissionGame(2)).toBeUndefined();
    expect(getSubmissionGame(-1)).toBeUndefined();
    expect(getSubmissionGame(Number.NaN)).toBeUndefined();
    expect(COMPLETED_GAME).toBe(2);
    expect(getScoreColumn(1)).toBe("s1");
    expect(getScoreColumn(2)).toBe("s2");
  });

  it("preserves interest-rate calculations and two-decimal rounding", () => {
    expect(calculateInterestPeriod(9, 8)).toEqual({ tinf: 8, tog: 0 });
    expect(calculateInterestPeriod(8.125, 6.789)).toEqual({
      tinf: 6.45,
      tog: -0.34,
    });
    expect(isInterestPeriodValid(8.125, 6.789, 6.45, -0.34)).toBe(true);
    expect(isInterestPeriodValid(8.125, 6.789, 6.451, -0.34)).toBe(false);
  });

  it("preserves money-growth calculations and two-decimal rounding", () => {
    expect(calculateMoneyPeriod(8, 8, 0)).toEqual({ tinf: 8, tog: 0 });
    expect(calculateMoneyPeriod(6, 8, 0)).toEqual({
      tinf: 6.29,
      tog: -0.29,
    });
    expect(isMoneyPeriodValid(6, 8, 6.29, 0, -0.29)).toBe(true);
    expect(isMoneyPeriodValid(6, 8, 6.29, 0, -0.291)).toBe(false);
  });

  it("preserves the score formula, its unrounded result, and zero floor", () => {
    expect(calculateScore([2, 2, 2, 2], [0, 0, 0, 0])).toBe(200);
    expect(calculateScore([8, 6.29, 4.12, 2.31], [0, -0.29, 0.59, 2.28])).toBe(
      153.9054
    );
    expect(calculateScore([100, 100, 100, 100], [-100, -100, -100, -100])).toBe(
      0
    );
  });
});
