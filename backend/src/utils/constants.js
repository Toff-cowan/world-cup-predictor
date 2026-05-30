export const GROUPS = "ABCDEFGHIJKL".split("");

export { GROUPS as GROUP_LETTERS };

export const STAGES = [
  "group",
  "round_of_32",
  "round_of_16",
  "quarter_final",
  "semi_final",
  "final",
];

export const TOURNAMENT = {
  start: process.env.TOURNAMENT_START || "2026-06-11",
  end: process.env.TOURNAMENT_END || "2026-07-19",
};
