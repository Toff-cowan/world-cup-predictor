import { syncFifaTournament } from "../scraper/simpleFifaScraper.js";

// Keep match scores / statuses (and therefore live standings) fresh by
// re-syncing from the FIFA API on an interval while the server runs.
const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;

let intervalId = null;
let syncInFlight = null;
let lastSyncAt = 0;
let lastSyncError = null;

function parseMs(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

export function getTournamentSyncConfig() {
  const enabled = process.env.TOURNAMENT_SYNC_ENABLED !== "false";
  const intervalMs = parseMs(
    process.env.TOURNAMENT_SYNC_INTERVAL_MS,
    DEFAULT_INTERVAL_MS
  );
  return { enabled, intervalMs };
}

export async function runTournamentSync() {
  if (syncInFlight) return syncInFlight;

  syncInFlight = syncFifaTournament()
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

export function startTournamentSyncScheduler() {
  const { enabled, intervalMs } = getTournamentSyncConfig();
  if (!enabled) {
    console.log("Tournament auto-sync disabled (TOURNAMENT_SYNC_ENABLED=false)");
    return;
  }

  if (intervalId) clearInterval(intervalId);

  const tick = () => {
    runTournamentSync()
      .then((result) => {
        console.log(
          `Tournament sync: ${result.matches} match(es), ${result.standings} standing row(s)`
        );
      })
      .catch((err) => {
        console.error("Scheduled tournament sync failed:", err.message);
      });
  };

  // Small delay after boot so it doesn't compete with first-boot seeding.
  setTimeout(tick, 10000);
  intervalId = setInterval(tick, intervalMs);
  console.log(
    `Tournament auto-sync every ${Math.round(intervalMs / 60000)} min`
  );
}

export function stopTournamentSyncScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function getTournamentSyncStatus() {
  return {
    lastSyncAt: lastSyncAt || null,
    lastSyncError,
    inFlight: Boolean(syncInFlight),
  };
}
