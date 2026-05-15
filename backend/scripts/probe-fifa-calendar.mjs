const headers = {
  Accept: "application/json",
  Origin: "https://www.fifa.com",
  Referer: "https://www.fifa.com/",
  "User-Agent": "Mozilla/5.0",
};

async function get(path) {
  const r = await fetch(`https://api.fifa.com${path}`, { headers });
  const j = await r.json();
  return { status: r.status, j };
}

const matches = await get("/api/v3/calendar/matches?idCompetition=17&count=5");
console.log("match keys", Object.keys(matches.j));
const first = matches.j.Results?.[0] || matches.j.results?.[0];
console.log("first match sample", JSON.stringify(first, null, 2).slice(0, 1500));

const comps = await get("/api/v3/competitions");
console.log("comps status", comps.status, JSON.stringify(comps.j).slice(0, 500));

const comp17 = await get("/api/v3/competitions/17");
console.log("comp17", JSON.stringify(comp17.j, null, 2).slice(0, 800));

const teams = await get("/api/v3/teams?idCompetition=17");
console.log("teams", teams.status, JSON.stringify(teams.j).slice(0, 500));

const standings = await get("/api/v3/standings/17");
console.log("standings", standings.status, JSON.stringify(standings.j).slice(0, 500));
