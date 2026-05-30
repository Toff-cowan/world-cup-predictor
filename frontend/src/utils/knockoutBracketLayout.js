/** Left / right half layout for the visual knockout bracket. */

export const LEFT_R32 = [1, 2, 3, 4, 5, 6, 7, 8];
export const RIGHT_R32 = [16, 15, 14, 13, 12, 11, 10, 9];

export const LEFT_R16 = [1, 2, 3, 4];
export const RIGHT_R16 = [8, 7, 6, 5];

export const LEFT_QF = [1, 2];
export const RIGHT_QF = [4, 3];

export const LEFT_SF = 1;
export const RIGHT_SF = 2;

export function teamSeedLabel(teamId, groups, teams) {
  if (!teamId) return "—";
  const team = teams.find((t) => t.id === teamId);

  for (const [letter, picks] of Object.entries(groups || {})) {
    if (picks?.first === teamId) return `1${letter}`;
    if (picks?.second === teamId) return `2${letter}`;
  }

  return team?.code || "—";
}

export function r32PairIndex(matchIndex) {
  return Math.floor((matchIndex - 1) / 2);
}
