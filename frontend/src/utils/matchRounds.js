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
