const paths = [
  "/api/v3/calendar/matches?idCompetition=17&count=50",
  "/api/v3/live/football/17/teams",
  "/api/v3/live/football/worldcup/teams",
  "/api/v3/standings/17",
  "/api/v1/live/football/17/teams",
  "/api/v3/match-calendar/17",
];

for (const p of paths) {
  const r = await fetch("https://api.fifa.com" + p, {
    headers: {
      Accept: "application/json",
      Origin: "https://www.fifa.com",
      Referer: "https://www.fifa.com/",
      "User-Agent": "Mozilla/5.0",
    },
  });
  const t = await r.text();
  console.log(p, r.status, t.slice(0, 200));
}
