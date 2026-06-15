const GROUP_MATCHES_PER_ROUND = 2;

/** Assign group-stage fixtures to matchday 1–3 (two fixtures per group per round). */
export function assignFixtureRound(fixture, groupFixtures) {
  const sorted = [...groupFixtures].sort(
    (a, b) =>
      new Date(a.kickoff_at || a.kickoffAt || 0) - new Date(b.kickoff_at || b.kickoffAt || 0) ||
      (a.id ?? 0) - (b.id ?? 0)
  );
  const idx = sorted.findIndex((f) => f.id === fixture.id);
  if (idx < 0) return null;
  return Math.floor(idx / GROUP_MATCHES_PER_ROUND) + 1;
}

/** Next scheduled or live fixtures, soonest first. */
export function upcomingMatches(allMatches, limit = 12) {
  return allMatches
    .filter((m) => m.status === "scheduled" || m.status === "live" || m.status === "upcoming")
    .sort(
      (a, b) =>
        new Date(a.kickoffAt || a.kickoff_at || 0) - new Date(b.kickoffAt || b.kickoff_at || 0) ||
        (a.id ?? 0) - (b.id ?? 0)
    )
    .slice(0, limit);
}

/** Provisional top two per group from all completed group-stage results so far. */
export function topTwoByGroupSoFar(allMatches) {
  return topTwoByGroupThroughRound(allMatches, 3);
}

function matchTeamId(match, side) {
  return side === "home"
    ? match.homeTeamId ?? match.home_team_id ?? null
    : match.awayTeamId ?? match.away_team_id ?? null;
}

function matchScore(match, side) {
  return side === "home"
    ? match.homeScore ?? match.home_score ?? null
    : match.awayScore ?? match.away_score ?? null;
}

function matchKickoffMs(match) {
  return new Date(match.kickoffAt || match.kickoff_at || 0).getTime();
}

/**
 * Map team_id -> the team's most relevant in-play/recent match for showing live
 * stats inside a standings row. A live match always wins; otherwise the most
 * recently kicked-off completed match is used.
 */
export function liveMatchByTeamId(allMatches = []) {
  const map = new Map();

  const consider = (teamId, side, match) => {
    if (!teamId) return;
    const isLive = match.status === "live";
    const oppSide = side === "home" ? "away" : "home";
    const entry = {
      match,
      status: match.status,
      isLive,
      isHome: side === "home",
      teamScore: matchScore(match, side),
      oppScore: matchScore(match, oppSide),
      opponentName:
        oppSide === "home"
          ? match.homeTeamName ?? match.home_team_name
          : match.awayTeamName ?? match.away_team_name,
      opponentCode:
        oppSide === "home"
          ? match.homeTeamCode ?? match.home_team_code
          : match.awayTeamCode ?? match.away_team_code,
      opponentCountryCode:
        oppSide === "home"
          ? match.homeCountryCode ?? match.home_country_code
          : match.awayCountryCode ?? match.away_country_code,
      opponentFlagUrl:
        oppSide === "home"
          ? match.homeFlagUrl ?? match.home_flag_url
          : match.awayFlagUrl ?? match.away_flag_url,
      kickoffMs: matchKickoffMs(match),
    };

    const existing = map.get(teamId);
    if (!existing) {
      map.set(teamId, entry);
      return;
    }
    // Prefer live over anything; then the more recent kickoff.
    if (entry.isLive && !existing.isLive) {
      map.set(teamId, entry);
    } else if (entry.isLive === existing.isLive && entry.kickoffMs > existing.kickoffMs) {
      map.set(teamId, entry);
    }
  };

  for (const match of allMatches) {
    if (match.status !== "live" && match.status !== "completed") continue;
    consider(matchTeamId(match, "home"), "home", match);
    consider(matchTeamId(match, "away"), "away", match);
  }

  return map;
}

/** Live matches first (soonest kickoff), then most recently completed. */
export function liveAndRecentResults(allMatches = [], limit = 8) {
  const live = allMatches
    .filter((m) => m.status === "live")
    .sort((a, b) => matchKickoffMs(a) - matchKickoffMs(b));

  const completed = allMatches
    .filter((m) => m.status === "completed")
    .sort((a, b) => matchKickoffMs(b) - matchKickoffMs(a));

  return [...live, ...completed].slice(0, limit);
}

