# Economic model specification

This document records the numerical behavior that existed before the cleanup. It is an immutable compatibility specification: refactors must keep the same inputs, intermediate rounding, outputs, scores, period transitions, and completion rules.

## Shared game lifecycle

- Each version starts at period `1`, accepts four decisions, and displays the final state at period `5`.
- A database `game` value of `0` records the first score and advances to game `1`; a value of `1` records the second score and advances to game `2`; `2` is complete.
- Inflation starts at `8`; the output gap starts at `0`; the placeholder score starts at `7`.
- Every calculated inflation and output-gap value is converted with `Number(value.toFixed(2))` before it is stored or used by the next period.
- Client submissions are recomputed on the server and accepted only when all rounded period values and the unrounded score match exactly.

## Interest Rate version

- Initial nominal interest rate: `9`.
- Inflation target shown to players: `2` percent.
- Neutral real rate shown to players: `1` percent.
- For each period, with nominal rate `r` and previous inflation `ib`:
  - output gap: `og = ib - r + 1`
  - inflation: `inf = ib + og`
  - returned values: `Number(og.toFixed(2))` and `Number(inf.toFixed(2))`

## Money Growth version

- Initial money growth: `8`.
- Inflation target shown to players: `2` percent.
- Potential real growth shown to players: `0` percent.
- Velocity of money is stated to be constant.
- For each period, with money growth `m`, previous inflation `ib`, and previous output gap `ob`:
  - inflation: `inf = (0.25 * ib + 0.75 * (2 * m + ob)) / 1.75`
  - output gap: `og = m - inf + ob`
  - returned values: `Number(inf.toFixed(2))` and `Number(og.toFixed(2))`

## Score

After period four, both versions calculate:

```text
calc = 200
  - (i1 - 2)^2
  - (i2 - 2)^2
  - (i3 - 2)^2
  - (i4 - 2)^2
  + 5*o1 + 5*o2 + 5*o3 + 5*o4
score = calc < 0 ? 0 : calc
```

The UI displays `Number(score.toFixed(2))`, but the unrounded score is retained and validated.
