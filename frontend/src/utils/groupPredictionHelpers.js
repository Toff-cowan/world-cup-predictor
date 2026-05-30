import { GROUP_LETTERS } from "../constants/bracket.js";
import { buildFormByTeamId } from "./teamForm.js";

function fixtureKey(homeId, awayId) {
  return `gen-${homeId}-${awayId}`;
}

/** Round-robin fixtures when the API has no group matches yet. */
export function generateGroupFixtures(groupLetter, groupTeams) {
  const sorted = [...groupTeams].sort((a, b) => a.name.localeCompare(b.name));
  const fixtures = [];

  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      fixtures.push({
        id: fixtureKey(sorted[i].id, sorted[j].id),
        home_team_id: sorted[i].id,
        away_team_id: sorted[j].id,
        group_letter: groupLetter,
        stage: "group",
        generated: true,
      });
    }
  }

  return fixtures;
}

export function getGroupFixtures(groupLetter, groupTeams, allMatches = []) {
  const apiFixtures = allMatches.filter(
    (m) => m.stage === "group" && m.group_letter === groupLetter
  );

  if (apiFixtures.length > 0) {
    return apiFixtures.sort(
      (a, b) =>
        new Date(a.kickoff_at || 0) - new Date(b.kickoff_at || 0) ||
        a.id - b.id
    );
  }

  if (groupTeams.length >= 2) {
    return generateGroupFixtures(groupLetter, groupTeams);
  }

  return [];
}

export function fixturesByGroup(allMatches, teams) {
  const byGroup = {};
  for (const letter of GROUP_LETTERS) {
    const groupTeams = teams.filter((t) => t.group_letter === letter);
    byGroup[letter] = getGroupFixtures(letter, groupTeams, allMatches);
  }
  return byGroup;
}

function completedFixturesFromPredictions(fixtures, groupMatches, groupTeams) {
  const teamIds = new Set(groupTeams.map((t) => t.id));
  return fixtures
    .filter((f) => {
      const pred = groupMatches[String(f.id)];
      return pred?.home_score != null && pred?.away_score != null;
    })
    .map((f) => {
      const pred = groupMatches[String(f.id)];
      return {
        id: f.id,
        home_team_id: f.home_team_id,
        away_team_id: f.away_team_id,
        home_score: Number(pred.home_score),
        away_score: Number(pred.away_score),
        kickoff_at: f.kickoff_at,
        status: "completed",
      };
    })
    .filter((f) => teamIds.has(f.home_team_id) && teamIds.has(f.away_team_id));
}

export function computePredictedStandings(groupTeams, fixtures, groupMatches) {
  const stats = new Map();

  for (const team of groupTeams) {
    stats.set(team.id, {
      team_id: team.id,
      team_name: team.name,
      team_code: team.code,
      country_code: team.country_code,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
    });
  }

  for (const fixture of fixtures) {
    const pred = groupMatches[String(fixture.id)];
    if (!pred || pred.home_score == null || pred.away_score == null) continue;

    const homeScore = Number(pred.home_score);
    const awayScore = Number(pred.away_score);
    if (Number.isNaN(homeScore) || Number.isNaN(awayScore)) continue;

    const home = stats.get(fixture.home_team_id);
    const away = stats.get(fixture.away_team_id);
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.goals_for += homeScore;
    home.goals_against += awayScore;
    away.goals_for += awayScore;
    away.goals_against += homeScore;

    if (homeScore > awayScore) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
    } else if (homeScore < awayScore) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  const completed = completedFixturesFromPredictions(fixtures, groupMatches, groupTeams);
  const formMap = buildFormByTeamId(completed);

  return [...stats.values()]
    .map((row) => ({
      ...row,
      goal_difference: row.goals_for - row.goals_against,
      form: formMap.get(row.team_id) || [],
    }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goal_difference - a.goal_difference ||
        b.goals_for - a.goals_for ||
        a.team_name.localeCompare(b.team_name)
    )
    .map((row, index) => ({ ...row, position: index + 1 }));
}

export function qualifiersFromStandings(standings) {
  return {
    first: standings[0]?.team_id ?? null,
    second: standings[1]?.team_id ?? null,
  };
}
