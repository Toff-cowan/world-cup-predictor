import annexCRows from "../data/annexC.json";
import { GROUP_LETTERS, matchKey } from "../constants/bracket.js";
import {
  FINAL_FEED,
  QF_FEED,
  R16_FEED,
  R32_FIXTURES,
  SF_FEED,
} from "../constants/knockoutBracket2026.js";
import {
  computePredictedStandings,
  fixturesByGroup,
} from "./groupPredictionHelpers.js";

function normTeamId(id) {
  if (id == null || id === "") return null;
  const n = Number(id);
  return Number.isNaN(n) ? null : n;
}

function ensureMatch(knockout, roundKey, index) {
  const key = matchKey(index);
  if (!knockout[roundKey][key]) {
    knockout[roundKey][key] = { home: null, away: null, winner: null };
  }
  if (!knockout[roundKey][key].scores) {
    knockout[roundKey][key].scores = { home: null, away: null };
  }
  return knockout[roundKey][key];
}

function getWinnerId(knockout, roundKey, index) {
  return normTeamId(knockout[roundKey]?.[matchKey(index)]?.winner);
}

function invalidateWinnerIfSidesChanged(match, homeId, awayId) {
  const winner = normTeamId(match.winner);
  if (winner != null && winner !== homeId && winner !== awayId) {
    match.winner = null;
    match.scores = { home: null, away: null };
  }
}

function assignSide(match, side, teamId) {
  const id = normTeamId(teamId);
  if (normTeamId(match[side]) === id) return;
  match[side] = id;
  invalidateWinnerIfSidesChanged(match, normTeamId(match.home), normTeamId(match.away));
}

export function getThirdPlaceCandidates(bracket, teams, matches) {
  const grouped = fixturesByGroup(matches, teams);
  const groupMatches = bracket.group_matches || {};
  const candidates = [];

  for (const letter of GROUP_LETTERS) {
    const groupTeams = teams.filter(
      (t) => String(t.group_letter || "").toUpperCase() === letter
    );
    const fixtures = grouped[letter] || [];
    const standings = computePredictedStandings(groupTeams, fixtures, groupMatches);
    const third = standings[2];
    if (third?.team_id == null) continue;
    candidates.push({
      group: letter,
      team_id: normTeamId(third.team_id),
      points: third.points,
      goal_difference: third.goal_difference,
      goals_for: third.goals_for,
    });
  }

  return candidates.sort(
    (a, b) =>
      b.points - a.points ||
      b.goal_difference - a.goal_difference ||
      b.goals_for - a.goals_for
  );
}

function lookupAnnexCMapping(qualifyingThirdGroups) {
  const key = [...qualifyingThirdGroups].sort().join("");
  return annexCRows.find((entry) => entry.groups === key)?.mapping ?? null;
}

function teamFromStandings(bracket, teams, matches, pos, groupLetter) {
  const grouped = fixturesByGroup(matches, teams);
  const groupTeams = teams.filter(
    (t) => String(t.group_letter || "").toUpperCase() === groupLetter
  );
  const fixtures = grouped[groupLetter] || [];
  const standings = computePredictedStandings(
    groupTeams,
    fixtures,
    bracket.group_matches || {}
  );
  if (pos === 1) return normTeamId(standings[0]?.team_id ?? null);
  if (pos === 2) return normTeamId(standings[1]?.team_id ?? null);
  return null;
}

function buildThirdPlaceMap(qualifyingThirdGroups, mapping, thirdCandidates) {
  const byGroup = {};
  for (const row of thirdCandidates.slice(0, 8)) {
    byGroup[row.group] = row.team_id;
  }
  const assigned = {};
  if (!mapping) return assigned;
  for (const [winnerSlot, thirdGroup] of Object.entries(mapping)) {
    if (qualifyingThirdGroups.includes(thirdGroup) && byGroup[thirdGroup] != null) {
      assigned[winnerSlot] = byGroup[thirdGroup];
    }
  }
  return assigned;
}

export function syncR32FromGroups(knockout, bracket, teams, matches) {
  const k = structuredClone(knockout);
  const thirdCandidates = getThirdPlaceCandidates(bracket, teams, matches);
  const qualifyingThirdGroups = thirdCandidates.slice(0, 8).map((row) => row.group);
  const mapping = lookupAnnexCMapping(qualifyingThirdGroups);
  const thirdByWinnerSlot = buildThirdPlaceMap(qualifyingThirdGroups, mapping, thirdCandidates);

  for (const fx of R32_FIXTURES) {
    const match = ensureMatch(k, "round_of_32", fx.index);
    const homeId = teamFromStandings(bracket, teams, matches, fx.home.pos, fx.home.group);
    let awayId = null;
    if (fx.away.pos === 3 && fx.away.thirdSlot) {
      awayId = thirdByWinnerSlot[fx.away.thirdSlot] ?? null;
    } else {
      awayId = teamFromStandings(bracket, teams, matches, fx.away.pos, fx.away.group);
    }
    assignSide(match, "home", homeId);
    assignSide(match, "away", awayId);
  }
  return k;
}

