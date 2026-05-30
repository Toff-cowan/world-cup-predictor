import { GROUP_LETTERS, KNOCKOUT_ROUNDS, matchKey } from "../constants/bracket.js";
import {
  computePredictedStandings,
  fixturesByGroup,
  qualifiersFromStandings,
} from "./groupPredictionHelpers.js";

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

  return { groups, group_matches: {}, locked_groups: [], knockout };
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

export function normalizeBracket(raw, { teams, matches } = {}) {
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
          scores: {
            home: s.scores?.home ?? null,
            away: s.scores?.away ?? null,
          },
        };
      }
    }
  }

  base.knockout = syncKnockoutAdvancement(base.knockout);

  if (raw.group_matches && typeof raw.group_matches === "object") {
    base.group_matches = { ...raw.group_matches };
  }

  if (Array.isArray(raw.locked_groups)) {
    base.locked_groups = raw.locked_groups.filter((g) => GROUP_LETTERS.includes(g));
  }

  if (teams?.length && matches) {
    return syncGroupQualifiers(base, teams, matches);
  }

  return base;
}

function syncGroupQualifiers(bracket, teams, matches) {
  const grouped = fixturesByGroup(matches, teams);
  const next = structuredClone(bracket);

  for (const letter of GROUP_LETTERS) {
    const groupTeams = teams.filter((t) => t.group_letter === letter);
    const fixtures = grouped[letter] || [];
    const standings = computePredictedStandings(
      groupTeams,
      fixtures,
      next.group_matches || {}
    );
    const { first, second } = qualifiersFromStandings(standings);
    next.groups[letter] = { first, second };
  }

  return next;
}

export function lockGroupInBracket(bracket, letter) {
  const next = structuredClone(bracket);
  if (!next.locked_groups) next.locked_groups = [];
  if (!next.locked_groups.includes(letter)) {
    next.locked_groups = [...next.locked_groups, letter];
  }
  return next;
}

export function unlockGroupInBracket(bracket, letter) {
  const next = structuredClone(bracket);
  if (!next.locked_groups?.length) return next;
  next.locked_groups = next.locked_groups.filter((g) => g !== letter);
  return next;
}

export function isGroupLocked(bracket, letter) {
  return bracket.locked_groups?.includes(letter) ?? false;
}

export function setGroupPick(bracket, group, slot, teamId) {
  const next = structuredClone(bracket);
  next.groups[group] = { ...next.groups[group], [slot]: teamId || null };
  return next;
}

export function setGroupMatchScore(bracket, matchId, side, value, teams, matches) {
  const next = structuredClone(bracket);
  if (!next.group_matches) next.group_matches = {};

  const key = String(matchId);
  const current = next.group_matches[key] || { home_score: null, away_score: null };
  const parsed =
    value === "" || value == null ? null : Math.max(0, Math.min(99, Number(value)));

  next.group_matches[key] = {
    ...current,
    [side]: Number.isNaN(parsed) ? null : parsed,
  };

  return syncGroupQualifiers(next, teams, matches);
}

export function setKnockoutMatchScore(
  bracket,
  roundKey,
  matchIndex,
  side,
  value,
  tieWinner = null
) {
  const next = structuredClone(bracket);
  const mk = matchKey(matchIndex);
  ensureMatch(next.knockout, roundKey, matchIndex);

  const match = next.knockout[roundKey][mk];
  if (!match.scores) match.scores = { home: null, away: null };

  const parsed =
    value === "" || value == null ? null : Math.max(0, Math.min(99, Number(value)));
  match.scores[side === "home_score" ? "home" : "away"] = Number.isNaN(parsed)
    ? null
    : parsed;

  const hs = match.scores.home;
  const as = match.scores.away;

  if (hs != null && as != null) {
    if (hs > as) match.winner = match.home;
    else if (as > hs) match.winner = match.away;
    else match.winner = tieWinner || null;
  } else {
    match.winner = null;
  }

  if (
    match.winner &&
    match.winner !== match.home &&
    match.winner !== match.away
  ) {
    match.winner = null;
  }

  return { ...next, knockout: syncKnockoutAdvancement(next.knockout) };
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
