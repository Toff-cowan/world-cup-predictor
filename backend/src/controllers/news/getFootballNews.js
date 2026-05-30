import pool from "../../config/db.js";
import { ok } from "../../utils/apiResponse.js";
import { fetchArticleBody } from "../../scraper/fifaNewsClient.js";
import { syncFifaNews } from "../../scraper/syncFifaNews.js";

function mapRow(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary,
    body: row.body,
    tag: row.tag,
    roofline: row.roofline,
    imageUrl: row.image_url,
    sourceUrl: row.source_url,
    publishedAt: row.published_at,
  };
}

export async function getFootballNews(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 12, 30);
    const { rows } = await pool.query(
      `SELECT id, slug, title, summary, body, tag, roofline, image_url, source_url, published_at
       FROM news_articles
       ORDER BY published_at DESC NULLS LAST, id DESC
       LIMIT $1`,
      [limit]
    );

    if (rows.length === 0) {
      try {
        await syncFifaNews({ itemLimit: limit });
        const retry = await pool.query(
          `SELECT id, slug, title, summary, body, tag, roofline, image_url, source_url, published_at
           FROM news_articles
           ORDER BY published_at DESC NULLS LAST, id DESC
           LIMIT $1`,
          [limit]
        );
        return ok(res, { articles: retry.rows.map(mapRow) });
      } catch {
        return ok(res, { articles: [] });
      }
    }

    return ok(res, { articles: rows.map(mapRow) });
  } catch (err) {
    next(err);
  }
}

export async function getFeaturedNews(_req, res, next) {
  try {
    let { rows } = await pool.query(
      `SELECT id, external_id, slug, title, summary, body, tag, roofline, image_url, source_url, published_at
       FROM news_articles
       ORDER BY published_at DESC NULLS LAST, id DESC
       LIMIT 1`
    );

    if (rows.length === 0) {
      await syncFifaNews({ itemLimit: 8 });
      ({ rows } = await pool.query(
        `SELECT id, external_id, slug, title, summary, body, tag, roofline, image_url, source_url, published_at
         FROM news_articles
         ORDER BY published_at DESC NULLS LAST, id DESC
         LIMIT 1`
      ));
    }

    return ok(res, { article: rows[0] ? mapRow(rows[0]) : null });
  } catch (err) {
    next(err);
  }
}

export async function getNewsArticle(req, res, next) {
  try {
    const slug = req.params.slug;
    const { rows } = await pool.query(
      `SELECT id, external_id, slug, title, summary, body, tag, roofline, image_url, source_url, published_at
       FROM news_articles WHERE slug = $1`,
      [slug]
    );

    let row = rows[0];
    if (!row) {
      return ok(res, { article: null });
    }

    if (!row.body && row.external_id) {
      try {
        const body = await fetchArticleBody(row.external_id);
        await pool.query(
          `UPDATE news_articles SET body = $1, updated_at = NOW() WHERE id = $2`,
          [body, row.id]
        );
        row = { ...row, body };
      } catch {
        /* keep summary only */
      }
    }

    return ok(res, { article: mapRow(row) });
  } catch (err) {
    next(err);
  }
}
