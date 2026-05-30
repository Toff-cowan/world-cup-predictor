import pool from "../config/db.js";
import {
  fetchSeason,
  fetchAllMatches,
  parseMatch,
  extractTeamsFromMatches,
  buildStandingsFromMatches,
} from "./fifaApiClient.js";

/**
 * Syncs real FIFA World Cup 2026 data via api.fifa.com (same source as fifa.com).
 * No mock/seed data — run after migrate: npm run scrape
 */
export async function syncFifaTournament() {
  const season = await fetchSeason();
  const rawMatches = await fetchAllMatches();
  const parsedMatches = rawMatches.map(parseMatch);

  const teamMap = extractTeamsFromMatches(rawMatches);
  const groupByCode = {};

  for (const m of parsedMatches) {
    if (!m.groupLetter) continue;
    if (m.home?.countryCode) groupByCode[m.home.countryCode] = m.groupLetter;
    if (m.away?.countryCode) groupByCode[m.away.countryCode] = m.groupLetter;
  }

  let teamsUpserted = 0;
  const teamIdByCode = {};

  for (const team of teamMap) {
    const groupLetter = groupByCode[team.countryCode] || null;
    const { rows } = await pool.query(
      `INSERT INTO teams (name, code, group_letter, flag_url, fifa_team_id, country_code)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (country_code) DO UPDATE SET
         name = EXCLUDED.name,
         code = EXCLUDED.code,
         group_letter = COALESCE(EXCLUDED.group_letter, teams.group_letter),
         flag_url = EXCLUDED.flag_url,
         fifa_team_id = EXCLUDED.fifa_team_id
       RETURNING id, country_code`,
      [
        team.name,
        team.code,
        groupLetter,
        team.flagUrl,
        team.fifaTeamId,
        team.countryCode,
      ]
    );
    teamIdByCode[rows[0].country_code] = rows[0].id;
    teamsUpserted++;
  }

  let matchesUpserted = 0;
  for (const m of parsedMatches) {
    const homeId = m.home ? teamIdByCode[m.home.countryCode] : null;
    const awayId = m.away ? teamIdByCode[m.away.countryCode] : null;
    if (!homeId || !awayId) continue;

    await pool.query(
      `INSERT INTO matches (
        external_id, home_team_id, away_team_id, stage, group_letter,
        kickoff_at, home_score, away_score, status, venue
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (external_id) DO UPDATE SET
        home_team_id = EXCLUDED.home_team_id,
        away_team_id = EXCLUDED.away_team_id,
        stage = EXCLUDED.stage,
        group_letter = EXCLUDED.group_letter,
        kickoff_at = EXCLUDED.kickoff_at,
        home_score = EXCLUDED.home_score,
        away_score = EXCLUDED.away_score,
        status = EXCLUDED.status,
        venue = COALESCE(EXCLUDED.venue, matches.venue),
        updated_at = NOW()`,
      [
        m.externalId,
        homeId,
        awayId,
        m.stage,
        m.groupLetter,
        m.kickoffAt,
        m.homeScore,
        m.awayScore,
        m.status,
        m.venue || null,
      ]
    );
    matchesUpserted++;
  }

  const standingRows = buildStandingsFromMatches(parsedMatches, teamIdByCode);

  for (const m of parsedMatches) {
    if (m.stage !== "group" || !m.groupLetter) continue;
    for (const side of [m.home, m.away]) {
      if (!side) continue;
      const teamId = teamIdByCode[side.countryCode];
      if (!teamId) continue;
      const exists = standingRows.find(
        (r) => r.teamId === teamId && r.groupLetter === m.groupLetter
      );
      if (!exists) {
        standingRows.push({
          teamId,
          groupLetter: m.groupLetter,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
          position: 99,
        });
      }
    }
  }

  await pool.query(`DELETE FROM standings`);
  let standingsUpserted = 0;
  for (const row of standingRows) {
    await pool.query(
      `INSERT INTO standings (
        team_id, group_letter, played, won, drawn, lost,
        goals_for, goals_against, goal_difference, points, position
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        row.teamId,
        row.groupLetter,
        row.played,
        row.won,
        row.drawn,
        row.lost,
        row.goalsFor,
        row.goalsAgainst,
        row.goalDifference,
        row.points,
        row.position,
      ]
    );
    standingsUpserted++;
  }

  await pool.query(
    `INSERT INTO scrape_cache (source, payload) VALUES ($1, $2)`,
    [
      "fifa_api",
      JSON.stringify({
        seasonId: season.IdSeason,
        seasonName: season.Name?.[0]?.Description,
        teams: teamsUpserted,
        matches: matchesUpserted,
        standings: standingsUpserted,
        scrapedAt: new Date().toISOString(),
      }),
    ]
  );

  return {
    season: season.Name?.[0]?.Description,
    teams: teamsUpserted,
    matches: matchesUpserted,
    standings: standingsUpserted,
  };
}

/** @deprecated use syncFifaTournament */
export async function scrapeFifaTeams() {
  return syncFifaTournament();
}

/** @deprecated use syncFifaTournament */
export async function scrapeAndBuildStandings() {
  return syncFifaTournament();
}