function feedRound(k, roundKey, feed, sourceRound) {
  feed.forEach((pair, i) => {
    const index = i + 1;
    const match = ensureMatch(k, roundKey, index);
    assignSide(match, "home", getWinnerId(k, sourceRound, pair.home));
    assignSide(match, "away", getWinnerId(k, sourceRound, pair.away));
  });
}

/** Official FIFA 2026 bracket tree from group-stage advancers. */
export function syncOfficialKnockout(knockout, bracket, teams, matches) {
  let k = syncR32FromGroups(knockout, bracket, teams, matches);
  feedRound(k, "round_of_16", R16_FEED, "round_of_32");
  feedRound(k, "quarter_final", QF_FEED, "round_of_16");
  feedRound(k, "semi_final", SF_FEED, "quarter_final");
  const final = ensureMatch(k, "final", 1);
  assignSide(final, "home", getWinnerId(k, "semi_final", FINAL_FEED.home));
  assignSide(final, "away", getWinnerId(k, "semi_final", FINAL_FEED.away));
  return k;
}

/** Advance winners through the official tree without overwriting R32 slots. */
export function syncSimpleKnockoutAdvancement(knockout) {
  const k = structuredClone(knockout);
  feedRound(k, "round_of_16", R16_FEED, "round_of_32");
  feedRound(k, "quarter_final", QF_FEED, "round_of_16");
  feedRound(k, "semi_final", SF_FEED, "quarter_final");
  const final = ensureMatch(k, "final", 1);
  assignSide(final, "home", getWinnerId(k, "semi_final", FINAL_FEED.home));
  assignSide(final, "away", getWinnerId(k, "semi_final", FINAL_FEED.away));
  return k;
}

/** Synthetic third-place stats for ranked groups (no match scores). */
const SIMPLE_THIRD_STATS = { points: 3, goal_difference: 0 };

function teamFromSimpleGroupRank(bracket, pos, groupLetter) {
  const picks = bracket.groups?.[groupLetter];
  if (!picks) return null;
  const slot = pos === 1 ? "first" : pos === 2 ? "second" : pos === 3 ? "third" : "fourth";
  return normTeamId(picks[slot]);
}

export function getSimpleThirdPlaceCandidates(bracket) {
  const candidates = [];
  for (let i = 0; i < GROUP_LETTERS.length; i++) {
    const letter = GROUP_LETTERS[i];
    const teamId = teamFromSimpleGroupRank(bracket, 3, letter);
    if (teamId == null) continue;
    candidates.push({
      group: letter,
      team_id: teamId,
      points: SIMPLE_THIRD_STATS.points,
      goal_difference: SIMPLE_THIRD_STATS.goal_difference,
      goals_for: GROUP_LETTERS.length - i,
    });
  }
  return candidates.sort(
    (a, b) =>
      b.points - a.points ||
      b.goal_difference - a.goal_difference ||
      b.goals_for - a.goals_for
  );
}

/** Fill R32 from simple group rankings (1st–4th) + Annex C third-place mapping. */
export function syncSimpleR32FromGroups(knockout, bracket) {
  const k = structuredClone(knockout);
  const thirdCandidates = getSimpleThirdPlaceCandidates(bracket);
  const qualifyingThirdGroups = thirdCandidates.slice(0, 8).map((row) => row.group);
  const mapping = lookupAnnexCMapping(qualifyingThirdGroups);
  const thirdByWinnerSlot = buildThirdPlaceMap(qualifyingThirdGroups, mapping, thirdCandidates);

  for (const fx of R32_FIXTURES) {
    const match = ensureMatch(k, "round_of_32", fx.index);
    const homeId = teamFromSimpleGroupRank(bracket, fx.home.pos, fx.home.group);
    let awayId = null;
    if (fx.away.pos === 3 && fx.away.thirdSlot) {
      awayId = thirdByWinnerSlot[fx.away.thirdSlot] ?? null;
    } else {
      awayId = teamFromSimpleGroupRank(bracket, fx.away.pos, fx.away.group);
    }
    assignSide(match, "home", homeId);
    assignSide(match, "away", awayId);
  }
  return k;
}

/** Simple mode: official FIFA tree from ranked groups + knockout winners. */
export function syncSimpleKnockoutFromGroups(knockout, bracket) {
  let k = syncSimpleR32FromGroups(knockout, bracket);
  feedRound(k, "round_of_16", R16_FEED, "round_of_32");
  feedRound(k, "quarter_final", QF_FEED, "round_of_16");
  feedRound(k, "semi_final", SF_FEED, "quarter_final");
  const final = ensureMatch(k, "final", 1);
  assignSide(final, "home", getWinnerId(k, "semi_final", FINAL_FEED.home));
  assignSide(final, "away", getWinnerId(k, "semi_final", FINAL_FEED.away));
  return k;
}
