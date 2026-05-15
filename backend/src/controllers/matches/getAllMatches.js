import pool from "../../config/db.js";
import { ok } from "../../utils/apiResponse.js";

export async function getAllMatches(_req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT m.*,
        ht.name AS home_team_name, ht.code AS home_team_code,
        at.name AS away_team_name, at.code AS away_team_code
       FROM matches m
       LEFT JOIN teams ht ON ht.id = m.home_team_id
       LEFT JOIN teams at ON at.id = m.away_team_id
       ORDER BY m.kickoff_at NULLS LAST`
    );
    return ok(res, { matches: rows });
  } catch (err) {
    next(err);
  }
}

export async function getUpcomingMatches(_req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT m.*,
        ht.name AS home_team_name, at.name AS away_team_name
       FROM matches m
       LEFT JOIN teams ht ON ht.id = m.home_team_id
       LEFT JOIN teams at ON at.id = m.away_team_id
       WHERE m.status = 'scheduled'
       ORDER BY m.kickoff_at ASC
       LIMIT 20`
    );
    return ok(res, { matches: rows });
  } catch (err) {
    next(err);
  }
}
