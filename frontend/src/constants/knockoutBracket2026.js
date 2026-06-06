/** Official FIFA World Cup 2026 knockout bracket (matches 73–88+). */

export const R32_FIXTURES = [
  { index: 1, fifa: 73, home: { pos: 2, group: "A" }, away: { pos: 2, group: "B" } },
  { index: 2, fifa: 74, home: { pos: 1, group: "E" }, away: { pos: 3, thirdSlot: "E" } },
  { index: 3, fifa: 75, home: { pos: 1, group: "F" }, away: { pos: 2, group: "C" } },
  { index: 4, fifa: 76, home: { pos: 1, group: "C" }, away: { pos: 2, group: "F" } },
  { index: 5, fifa: 77, home: { pos: 1, group: "I" }, away: { pos: 3, thirdSlot: "I" } },
  { index: 6, fifa: 78, home: { pos: 2, group: "E" }, away: { pos: 2, group: "I" } },
  { index: 7, fifa: 79, home: { pos: 1, group: "A" }, away: { pos: 3, thirdSlot: "A" } },
  { index: 8, fifa: 80, home: { pos: 1, group: "L" }, away: { pos: 3, thirdSlot: "L" } },
  { index: 9, fifa: 81, home: { pos: 1, group: "D" }, away: { pos: 3, thirdSlot: "D" } },
  { index: 10, fifa: 82, home: { pos: 1, group: "G" }, away: { pos: 3, thirdSlot: "G" } },
  { index: 11, fifa: 83, home: { pos: 2, group: "K" }, away: { pos: 2, group: "L" } },
  { index: 12, fifa: 84, home: { pos: 1, group: "H" }, away: { pos: 2, group: "J" } },
  { index: 13, fifa: 85, home: { pos: 1, group: "B" }, away: { pos: 3, thirdSlot: "B" } },
  { index: 14, fifa: 86, home: { pos: 1, group: "J" }, away: { pos: 2, group: "H" } },
  { index: 15, fifa: 87, home: { pos: 1, group: "K" }, away: { pos: 3, thirdSlot: "K" } },
  { index: 16, fifa: 88, home: { pos: 2, group: "D" }, away: { pos: 2, group: "G" } },
];

export const R16_FEED = [
  { home: 2, away: 5 },
  { home: 1, away: 3 },
  { home: 4, away: 6 },
  { home: 7, away: 8 },
  { home: 11, away: 12 },
  { home: 9, away: 10 },
  { home: 14, away: 16 },
  { home: 13, away: 15 },
];

export const QF_FEED = [
  { home: 1, away: 2 },
  { home: 5, away: 6 },
  { home: 3, away: 4 },
  { home: 7, away: 8 },
];

export const SF_FEED = [
  { home: 1, away: 2 },
  { home: 3, away: 4 },
];

export const FINAL_FEED = { home: 1, away: 2 };

export function r32FixtureLabel(index) {
  const fx = R32_FIXTURES.find((f) => f.index === index);
  if (!fx) return `Match ${72 + index}`;
  const slot = (side) => {
    if (side.pos === 3 && side.thirdSlot) return `3rd (${side.thirdSlot})`;
    return side.pos === 1 ? `1${side.group}` : `2${side.group}`;
  };
  return `${slot(fx.home)} vs ${slot(fx.away)}`;
}

export function getKnockoutMatchLabel(roundKey, index) {
  if (roundKey === "round_of_32") {
    return `Match ${72 + index} · ${r32FixtureLabel(index)}`;
  }
  if (roundKey === "round_of_16") {
    const p = R16_FEED[index - 1];
    return p ? `W${72 + p.home} vs W${72 + p.away}` : null;
  }
  if (roundKey === "quarter_final") {
    const p = QF_FEED[index - 1];
    return p ? `W${88 + p.home} vs W${88 + p.away}` : null;
  }
  if (roundKey === "semi_final") {
    const p = SF_FEED[index - 1];
    return p ? `W${96 + p.home} vs W${96 + p.away}` : null;
  }
  if (roundKey === "final") return "W101 vs W102";
  return null;
}
