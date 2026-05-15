const base = "https://gameday-prod.fifa.mangodev.co.uk/1-0";
const paths = [
  "",
  "/teams",
  "/matches",
  "/standings",
  "/competitions",
  "/tournaments",
  "/worldcup",
  "/seasons",
  "/fixtures",
  "/groups",
  "/competition/17",
  "/competition/FWC2026",
];

for (const p of paths) {
  const r = await fetch(base + p, {
    headers: {
      Accept: "application/json",
      Origin: "https://www.fifa.com",
      Referer: "https://www.fifa.com/",
      "User-Agent": "Mozilla/5.0",
    },
  });
  const t = await r.text();
  console.log(p || "/", r.status, t.slice(0, 200));
}
