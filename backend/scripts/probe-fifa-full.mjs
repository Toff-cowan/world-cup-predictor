const headers = {
  Accept: "application/json",
  Origin: "https://www.fifa.com",
  Referer: "https://www.fifa.com/",
  "User-Agent": "Mozilla/5.0",
};

const COMP = "17";
const SEASON = "285023";

async function getAllMatches() {
  const all = [];
  let token = null;
  do {
    let url = `https://api.fifa.com/api/v3/calendar/matches?idCompetition=${COMP}&idSeason=${SEASON}&count=100`;
    if (token) url += `&continuationToken=${encodeURIComponent(token)}`;
    const r = await fetch(url, { headers });
    const j = await r.json();
    all.push(...(j.Results || []));
    token = j.ContinuationToken;
  } while (token);
  return all;
}

const season = await (
  await fetch(`https://api.fifa.com/api/v3/seasons/${SEASON}`, { headers })
).json();
console.log("associations", season.IdMemberAssociation?.length);

const matches = await getAllMatches();
console.log("total matches", matches.length);

const teams = new Map();
for (const m of matches) {
  for (const side of [m.Home, m.Away]) {
    if (!side?.IdCountry) continue;
    teams.set(side.IdCountry, {
      name: side.TeamName?.[0]?.Description,
      code: side.Abbreviation || side.IdCountry,
      fifaTeamId: side.IdTeam,
      flag: side.PictureUrl,
    });
  }
}
console.log("unique teams from matches", teams.size);

const stages = [...new Set(matches.map((m) => m.StageName?.[0]?.Description))];
console.log("stages", stages);

const groups = [...new Set(matches.map((m) => m.GroupName?.[0]?.Description).filter(Boolean))];
console.log("groups", groups.sort());

// try standings variants
const tries = [
  `/api/v3/live/football/standings/${SEASON}`,
  `/api/v3/live/football/${COMP}/${SEASON}/standings`,
  `/api/v3/calendar/${SEASON}/standings`,
  `/api/v3/seasons/${SEASON}/standings`,
  `/api/v3/competitions/${COMP}/seasons/${SEASON}/standings`,
];
for (const p of tries) {
  const r = await fetch(`https://api.fifa.com${p}`, { headers });
  console.log(p, r.status, (await r.text()).slice(0, 150));
}
