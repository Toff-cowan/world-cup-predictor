import pool from "../../config/db.js";
import { ok } from "../../utils/apiResponse.js";

// Mirror fifa.com/.../standings: points/stats settle at full-time. Live,
// in-play scores are surfaced separately (per-team badge + results strip),
// and the table refreshes as soon as a match is marked completed.
const STATUSES_THAT_COUNT = ["completed"];

function emptyRow(team) {
  return {
    team_id: team.id,
    team_name: team.name,
    team_code: team.code,
    country_code: team.country_code,
    flag_url: team.flag_url,
    group_letter: team.group_letter,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goals_for: 0,
    goals_against: 0,
    goal_difference: 0,
    points: 0,
  };
}

function applyMatch(row, gf, ga) {
  row.played += 1;
  row.goals_for += gf;
  row.goals_against += ga;
  row.goal_difference = row.goals_for - row.goals_against;
  if (gf > ga) {
    row.won += 1;
    row.points += 3;
  } else if (gf < ga) {
    row.lost += 1;
  } else {
    row.drawn += 1;
    row.points += 1;
  }
}

function sortRows(rows) {
  return [...rows].sort(
    (a, b) =>
      b.points - a.points ||
      b.goal_difference - a.goal_difference ||
      b.goals_for - a.goals_for ||
      a.team_name.localeCompare(b.team_name)
  );
}

/** Build live group standings from the teams + matches tables. */
async function computeLiveStandings() {
  const [{ rows: teams }, { rows: matches }] = await Promise.all([
    pool.query(
      `SELECT id, name, code, country_code, flag_url, group_letter
       FROM teams
       WHERE group_letter IS NOT NULL`
    ),
    pool.query(
      `SELECT home_team_id, away_team_id, home_score, away_score, status, group_letter
       FROM matches
       WHERE stage = 'group'`
    ),
  ]);

  const rowsByTeam = new Map();
  const byGroup = {};

  for (const team of teams) {
    const row = emptyRow(team);
    rowsByTeam.set(team.id, row);
    if (!byGroup[team.group_letter]) byGroup[team.group_letter] = [];
    byGroup[team.group_letter].push(row);
  }

  for (const m of matches) {
    if (!STATUSES_THAT_COUNT.includes(m.status)) continue;
    if (m.home_score == null || m.away_score == null) continue;
    const home = rowsByTeam.get(m.home_team_id);
    const away = rowsByTeam.get(m.away_team_id);
    if (!home || !away) continue;
    applyMatch(home, m.home_score, m.away_score);
    applyMatch(away, m.away_score, m.home_score);
  }

  for (const group of Object.keys(byGroup)) {
    byGroup[group] = sortRows(byGroup[group]).map((row, i) => ({
      ...row,
      position: i + 1,
    }));
  }

  return byGroup;
}

export async function getGroupStandings(req, res, next) {
  try {
    const group = req.params.group?.toUpperCase();
    const byGroup = await computeLiveStandings();
    return ok(res, { group, standings: byGroup[group] || [] });
  } catch (err) {
    next(err);
  }
}

export async function getAllGroupStandings(_req, res, next) {
  try {
    const byGroup = await computeLiveStandings();
    return ok(res, { standings: byGroup });
  } catch (err) {
    next(err);
  }
}
