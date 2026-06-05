import pool from "../../config/db.js";
import { ok } from "../../utils/apiResponse.js";

const MATCH_SELECT = `
  SELECT m.*,
    ht.name AS home_team_name, ht.code AS home_team_code, ht.country_code AS home_country_code,
    ht.flag_url AS home_flag_url,
    at.name AS away_team_name, at.code AS away_team_code, at.country_code AS away_country_code,
    at.flag_url AS away_flag_url
  FROM matches m
  LEFT JOIN teams ht ON ht.id = m.home_team_id
  LEFT JOIN teams at ON at.id = m.away_team_id
`;

function mapMatch(row) {
  return {
    id: row.id,
    externalId: row.external_id,
    stage: row.stage,
    groupLetter: row.group_letter,
    kickoffAt: row.kickoff_at,
    homeScore: row.home_score,
    awayScore: row.away_score,
    status: row.status,
    venue: row.venue,
    homeTeamName: row.home_team_name,
    homeTeamCode: row.home_team_code,
    homeCountryCode: row.home_country_code,
    homeFlagUrl: row.home_flag_url,
    awayTeamName: row.away_team_name,
    awayTeamCode: row.away_team_code,
    awayCountryCode: row.away_country_code,
    awayFlagUrl: row.away_flag_url,
  };
}

export async function getAllMatches(_req, res, next) {
  try {
    const { rows } = await pool.query(
      `${MATCH_SELECT} ORDER BY m.kickoff_at NULLS LAST`
    );
    return ok(res, { matches: rows.map(mapMatch) });
  } catch (err) {
    next(err);
  }
}

export async function getUpcomingMatches(_req, res, next) {
  try {
    const { rows } = await pool.query(
      `${MATCH_SELECT}
       WHERE m.status IN ('scheduled', 'live')
       ORDER BY m.kickoff_at ASC
       LIMIT 20`
    );
    return ok(res, { matches: rows.map(mapMatch) });
  } catch (err) {
    next(err);
  }
}
