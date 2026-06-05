import pool from "../config/db.js";
import { fetchArticleBody, fetchLatestNewsItems } from "./fifaNewsClient.js";

const BODY_FETCH_LIMIT = 15;

export async function syncFifaNews({ itemLimit = 40, fetchBodies = true } = {}) {
  const items = await fetchLatestNewsItems(itemLimit);
  let upserted = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let body = null;

    if (fetchBodies && i < BODY_FETCH_LIMIT) {
      try {
        body = await fetchArticleBody(item.externalId);
      } catch {
        body = item.summary;
      }
    }

    await pool.query(
      `INSERT INTO news_articles (
        external_id, slug, title, summary, body, tag, roofline,
        image_url, source_url, published_at, fetched_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW(),NOW())
      ON CONFLICT (external_id) DO UPDATE SET
        slug = EXCLUDED.slug,
        title = EXCLUDED.title,
        summary = EXCLUDED.summary,
        body = COALESCE(EXCLUDED.body, news_articles.body),
        tag = EXCLUDED.tag,
        roofline = EXCLUDED.roofline,
        image_url = EXCLUDED.image_url,
        source_url = EXCLUDED.source_url,
        published_at = EXCLUDED.published_at,
        updated_at = NOW()`,
      [
        item.externalId,
        item.slug,
        item.title,
        item.summary,
        body,
        item.tag,
        item.roofline,
        item.imageUrl,
        item.sourceUrl,
        item.publishedAt,
      ]
    );
    upserted++;
  }

  return { news: upserted };
}
