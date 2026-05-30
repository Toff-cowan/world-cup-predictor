const FIFA_API = "https://api.fifa.com";
const FIFA_COMPETITION_ID = process.env.FIFA_COMPETITION_ID || "17";
const FIFA_SEASON_ID = process.env.FIFA_SEASON_ID || "285023";

const DEFAULT_HEADERS = {
  Accept: "application/json",
  Origin: "https://www.fifa.com",
  Referer: "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

function localeText(arr, fallback = "") {
  return arr?.find((x) => x.Locale?.startsWith("en"))?.Description || arr?.[0]?.Description || fallback;
}

export async function fifaGet(path) {
  const res = await fetch(`${FIFA_API}${path}`, { headers: DEFAULT_HEADERS });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`FIFA API ${path} failed: ${res.status} ${body.slice(0, 200)}`);
  }
  return res.json();
}

export async function fetchSeason() {
  return fifaGet(`/api/v3/seasons/${FIFA_SEASON_ID}`);
}

export async function fetchAllMatches(maxPages = 5) {
  const all = [];
  let token = null;

  for (let page = 0; page < maxPages; page++) {
    let path = `/api/v3/calendar/matches?idCompetition=${FIFA_COMPETITION_ID}&idSeason=${FIFA_SEASON_ID}&count=100`;
    if (token) path += `&continuationToken=${encodeURIComponent(token)}`;

    const data = await fifaGet(path);
    const batch = data.Results || [];
    all.push(...batch);

    const next = data.ContinuationToken;
    if (!next || batch.length === 0 || next === token) break;
    token = next;
  }

  return all;
}

export function parseTeamFromMatchSide(side) {
  if (!side?.IdCountry) return null;
  return {
    fifaTeamId: side.IdTeam,
    name: localeText(side.TeamName, side.ShortClubName),
    code: side.Abbreviation || side.IdCountry,
    countryCode: side.IdCountry,
    flagUrl: side.PictureUrl?.replace("{format}", "sq").replace("{size}", "3"),
  };
}

export function parseMatch(m) {
  const groupName = localeText(m.GroupName);
  const groupLetter = groupName?.replace(/Group\s*/i, "").trim() || null;
  const stage = mapStage(localeText(m.StageName), groupLetter);
  const homeScore = m.Home?.Score ?? m.HomeTeamScore ?? null;
  const awayScore = m.Away?.Score ?? m.AwayTeamScore ?? null;

  return {
    externalId: m.IdMatch,
    fifaStageId: m.IdStage,
    fifaGroupId: m.IdGroup,
    stage,
    groupLetter: groupLetter?.length === 1 ? groupLetter.toUpperCase() : null,
    kickoffAt: m.Date,
    localDate: m.LocalDate,
    status: inferMatchStatus(m, homeScore, awayScore),
    homeScore,
    awayScore,
    home: parseTeamFromMatchSide(m.Home),
    away: parseTeamFromMatchSide(m.Away),
    stageName: localeText(m.StageName),
    groupName,
    venue: localeText(m.Stadium?.Name),
  };
}

function inferMatchStatus(m, homeScore, awayScore) {
  const ms = m.MatchStatus;
  if (ms === 2 || m.LastPeriodUpdate) return "live";
  if (ms >= 3) return "completed";
  if (homeScore != null && awayScore != null) return "completed";
  const kickoff = m.Date ? new Date(m.Date) : null;
  if (kickoff && kickoff <= new Date() && (homeScore != null || awayScore != null)) {
    return "live";
  }
  return "scheduled";
}

function mapStage(stageName, groupLetter) {
  if (groupLetter) return "group";
  const s = (stageName || "").toLowerCase();
  if (s.includes("round of 32") || s.includes("32")) return "round_of_32";
  if (s.includes("round of 16") || s.includes("16")) return "round_of_16";
  if (s.includes("quarter")) return "quarter_final";
  if (s.includes("semi")) return "semi_final";
  if (s.includes("final") && !s.includes("semi") && !s.includes("quarter")) return "final";
  if (s.includes("first stage") || s.includes("group")) return "group";
  return "group";
}

export function extractTeamsFromSeason(season) {
  return (season.IdMemberAssociation || []).map((code) => ({
    code,
    name: code,
    countryCode: code,
  }));
}

export function extractTeamsFromMatches(matches) {
  const map = new Map();
  for (const m of matches) {
    for (const side of [m.Home, m.Away]) {
      const t = parseTeamFromMatchSide(side);
      if (t) map.set(t.countryCode, t);
    }
  }
  return [...map.values()];
}

export function buildStandingsFromMatches(parsedMatches, teamIdByCode) {
  const tables = {};

  for (const m of parsedMatches) {
    if (m.stage !== "group" || m.status !== "completed") continue;
    if (!m.groupLetter || !m.home || !m.away) continue;

    const g = m.groupLetter;
    if (!tables[g]) tables[g] = {};

    for (const [side, goalsFor, goalsAgainst] of [
      [m.home, m.homeScore, m.awayScore],
      [m.away, m.awayScore, m.homeScore],
    ]) {
      const teamId = teamIdByCode[side.countryCode];
      if (!teamId) continue;
      if (!tables[g][teamId]) {
        tables[g][teamId] = {
          teamId,
          groupLetter: g,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        };
      }
      const row = tables[g][teamId];
      row.played++;
      row.goalsFor += goalsFor;
      row.goalsAgainst += goalsAgainst;

      if (goalsFor > goalsAgainst) {
        row.won++;
        row.points += 3;
      } else if (goalsFor === goalsAgainst) {
        row.drawn++;
        row.points += 1;
      } else {
        row.lost++;
      }
      row.goalDifference = row.goalsFor - row.goalsAgainst;
    }
  }

  const result = [];
  for (const g of Object.keys(tables)) {
    const rows = Object.values(tables[g]).sort(
      (a, b) => b.points - a.points || b.goalDifference - a.goalDifference || b.goalsFor - a.goalsFor
    );
    rows.forEach((row, i) => {
      row.position = i + 1;
      result.push(row);
    });
  }
  return result;
}
