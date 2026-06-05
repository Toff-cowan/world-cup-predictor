import pool from "../../config/db.js";
import { ok, fail } from "../../utils/apiResponse.js";

export async function createForumPost(req, res, next) {
  try {
    const { title, body, share_token: shareToken } = req.body;
    if (!title || !body) return fail(res, "title and body are required");

    if (shareToken) {
      const { rows: owned } = await pool.query(
        `SELECT id FROM predictions WHERE share_token = $1 AND user_id = $2`,
        [shareToken, req.user.id]
      );
      if (!owned[0]) return fail(res, "Invalid bracket share token", 400);
    }

    const { rows } = await pool.query(
      `INSERT INTO forum_posts (user_id, title, body, share_token) VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.user.id, title, body, shareToken || null]
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

    const { rows: comments } = await pool.query(
      `SELECT fc.id, fc.body, fc.created_at, u.username
       FROM forum_comments fc
       JOIN users u ON u.id = fc.user_id
       WHERE fc.post_id = $1
       ORDER BY fc.created_at ASC`,
      [req.params.id]
    );

    return ok(res, { post: rows[0], comments });
  } catch (err) {
    next(err);
  }
}