export function groupStageFixturesByRound(allMatches) {
  const groupFixtures = allMatches.filter((m) => m.stage === "group" && m.groupLetter);
  const byGroup = new Map();

  for (const m of groupFixtures) {
    const g = m.groupLetter;
    if (!byGroup.has(g)) byGroup.set(g, []);
    byGroup.get(g).push(m);
  }

  const rounds = { 1: [], 2: [], 3: [] };

  for (const fixtures of byGroup.values()) {
    const sorted = [...fixtures].sort(
      (a, b) =>
        new Date(a.kickoffAt || a.kickoff_at || 0) - new Date(b.kickoffAt || b.kickoff_at || 0) ||
        a.id - b.id
    );
    sorted.forEach((fixture, idx) => {
      const round = Math.min(3, Math.floor(idx / GROUP_MATCHES_PER_ROUND) + 1);
      rounds[round].push(fixture);
    });
  }

  for (const n of [1, 2, 3]) {
    rounds[n].sort(
      (a, b) => new Date(a.kickoffAt || a.kickoff_at || 0) - new Date(b.kickoffAt || b.kickoff_at || 0)
    );
  }

  return rounds;
}

function standingRow(teamId, teamMeta, stats) {
  return {
    team_id: teamId,
    team_name: teamMeta.name,
    team_code: teamMeta.code,
    country_code: teamMeta.countryCode,
    flag_url: teamMeta.flagUrl ?? teamMeta.flag_url,
    group_letter: teamMeta.groupLetter,
    ...stats,
    goal_difference: stats.goals_for - stats.goals_against,
  };
}

/** Top two per group after completed matches through `throughRound`. */
export function topTwoByGroupThroughRound(allMatches, throughRound) {
  const groupFixtures = allMatches.filter((m) => m.stage === "group" && m.groupLetter);
  const byGroup = new Map();

  for (const m of groupFixtures) {
    if (!byGroup.has(m.groupLetter)) byGroup.set(m.groupLetter, []);
    byGroup.get(m.groupLetter).push(m);
  }

  const result = {};

  for (const [group, fixtures] of byGroup) {
    const sorted = [...fixtures].sort(
      (a, b) =>
        new Date(a.kickoffAt || a.kickoff_at || 0) - new Date(b.kickoffAt || b.kickoff_at || 0) ||
        a.id - b.id
    );
    const maxIdx = throughRound * GROUP_MATCHES_PER_ROUND;
    const included = sorted.slice(0, maxIdx);

    const teams = new Map();
    const stats = new Map();

    for (const m of included) {
      if (m.status !== "completed" && m.status !== "live") continue;
      const hs = m.homeScore ?? m.home_score;
      const as = m.awayScore ?? m.away_score;
      if (hs == null || as == null) continue;

      const homeId = m.homeTeamId ?? m.home_team_id;
      const awayId = m.awayTeamId ?? m.away_team_id;
      if (!homeId || !awayId) continue;

      teams.set(homeId, {
        name: m.homeTeamName ?? m.home_team_name,
        code: m.homeTeamCode ?? m.home_team_code,
        countryCode: m.homeCountryCode ?? m.home_country_code,
        flagUrl: m.homeFlagUrl ?? m.home_flag_url,
        groupLetter: group,
      });
      teams.set(awayId, {
        name: m.awayTeamName ?? m.away_team_name,
        code: m.awayTeamCode ?? m.away_team_code,
        countryCode: m.awayCountryCode ?? m.away_country_code,
        flagUrl: m.awayFlagUrl ?? m.away_flag_url,
        groupLetter: group,
      });

      for (const [teamId, gf, ga] of [
        [homeId, hs, as],
        [awayId, as, hs],
      ]) {
        if (!stats.has(teamId)) {
          stats.set(teamId, {
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goals_for: 0,
            goals_against: 0,
            points: 0,
          });
        }
        const row = stats.get(teamId);
        row.played += 1;
        row.goals_for += gf;
        row.goals_against += ga;
        if (gf > ga) {
          row.won += 1;
          row.points += 3;
        } else if (gf < ga) {
          row.lost += 1;
        } else {
          row.drawn += 1;
          row.points += 1;
        }
      }
    }

    const table = [...stats.entries()]
      .map(([teamId, s]) => standingRow(teamId, teams.get(teamId), s))
      .sort(
        (a, b) =>
          b.points - a.points ||
          b.goal_difference - a.goal_difference ||
          b.goals_for - a.goals_for ||
          a.team_name.localeCompare(b.team_name)
      )
      .slice(0, 2)
      .map((row, i) => ({ ...row, position: i + 1 }));

    result[group] = table;
  }

  return result;
}
