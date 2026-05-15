import dotenv from "dotenv";
import pool from "../config/db.js";
import { syncFifaTournament } from "./simpleFifaScraper.js";

dotenv.config();

async function main() {
  console.log("Syncing FIFA World Cup 2026 data from api.fifa.com...");
  const result = await syncFifaTournament();
  console.log(result);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
