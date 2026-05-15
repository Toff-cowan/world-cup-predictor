import pool from "../../config/db.js";
import { ok } from "../../utils/apiResponse.js";

export async function getAllTeams(req, res, next) {
  try {
    const { group } = req.query;
    let query = `SELECT * FROM teams`;
    const params = [];
    if (group) {
      query += ` WHERE group_letter = $1`;
      params.push(String(group).toUpperCase());
    }
    query += ` ORDER BY group_letter, name`;
    const { rows } = await pool.query(query, params);
    return ok(res, { teams: rows });
  } catch (err) {
    next(err);
  }
}
