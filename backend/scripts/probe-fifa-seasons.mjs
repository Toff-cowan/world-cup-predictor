const headers = {
  Accept: "application/json",
  Origin: "https://www.fifa.com",
  Referer: "https://www.fifa.com/",
  "User-Agent": "Mozilla/5.0",
};

async function get(path) {
  const r = await fetch(`https://api.fifa.com${path}`, { headers });
  return r.json();
}

const seasons = await get("/api/v3/seasons?idCompetition=17&count=100");
const results = seasons.Results || [];
console.log("season count", results.length);
for (const s of results.slice(-15)) {
  const name = s.SeasonName?.[0]?.Description || s.Name?.[0]?.Description;
  console.log(s.IdSeason, name, s.ActiveSeason);
}

const active = results.find((s) => s.ActiveSeason) || results.find((s) =>
  /2026|2025|canada|mexico|usa/i.test(
    JSON.stringify(s)
  )
);
console.log("\nactive/latest candidate:", active?.IdSeason, active?.SeasonName?.[0]?.Description);

const id2026 = results.find((s) => /2026/.test(s.SeasonName?.[0]?.Description || ""));
if (id2026) {
  const sid = id2026.IdSeason;
  console.log("\n--- 2026 season", sid, "---");
  const matches = await get(
    `/api/v3/calendar/matches?idCompetition=17&idSeason=${sid}&count=3`
  );
  console.log("matches sample", JSON.stringify(matches.Results?.[0], null, 2).slice(0, 1200));

  const standings = await get(`/api/v3/standings/${sid}`);
  console.log("standings", JSON.stringify(standings).slice(0, 500));

  const groups = await get(`/api/v3/groups/${sid}`);
  console.log("groups", JSON.stringify(groups).slice(0, 500));
}
