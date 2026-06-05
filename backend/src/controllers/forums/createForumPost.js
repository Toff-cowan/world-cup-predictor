import pool from "../../config/db.js";
import { ok, fail } from "../../utils/apiResponse.js";

async function attachUserVotes(posts, userId) {
  if (!userId || posts.length === 0) {
    return posts.map((p) => ({ ...p, user_vote: p.user_vote ?? 0 }));
  }

  const ids = posts.map((p) => p.id);
  const { rows } = await pool.query(
    `SELECT post_id, vote FROM forum_post_votes WHERE user_id = $1 AND post_id = ANY($2::int[])`,
    [userId, ids]
  );
  const voteMap = Object.fromEntries(rows.map((r) => [r.post_id, r.vote]));
  return posts.map((p) => ({ ...p, user_vote: voteMap[p.id] || 0 }));
}

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

export async function getForumPosts(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT fp.*, u.username,
              COALESCE(fp.likes, 0) AS likes,
              COALESCE(fp.dislikes, 0) AS dislikes,
              (SELECT COUNT(*)::int FROM forum_comments fc WHERE fc.post_id = fp.id) AS comment_count,
              (
                SELECT COALESCE(json_agg(t ORDER BY t.created_at ASC), '[]'::json)
                FROM (
                  SELECT fc.body, fc.created_at, u2.username
                  FROM forum_comments fc
                  JOIN users u2 ON u2.id = fc.user_id
                  WHERE fc.post_id = fp.id
                  ORDER BY fc.created_at DESC
                  LIMIT 3
                ) t
              ) AS recent_comments
       FROM forum_posts fp
       JOIN users u ON u.id = fp.user_id
       ORDER BY fp.created_at DESC
       LIMIT 50`
    );

    const posts = await attachUserVotes(rows, req.user?.id);
    return ok(res, { posts });
  } catch (err) {
    next(err);
  }
}

export async function getSinglePost(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT fp.*, u.username,
              COALESCE(fp.likes, 0) AS likes,
              COALESCE(fp.dislikes, 0) AS dislikes
       FROM forum_posts fp
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

    const [post] = await attachUserVotes([rows[0]], req.user?.id);

    return ok(res, { post, comments });
  } catch (err) {
    next(err);
  }
}
