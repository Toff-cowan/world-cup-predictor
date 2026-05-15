import pool from "../../config/db.js";
import { ok } from "../../utils/apiResponse.js";

export async function getGroupStandings(req, res, next) {
  try {
    const group = req.params.group?.toUpperCase();
    const { rows } = await pool.query(
      `SELECT s.*, t.name AS team_name, t.code AS team_code, t.country_code, t.flag_url
       FROM standings s
       JOIN teams t ON t.id = s.team_id
       WHERE s.group_letter = $1
       ORDER BY s.position NULLS LAST, s.points DESC, s.goal_difference DESC`,
      [group]
    );
    return ok(res, { group, standings: rows });
  } catch (err) {
    next(err);
  }
}

export async function getAllGroupStandings(_req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT s.*, t.name AS team_name, t.code AS team_code, t.country_code, t.flag_url
       FROM standings s
       JOIN teams t ON t.id = s.team_id
       ORDER BY s.group_letter, s.position NULLS LAST, s.points DESC`
    );
    const byGroup = {};
    for (const row of rows) {
      if (!byGroup[row.group_letter]) byGroup[row.group_letter] = [];
      byGroup[row.group_letter].push(row);
    }
    return ok(res, { standings: byGroup });
  } catch (err) {
    next(err);
  }
}
