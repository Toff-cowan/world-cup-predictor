import dotenv from "dotenv";
import app from "./app.js";
import { ensureTournamentData } from "./startup/ensureTournamentData.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  ensureTournamentData().catch((err) => {
    console.error("Startup scrape failed:", err.message);
  });
});
