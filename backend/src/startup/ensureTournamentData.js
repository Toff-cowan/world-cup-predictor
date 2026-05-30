import pool from "../config/db.js";
import { syncFifaTournament } from "../scraper/simpleFifaScraper.js";
import { syncFifaNews } from "../scraper/syncFifaNews.js";

/**
 * Optional first-boot seeding (set SCRAPE_IF_EMPTY=true on Render).
 * Runs after the server starts listening; does not block HTTP.
 */
export async function ensureTournamentData() {
  if (process.env.SCRAPE_IF_EMPTY !== "true") return;

  const { rows } = await pool.query(`SELECT COUNT(*)::int AS n FROM teams`);
  if (rows[0]?.n > 0) return;

  console.log("No teams in database — running FIFA scrape (SCRAPE_IF_EMPTY=true)...");
  const result = await syncFifaTournament();
  console.log("Tournament sync:", result);

  const news = await syncFifaNews();
  console.log("News sync:", news);
}
