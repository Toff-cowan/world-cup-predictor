import * as cheerio from "cheerio";

const url =
  "https://en.wikipedia.org/w/api.php?action=parse&page=2026_FIFA_World_Cup&prop=text&format=json";

const r = await fetch(url, {
  headers: { "User-Agent": "WorldCupPredictor/1.0 (educational project)" },
});
const data = await r.json();
const html = data.parse.text;
const $ = cheerio.load(html);

const teams = new Set();
$("table.wikitable").each((_, table) => {
  const caption = $(table).find("caption").text().toLowerCase();
  const header = $(table).find("tr").first().text().toLowerCase();
  if (!/team|nation|country|qualified|group/.test(caption + header)) return;

  $(table)
    .find("tr")
    .slice(1)
    .each((__, row) => {
      const cells = $(row).find("td, th");
      const link = $(cells[0]).find("a").first();
      const name = link.attr("title") || link.text() || $(cells[0]).text();
      const cleaned = name.replace(/\[[^\]]*\]/g, "").trim();
      if (cleaned.length > 2 && cleaned.length < 50 && !/^\d+$/.test(cleaned)) {
        teams.add(cleaned);
      }
    });
});

console.log("teams found:", teams.size);
console.log([...teams].sort().join("\n"));
