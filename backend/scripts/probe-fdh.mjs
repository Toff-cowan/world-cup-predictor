const base = "https://fdh-api.fifa.com";
const paths = [
  "/v1",
  "/v1/en",
  "/v1/en/teams",
  "/v1/en/competitions",
  "/v1/en/tournaments",
  "/v1/en/calendar",
  "/v1/en/standings",
  "/v1/en/live/standings",
  "/v1/en/seasons",
  "/v1/en/matches",
  "/v1/en/stages",
  "/v1/en/associations",
  "/v1/en/competitions/17",
  "/v1/en/competitions/17/teams",
  "/v1/en/competitions/17/standings",
  "/v1/en/competitions/17/seasons",
  "/v1/en/competitions/WMQ/teams",
  "/v1/en/competitions/FWC/teams",
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
  console.log(p, r.status, t.slice(0, 150).replace(/\s+/g, " "));
}
