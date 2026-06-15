/**
 * Left / right half layout for the visual knockout bracket.
 *
 * These follow the OFFICIAL FIFA 2026 feed tree (see knockoutBracket2026.js),
 * not a naive 1–8 / 9–16 split, so every match is drawn directly next to the
 * two matches that feed it and each half flows inward without crossing sides.
 *
 *   Left half  → Semi-final 1 → Final (home)
 *   Right half → Semi-final 2 → Final (away)
 *
 * Each array is ordered top → bottom as drawn. R32 order is "home feeder then
 * away feeder" of the R16 match it leads into, so connectors line up.
 */

// Left: R16 {1,2,5,6} ← R32 {2,5 | 1,3 | 11,12 | 9,10}
export const LEFT_R32 = [2, 5, 1, 3, 11, 12, 9, 10];
// Right: R16 {3,4,7,8} ← R32 {4,6 | 7,8 | 14,16 | 13,15}
export const RIGHT_R32 = [4, 6, 7, 8, 14, 16, 13, 15];

export const LEFT_R16 = [1, 2, 5, 6];
export const RIGHT_R16 = [3, 4, 7, 8];

export const LEFT_QF = [1, 2];
export const RIGHT_QF = [3, 4];

export const LEFT_SF = 1;
export const RIGHT_SF = 2;

/** Shared row grid: 8 slots per bracket half (one per Round-of-32 match). */
export const BRACKET_SLOT_COUNT = 8;
export const BRACKET_GRID_MIN_HEIGHT = 720;

const ROUND_ROW_SPAN = {
  r32: 1,
  r16: 2,
  qf: 4,
  sf: 8,
};

/** Grid row placement for a match within one bracket half. */
export function bracketGridSlot(round, indexInRound) {
  const rowSpan = ROUND_ROW_SPAN[round];
  const rowStart = indexInRound * rowSpan + 1;
  return { rowStart, rowSpan };
}

export function teamSeedLabel(teamId, groups, teams) {
  if (!teamId) return "—";
  const team = teams.find((t) => t.id === teamId);

  for (const [letter, picks] of Object.entries(groups || {})) {
    if (picks?.first === teamId) return `1${letter}`;
    if (picks?.second === teamId) return `2${letter}`;
    if (picks?.third === teamId) return `3${letter}`;
  }

  return team?.code || "—";
}

export function r32PairIndex(matchIndex) {
  return Math.floor((matchIndex - 1) / 2);
}
