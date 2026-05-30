import { GROUP_LETTERS, KNOCKOUT_ROUNDS, matchKey } from "../constants/bracket.js";

export function createEmptyBracket() {
  const groups = {};
  for (const g of GROUP_LETTERS) {
    groups[g] = { first: null, second: null };
  }

  const knockout = {};
  for (const round of KNOCKOUT_ROUNDS) {
    knockout[round.key] = {};
    for (let i = 1; i <= round.count; i++) {
      knockout[round.key][matchKey(i)] = { home: null, away: null, winner: null };
    }
  }

  return { groups, knockout };
}

function ensureMatch(knockout, roundKey, index) {
  const key = matchKey(index);
  if (!knockout[roundKey][key]) {
    knockout[roundKey][key] = { home: null, away: null, winner: null };
  }
  return knockout[roundKey][key];
}

/** Fill downstream slots from winners in earlier rounds */
export function syncKnockoutAdvancement(knockout) {
  const k = structuredClone(knockout);

  for (let i = 1; i <= 8; i++) {
    const m = ensureMatch(k, "round_of_16", i);
    const wHome = k.round_of_32?.[matchKey(i * 2 - 1)]?.winner ?? null;
    const wAway = k.round_of_32?.[matchKey(i * 2)]?.winner ?? null;
    m.home = wHome;
    m.away = wAway;
    if (m.winner && m.winner !== wHome && m.winner !== wAway) m.winner = null;
  }

  for (let i = 1; i <= 4; i++) {
    const m = ensureMatch(k, "quarter_final", i);
    const wHome = k.round_of_16?.[matchKey(i * 2 - 1)]?.winner ?? null;
    const wAway = k.round_of_16?.[matchKey(i * 2)]?.winner ?? null;
    m.home = wHome;
    m.away = wAway;
    if (m.winner && m.winner !== wHome && m.winner !== wAway) m.winner = null;
  }

  for (let i = 1; i <= 2; i++) {
    const m = ensureMatch(k, "semi_final", i);
    const wHome = k.quarter_final?.[matchKey(i * 2 - 1)]?.winner ?? null;
    const wAway = k.quarter_final?.[matchKey(i * 2)]?.winner ?? null;
    m.home = wHome;
    m.away = wAway;
    if (m.winner && m.winner !== wHome && m.winner !== wAway) m.winner = null;
  }

  const final = ensureMatch(k, "final", 1);
  final.home = k.semi_final?.m1?.winner ?? null;
  final.away = k.semi_final?.m2?.winner ?? null;
  if (final.winner && final.winner !== final.home && final.winner !== final.away) {
    final.winner = null;
  }

  return k;
}

export function normalizeBracket(raw) {
  const base = createEmptyBracket();
  if (!raw || typeof raw !== "object") return base;

  for (const g of GROUP_LETTERS) {
    if (raw.groups?.[g]) {
      base.groups[g] = {
        first: raw.groups[g].first ?? null,
        second: raw.groups[g].second ?? null,
      };
    }
  }

  for (const round of KNOCKOUT_ROUNDS) {
    const src = raw.knockout?.[round.key] || {};
    for (let i = 1; i <= round.count; i++) {
      const mk = matchKey(i);
      const s = src[mk];
      if (s) {
        base.knockout[round.key][mk] = {
          home: s.home ?? null,
          away: s.away ?? null,
          winner: s.winner ?? null,
        };
      }
    }
  }

  base.knockout = syncKnockoutAdvancement(base.knockout);
  return base;
}

export function setGroupPick(bracket, group, slot, teamId) {
  const next = structuredClone(bracket);
  next.groups[group] = { ...next.groups[group], [slot]: teamId || null };
  return next;
}

export function setKnockoutSide(bracket, roundKey, matchIndex, side, teamId) {
  const next = structuredClone(bracket);
  const mk = matchKey(matchIndex);
  ensureMatch(next.knockout, roundKey, matchIndex);
  next.knockout[roundKey][mk][side] = teamId || null;
  if (
    next.knockout[roundKey][mk].winner &&
    next.knockout[roundKey][mk].winner !== next.knockout[roundKey][mk].home &&
    next.knockout[roundKey][mk].winner !== next.knockout[roundKey][mk].away
  ) {
    next.knockout[roundKey][mk].winner = null;
  }
  return { ...next, knockout: syncKnockoutAdvancement(next.knockout) };
}

export function setKnockoutWinner(bracket, roundKey, matchIndex, teamId) {
  const next = structuredClone(bracket);
  const mk = matchKey(matchIndex);
  ensureMatch(next.knockout, roundKey, matchIndex);
  next.knockout[roundKey][mk].winner = teamId || null;
  return { ...next, knockout: syncKnockoutAdvancement(next.knockout) };
}

export function teamById(teams, id) {
  if (id == null) return null;
  return teams.find((t) => t.id === id) ?? null;
}
