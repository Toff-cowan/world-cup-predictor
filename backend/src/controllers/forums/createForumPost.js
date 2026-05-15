import pool from "../../config/db.js";
import { ok, fail } from "../../utils/apiResponse.js";

export async function createForumPost(req, res, next) {
  try {
    const { title, body } = req.body;
    if (!title || !body) return fail(res, "title and body are required");
    const { rows } = await pool.query(
      `INSERT INTO forum_posts (user_id, title, body) VALUES ($1, $2, $3) RETURNING *`,
      [req.user.id, title, body]
    );
    return ok(res, { post: rows[0] }, 201);
  } catch (err) {
    next(err);
  }
}

export async function getForumPosts(_req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT fp.*, u.username
       FROM forum_posts fp
       JOIN users u ON u.id = fp.user_id
       ORDER BY fp.created_at DESC
       LIMIT 50`
    );
    return ok(res, { posts: rows });
  } catch (err) {
    next(err);
  }
}

export async function getSinglePost(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT fp.*, u.username FROM forum_posts fp
       JOIN users u ON u.id = fp.user_id WHERE fp.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return fail(res, "Post not found", 404);
    return ok(res, { post: rows[0] });
  } catch (err) {
    next(err);
  }
}
