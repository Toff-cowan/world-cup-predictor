const headers = {
  Accept: "application/json",
  Origin: "https://www.fifa.com",
  Referer: "https://www.fifa.com/",
  "User-Agent": "Mozilla/5.0",
};

const sid = "285023";

async function get(path) {
  const r = await fetch(`https://api.fifa.com${path}`, { headers });
  const t = await r.text();
  try {
    return { status: r.status, j: JSON.parse(t) };
  } catch {
    return { status: r.status, raw: t.slice(0, 300) };
  }
}

const season = await get(`/api/v3/seasons/${sid}`);
console.log("season", JSON.stringify(season.j, null, 2).slice(0, 600));

const matches = await get(
  `/api/v3/calendar/matches?idCompetition=17&idSeason=${sid}&count=5`
);
console.log("\nmatches count", matches.j?.Results?.length);
console.log(JSON.stringify(matches.j?.Results?.[0], null, 2).slice(0, 1500));

const paths = [
  `/api/v3/standings/${sid}`,
  `/api/v3/standings?idSeason=${sid}`,
  `/api/v3/standings?idCompetition=17&idSeason=${sid}`,
  `/api/v3/groups/${sid}`,
  `/api/v3/groups?idSeason=${sid}`,
  `/api/v3/teams?idSeason=${sid}`,
  `/api/v3/live/football/17/${sid}/teams`,
  `/api/v3/calendar/teams?idCompetition=17&idSeason=${sid}`,
];

for (const p of paths) {
  const res = await get(p);
  console.log("\n", p, res.status, JSON.stringify(res.j || res.raw).slice(0, 250));
}
