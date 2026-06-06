import { BRACKET_MODE_SIMPLE, GROUP_LETTERS, KNOCKOUT_ROUNDS, matchKey } from "../constants/bracket.js";
import {
  computePredictedStandings,
  fixturesByGroup,
  qualifiersFromStandings,
} from "./groupPredictionHelpers.js";
import { syncOfficialKnockout, syncSimpleKnockoutAdvancement, syncSimpleKnockoutFromGroups } from "./knockoutPopulation.js";

export function getBracketMode(bracket) {
  return bracket?.mode === BRACKET_MODE_SIMPLE ? BRACKET_MODE_SIMPLE : "full";
}

export function isSimpleBracket(bracket) {
  return getBracketMode(bracket) === BRACKET_MODE_SIMPLE;
}

export function setBracketMode(bracket, mode) {
  const next = structuredClone(bracket);
  next.mode = mode === BRACKET_MODE_SIMPLE ? BRACKET_MODE_SIMPLE : "full";
  return next;
}

export function createEmptyBracket() {
  const groups = {};
  for (const g of GROUP_LETTERS) {
    groups[g] = { first: null, second: null, third: null, fourth: null };
  }

  const knockout = {};
  for (const round of KNOCKOUT_ROUNDS) {
    knockout[round.key] = {};
    for (let i = 1; i <= round.count; i++) {
      knockout[round.key][matchKey(i)] = { home: null, away: null, winner: null };
    }
  }

  return { groups, group_matches: {}, locked_groups: [], knockout, mode: "full" };
}

function ensureMatch(knockout, roundKey, index) {
  const key = matchKey(index);
  if (!knockout[roundKey][key]) {
    knockout[roundKey][key] = { home: null, away: null, winner: null };
  }
  return knockout[roundKey][key];
}

