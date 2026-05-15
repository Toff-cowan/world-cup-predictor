import dotenv from "dotenv";
import pool from "../config/db.js";
import { syncFifaTournament } from "../scraper/simpleFifaScraper.js";

dotenv.config();

async function seed() {
  console.log("Fetching live data from FIFA API (no mock data)...");
  const result = await syncFifaTournament();
  console.log("Sync complete:", result);
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
