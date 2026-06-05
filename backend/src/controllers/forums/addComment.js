import pool from "../../config/db.js";
import { ok, fail } from "../../utils/apiResponse.js";

export async function getPostComments(req, res, next) {
  try {
    const postId = req.params.id;
    const { rows: postRows } = await pool.query(
      `SELECT id FROM forum_posts WHERE id = $1`,
      [postId]
    );
    if (!postRows[0]) return fail(res, "Post not found", 404);

    const { rows } = await pool.query(
      `SELECT fc.id, fc.body, fc.created_at, u.username
       FROM forum_comments fc
       JOIN users u ON u.id = fc.user_id
       WHERE fc.post_id = $1
       ORDER BY fc.created_at ASC`,
      [postId]
    );
    return ok(res, { comments: rows });
  } catch (err) {
    next(err);
  }
}

export async function addComment(req, res, next) {
  try {
    const postId = req.params.id;
    const { body } = req.body;
    if (!body?.trim()) return fail(res, "Comment is required");

    const { rows: postRows } = await pool.query(
      `SELECT id FROM forum_posts WHERE id = $1`,
      [postId]
    );
    if (!postRows[0]) return fail(res, "Post not found", 404);

    const { rows } = await pool.query(
      `INSERT INTO forum_comments (post_id, user_id, body)
       VALUES ($1, $2, $3)
       RETURNING id, post_id, user_id, body, created_at`,
      [postId, req.user.id, body.trim()]
    );

    const { rows: userRows } = await pool.query(
      `SELECT username FROM users WHERE id = $1`,
      [req.user.id]
    );

    return ok(res, { comment: { ...rows[0], username: userRows[0].username } }, 201);
  } catch (err) {
    next(err);
  }
}
