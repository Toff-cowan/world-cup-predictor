import crypto from "crypto";
import pool from "../../config/db.js";
import { ok, fail } from "../../utils/apiResponse.js";
import { STAGES } from "../../utils/constants.js";

function slugify(name) {
  return `${name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function getPredictions(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, slug, locked_stages, is_fully_locked, accuracy_score, share_token, created_at, updated_at
       FROM predictions WHERE user_id = $1 ORDER BY updated_at DESC`,
      [req.user.id]
    );
    return ok(res, { predictions: rows });
  } catch (err) {
    next(err);
  }
}

export async function getPredictionById(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM predictions WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!rows[0]) return fail(res, "Prediction not found", 404);
    return ok(res, { prediction: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function getSharedPrediction(req, res, next) {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.name, p.bracket, p.locked_stages, p.accuracy_score, p.created_at,
              u.username
       FROM predictions p
       JOIN users u ON u.id = p.user_id
       WHERE p.share_token = $1`,
      [req.params.token]
    );
    if (!rows[0]) return fail(res, "Shared prediction not found", 404);
    return ok(res, { prediction: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function createPrediction(req, res, next) {
  try {
    const { name = "My Bracket", bracket = {} } = req.body;
    const slug = `${slugify(name)}-${Date.now()}`;
    const shareToken = crypto.randomBytes(16).toString("hex");
    const { rows } = await pool.query(
      `INSERT INTO predictions (user_id, name, slug, bracket, share_token)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [req.user.id, name, slug, JSON.stringify(bracket), shareToken]
    );
    return ok(res, { prediction: rows[0] }, 201);
  } catch (err) {
    next(err);
  }
}

export async function updatePrediction(req, res, next) {
  try {
    const { rows: existing } = await pool.query(
      `SELECT * FROM predictions WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    const pred = existing[0];
    if (!pred) return fail(res, "Prediction not found", 404);
    if (pred.is_fully_locked) return fail(res, "Prediction is locked", 403);

    const { name, bracket, stage } = req.body;
    if (stage && pred.locked_stages?.includes(stage)) {
      return fail(res, `Stage "${stage}" is locked`, 403);
    }

    const { rows } = await pool.query(
      `UPDATE predictions
       SET name = COALESCE($1, name),
           bracket = COALESCE($2, bracket),
           updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [name ?? null, bracket ? JSON.stringify(bracket) : null, req.params.id, req.user.id]
    );
    return ok(res, { prediction: rows[0] });
  } catch (err) {
    next(err);
  }
}

export async function deletePrediction(req, res, next) {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM predictions WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    if (!rowCount) return fail(res, "Prediction not found", 404);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

export async function lockPredictionStage(req, res, next) {
  try {
    const { stage } = req.body;
    if (!stage || !STAGES.includes(stage)) {
      return fail(res, `stage must be one of: ${STAGES.join(", ")}`);
    }

    const { rows: existing } = await pool.query(
      `SELECT * FROM predictions WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    const pred = existing[0];
    if (!pred) return fail(res, "Prediction not found", 404);

    const locked = new Set(pred.locked_stages || []);
    locked.add(stage);

    const { rows } = await pool.query(
      `UPDATE predictions
       SET locked_stages = $1,
           is_fully_locked = ($1::text[] @> $2::text[]),
           updated_at = NOW()
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [[...locked], STAGES, req.params.id, req.user.id]
    );
    return ok(res, { prediction: rows[0] });
  } catch (err) {
    next(err);
  }
}
