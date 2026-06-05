import pool from "../config/db.js";
import { syncFifaNews } from "../scraper/syncFifaNews.js";

const DEFAULT_INTERVAL_MS = 15 * 60 * 1000;
const DEFAULT_STALE_MS = 15 * 60 * 1000;

let intervalId = null;
let syncInFlight = null;
let lastSyncAt = 0;
let lastSyncError = null;

function parseMs(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function getNewsSyncConfig() {
  const enabled = process.env.NEWS_SYNC_ENABLED !== "false";
  const intervalMs = parseMs(process.env.NEWS_SYNC_INTERVAL_MS, DEFAULT_INTERVAL_MS);
  const staleMs = parseMs(process.env.NEWS_STALE_MS, DEFAULT_STALE_MS);
  const itemLimit = parseMs(process.env.NEWS_SYNC_LIMIT, 40);
  const fetchBodies = process.env.NEWS_SYNC_FETCH_BODIES !== "false";
  return { enabled, intervalMs, staleMs, itemLimit, fetchBodies };
}

async function getLatestFetchedAt() {
  const { rows } = await pool.query(
    `SELECT MAX(fetched_at) AS latest FROM news_articles`
  );
  return rows[0]?.latest ? new Date(rows[0].latest).getTime() : 0;
}

export async function runNewsSync(options = {}) {
  if (syncInFlight) return syncInFlight;

  const config = getNewsSyncConfig();
  syncInFlight = syncFifaNews({
    itemLimit: options.itemLimit ?? config.itemLimit,
    fetchBodies: options.fetchBodies ?? config.fetchBodies,
  })
    .then((result) => {
      lastSyncAt = Date.now();
      lastSyncError = null;
      return result;
    })
    .catch((err) => {
      lastSyncError = err.message;
      throw err;
    })
    .finally(() => {
      syncInFlight = null;
    });

  return syncInFlight;
}

/** Fire-and-forget sync when cache is empty or older than staleMs. */
export async function maybeSyncNewsInBackground() {
  const { enabled, staleMs, itemLimit, fetchBodies } = getNewsSyncConfig();
  if (!enabled) return;

  const now = Date.now();
  const latestDb = await getLatestFetchedAt();
  const reference = Math.max(lastSyncAt, latestDb);
  if (reference && now - reference < staleMs) return;

  runNewsSync({ itemLimit, fetchBodies }).catch((err) => {
    console.error("Background news sync failed:", err.message);
  });
}

export function startNewsSyncScheduler() {
  const { enabled, intervalMs, itemLimit, fetchBodies } = getNewsSyncConfig();
  if (!enabled) {
    console.log("News auto-sync disabled (NEWS_SYNC_ENABLED=false)");
    return;
  }

  if (intervalId) clearInterval(intervalId);

  const tick = () => {
    runNewsSync({ itemLimit, fetchBodies })
      .then((result) => {
        console.log(`News sync: ${result.news} article(s) upserted`);
      })
      .catch((err) => {
        console.error("Scheduled news sync failed:", err.message);
      });
  };

  setTimeout(tick, 5000);
  intervalId = setInterval(tick, intervalMs);
  console.log(`News auto-sync every ${Math.round(intervalMs / 60000)} min (limit ${itemLimit})`);
}

export function stopNewsSyncScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function getNewsSyncStatus() {
  return {
    lastSyncAt: lastSyncAt || null,
    lastSyncError,
    inFlight: Boolean(syncInFlight),
  };
}
