import { readFile, readdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pool from "../config/db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function migrate() {
  const dir = join(__dirname, "migrations");
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

  for (const file of files) {
    const sql = await readFile(join(dir, file), "utf8");
    await pool.query(sql);
    console.log(`Applied ${file}`);
  }

  console.log("All migrations complete.");
  await pool.end();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