/** Fill downstream slots from winners in earlier rounds (fallback when teams unavailable). */
export function syncKnockoutAdvancement(knockout, bracket, teams, matches) {
  if (bracket && teams?.length) {
    const matchList = Array.isArray(matches) ? matches : [];
    return syncOfficialKnockout(knockout, bracket, teams, matchList);
  }

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

function syncGroupQualifiers(bracket, teams, matches) {
  const grouped = fixturesByGroup(matches, teams);
  const next = structuredClone(bracket);

  for (const letter of GROUP_LETTERS) {
    const groupTeams = teams.filter(
      (t) => String(t.group_letter || "").toUpperCase() === letter
    );
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

function invalidateMatchSides(match, homeId, awayId) {
  const winner = normTeamId(match.winner);
  if (winner != null && winner !== homeId && winner !== awayId) {
    match.winner = null;
    match.scores = { home: null, away: null };
  }
}

function clearTeamFromKnockout(knockout, teamId, except = null) {
  const id = normTeamId(teamId);
  if (id == null) return;

  for (const round of KNOCKOUT_ROUNDS) {
    for (let i = 1; i <= round.count; i++) {
      const mk = matchKey(i);
      const match = knockout[round.key]?.[mk];
      if (!match) continue;

      const skip =
        except?.roundKey === round.key && except?.matchIndex === i;

      if (!skip && normTeamId(match.home) === id) {
        match.home = null;
        invalidateMatchSides(match, null, normTeamId(match.away));
      }
      if (!skip && normTeamId(match.away) === id) {
        match.away = null;
        invalidateMatchSides(match, normTeamId(match.home), null);
      }
    }
  }
}

function withKnockoutSync(bracket, teams, matches) {
  const matchList = Array.isArray(matches) ? matches : [];
  const next = structuredClone(bracket);
  if (isSimpleBracket(next)) {
    next.knockout = syncSimpleKnockoutFromGroups(next.knockout, next);
  } else {
    next.knockout = syncKnockoutAdvancement(next.knockout, next, teams, matchList);
  }
  return next;
}

export function resyncBracketFromGroups(bracket, teams, matches) {
  if (!teams?.length) return bracket;
  return withKnockoutSync(syncGroupQualifiers(bracket, teams, matches), teams, matches);
}

export function normalizeBracket(raw, { teams, matches, viewOnly = false } = {}) {
  const base = createEmptyBracket();
  if (!raw || typeof raw !== "object") return base;

  if (raw.mode === BRACKET_MODE_SIMPLE) {
    base.mode = BRACKET_MODE_SIMPLE;
  }

  if (raw.group_matches && typeof raw.group_matches === "object") {
    base.group_matches = { ...raw.group_matches };
  }

  if (Array.isArray(raw.locked_groups)) {
    base.locked_groups = raw.locked_groups.filter((g) => GROUP_LETTERS.includes(g));
  }

  for (const g of GROUP_LETTERS) {
    if (raw.groups?.[g]) {
      base.groups[g] = {
        first: raw.groups[g].first ?? null,
        second: raw.groups[g].second ?? null,
        third: raw.groups[g].third ?? null,
        fourth: raw.groups[g].fourth ?? null,
      };
    }
  }

  const preserveKnockoutSides = isSimpleBracket(base) || viewOnly;

  for (const round of KNOCKOUT_ROUNDS) {
    const src = raw.knockout?.[round.key] || {};
    for (let i = 1; i <= round.count; i++) {
      const mk = matchKey(i);
      const s = src[mk];
      if (s) {
        base.knockout[round.key][mk] = {
          home: preserveKnockoutSides ? normTeamId(s.home) : null,
          away: preserveKnockoutSides ? normTeamId(s.away) : null,
          winner: s.winner ?? null,
          scores: {
            home: s.scores?.home ?? null,
            away: s.scores?.away ?? null,
          },
        };
      }
    }
  }

  if (isSimpleBracket(base)) {
    if (teams?.length) {
      base.knockout = syncSimpleKnockoutFromGroups(base.knockout, base);
    }
    return base;
  }

  if (viewOnly) {
    base.knockout = syncSimpleKnockoutAdvancement(base.knockout);
    return base;
  }

  if (teams?.length) {
    return resyncBracketFromGroups(base, teams, matches);
  }

  return base;
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

export function countSimpleGroupsComplete(groups) {
  let count = 0;
  for (const letter of GROUP_LETTERS) {
    const picks = groups?.[letter];
    if (picks?.first && picks?.second && picks?.third && picks?.fourth) {
      count += 1;
    }
  }
  return count;
}

export function setSimpleGroupRank(bracket, group, teamId, teams, matches) {
  if (!GROUP_LETTERS.includes(group)) return bracket;

  const id = normTeamId(teamId);
  const team = teamById(teams, id);
  if (!team || String(team.group_letter || "").toUpperCase() !== group) return bracket;

  const next = structuredClone(bracket);
  const picks = { ...next.groups[group] };
  const slots = ["first", "second", "third", "fourth"];
  const ranked = slots.map((slot) => normTeamId(picks[slot]));

  const existingIdx = ranked.indexOf(id);
  if (existingIdx >= 0) {
    ranked.splice(existingIdx, 1);
    ranked.push(null);
  } else {
    const emptyIdx = ranked.findIndex((value) => value == null);
    if (emptyIdx < 0) return bracket;
    ranked[emptyIdx] = id;
  }

  slots.forEach((slot, index) => {
    picks[slot] = ranked[index] ?? null;
  });
  next.groups[group] = picks;

  return withKnockoutSync(next, teams, matches);
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

  return resyncBracketFromGroups(next, teams, matches);
}

export function setKnockoutMatchScore(
  bracket,
  roundKey,
  matchIndex,
  side,
  value,
  teams,
  matches,
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

  return withKnockoutSync(next, teams, matches);
}

export function setKnockoutWinner(bracket, roundKey, matchIndex, teamId, teams, matches) {
  const next = structuredClone(bracket);
  const mk = matchKey(matchIndex);
  ensureMatch(next.knockout, roundKey, matchIndex);
  next.knockout[roundKey][mk].winner = teamId || null;
  return withKnockoutSync(next, teams, matches);
}

export function setKnockoutSide(bracket, roundKey, matchIndex, side, teamId, teams, matches) {
  if (side !== "home" && side !== "away") return bracket;

  const next = structuredClone(bracket);
  const mk = matchKey(matchIndex);
  ensureMatch(next.knockout, roundKey, matchIndex);
  const match = next.knockout[roundKey][mk];
  const id = normTeamId(teamId);

  if (id != null) {
    clearTeamFromKnockout(next.knockout, id, { roundKey, matchIndex });
  }

  match[side] = id;
  invalidateMatchSides(match, normTeamId(match.home), normTeamId(match.away));

  return withKnockoutSync(next, teams, matches);
}

export function normTeamId(id) {
  if (id == null || id === "") return null;
  const n = Number(id);
  return Number.isNaN(n) ? null : n;
}

export function teamById(teams, id) {
  if (id == null) return null;
  const normalized = normTeamId(id);
  return teams.find((t) => normTeamId(t.id) === normalized) ?? null;
}

function knockoutMatchAt(knockout, roundKey, index) {
  return (
    knockout[roundKey]?.[matchKey(index)] || {
      home: null,
      away: null,
      winner: null,
      scores: { home: null, away: null },
    }
  );
}

/** Only show matches where both advancers are known. */
export function getVisibleKnockoutMatchIndices(round, knockout) {
  const indices = [];
  for (let i = 1; i <= round.count; i++) {
    const match = knockoutMatchAt(knockout, round.key, i);
    if (match.home && match.away) indices.push(i);
  }
  return indices;
}
