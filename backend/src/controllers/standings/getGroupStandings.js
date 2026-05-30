import pool from "../../config/db.js";
import { ok } from "../../utils/apiResponse.js";

const FORM_LENGTH = 5;

function resultForTeam(homeId, awayId, homeScore, awayScore, teamId) {
  if (homeScore == null || awayScore == null) return null;
  const isHome = teamId === homeId;
  const gf = isHome ? homeScore : awayScore;
  const ga = isHome ? awayScore : homeScore;
  if (gf > ga) return "W";
  if (gf < ga) return "L";
  return "D";
}

async function fetchFormByTeamId() {
  const { rows } = await pool.query(
    `SELECT m.home_team_id, m.away_team_id, m.home_score, m.away_score, m.kickoff_at, m.status
     FROM matches m
     WHERE m.stage = 'group' AND m.status = 'completed'
     ORDER BY m.kickoff_at ASC NULLS LAST, m.id ASC`
  );

  const formMap = new Map();
  for (const m of rows) {
    for (const teamId of [m.home_team_id, m.away_team_id]) {
      const code = resultForTeam(
        m.home_team_id,
        m.away_team_id,
        m.home_score,
        m.away_score,
        teamId
      );
      if (!code) continue;
      if (!formMap.has(teamId)) formMap.set(teamId, []);
      const list = formMap.get(teamId);
      list.push(code);
      if (list.length > FORM_LENGTH) list.shift();
    }
  }
  return formMap;
}

function attachForm(rows, formMap) {
  return rows.map((row) => ({
    ...row,
    form: formMap.get(row.team_id) || [],
  }));
}

export async function getGroupStandings(req, res, next) {
  try {
    const group = req.params.group?.toUpperCase();
    const formMap = await fetchFormByTeamId();
    const { rows } = await pool.query(
      `SELECT s.*, t.name AS team_name, t.code AS team_code, t.country_code, t.flag_url
       FROM standings s
       JOIN teams t ON t.id = s.team_id
       WHERE s.group_letter = $1
       ORDER BY s.position NULLS LAST, s.points DESC, s.goal_difference DESC`,
      [group]
    );
    return ok(res, { group, standings: attachForm(rows, formMap) });
  } catch (err) {
    next(err);
  }
}

export async function getAllGroupStandings(_req, res, next) {
  try {
    const formMap = await fetchFormByTeamId();
    const { rows } = await pool.query(
      `SELECT s.*, t.name AS team_name, t.code AS team_code, t.country_code, t.flag_url
       FROM standings s
       JOIN teams t ON t.id = s.team_id
       ORDER BY s.group_letter, s.position NULLS LAST, s.points DESC`
    );
    const byGroup = {};
    for (const row of attachForm(rows, formMap)) {
      if (!byGroup[row.group_letter]) byGroup[row.group_letter] = [];
      byGroup[row.group_letter].push(row);
    }
    return ok(res, { standings: byGroup });
  } catch (err) {
    next(err);
  }
}
