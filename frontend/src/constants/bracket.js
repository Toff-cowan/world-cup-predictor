export const GROUP_LETTERS = "ABCDEFGHIJKL".split("");

export const STAGE_LABELS = {
  group: "Group stage",
  round_of_32: "Round of 32",
  round_of_16: "Round of 16",
  quarter_final: "Quarter-finals",
  semi_final: "Semi-finals",
  final: "Final",
};

export const STAGE_ORDER = [
  "group",
  "round_of_32",
  "round_of_16",
  "quarter_final",
  "semi_final",
  "final",
];

export const KNOCKOUT_ROUNDS = [
  { key: "round_of_32", label: "Round of 32", count: 16 },
  { key: "round_of_16", label: "Round of 16", count: 8 },
  { key: "quarter_final", label: "Quarter-finals", count: 4 },
  { key: "semi_final", label: "Semi-finals", count: 2 },
  { key: "final", label: "Final", count: 1 },
];

export function matchKey(index) {
  return `m${index}`;
}

export const BRACKET_MODE_FULL = "full";
export const BRACKET_MODE_SIMPLE = "simple";
