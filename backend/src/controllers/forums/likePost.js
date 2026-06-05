import pool from "../../config/db.js";
import { ok, fail } from "../../utils/apiResponse.js";

export async function votePost(req, res, next) {
  const client = await pool.connect();
  try {
    const postId = Number(req.params.id);
    const { vote } = req.body;

    if (![1, -1].includes(vote)) {
      return fail(res, "vote must be 1 (like) or -1 (dislike)");
    }

    const { rows: postRows } = await client.query(
      `SELECT id, user_id FROM forum_posts WHERE id = $1`,
      [postId]
    );
    if (!postRows[0]) return fail(res, "Post not found", 404);
    if (postRows[0].user_id === req.user.id) {
      return fail(res, "Cannot vote on your own post", 400);
    }

    await client.query("BEGIN");

    const { rows: existing } = await client.query(
      `SELECT vote FROM forum_post_votes WHERE post_id = $1 AND user_id = $2`,
      [postId, req.user.id]
    );

    let likesDelta = 0;
    let dislikesDelta = 0;
    let userVote = vote;
    const prev = existing[0]?.vote;

    if (prev === vote) {
      await client.query(
        `DELETE FROM forum_post_votes WHERE post_id = $1 AND user_id = $2`,
        [postId, req.user.id]
      );
      if (vote === 1) likesDelta = -1;
      else dislikesDelta = -1;
      userVote = 0;
    } else if (prev) {
      await client.query(
        `UPDATE forum_post_votes SET vote = $1 WHERE post_id = $2 AND user_id = $3`,
        [vote, postId, req.user.id]
      );
      if (prev === 1) likesDelta -= 1;
      else dislikesDelta -= 1;
      if (vote === 1) likesDelta += 1;
      else dislikesDelta += 1;
    } else {
      await client.query(
        `INSERT INTO forum_post_votes (post_id, user_id, vote) VALUES ($1, $2, $3)`,
        [postId, req.user.id, vote]
      );
      if (vote === 1) likesDelta = 1;
      else dislikesDelta = 1;
    }

    const { rows: updated } = await client.query(
      `UPDATE forum_posts
       SET likes = GREATEST(0, COALESCE(likes, 0) + $1),
           dislikes = GREATEST(0, COALESCE(dislikes, 0) + $2)
       WHERE id = $3
       RETURNING likes, dislikes`,
      [likesDelta, dislikesDelta, postId]
    );

    await client.query("COMMIT");

    return ok(res, {
      likes: updated[0].likes,
      dislikes: updated[0].dislikes,
      user_vote: userVote,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    next(err);
  } finally {
    client.release();
  }
}
