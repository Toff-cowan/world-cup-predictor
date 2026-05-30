const FORM_LENGTH = 5;

/** W = win, L = loss, D = draw */
export function resultForTeam(homeId, awayId, homeScore, awayScore, teamId) {
  if (homeScore == null || awayScore == null) return null;
  const isHome = teamId === homeId;
  const gf = isHome ? homeScore : awayScore;
  const ga = isHome ? awayScore : homeScore;
  if (gf > ga) return "W";
  if (gf < ga) return "L";
  return "D";
}

/**
 * Build recent form (oldest → newest, max 5) from completed matches.
 * @param {Array} matches — must include home_team_id/away_team_id or homeTeamId/awayTeamId
 */
export function buildFormByTeamId(matches, { teamIdKey = "auto" } = {}) {
  const sorted = [...matches]
    .filter((m) => m.status === "completed" || m.status === "finished")
    .sort((a, b) => new Date(a.kickoff_at || a.kickoffAt || 0) - new Date(b.kickoff_at || b.kickoffAt || 0));

  const formMap = new Map();

  for (const m of sorted) {
    const homeId = m.home_team_id ?? m.homeTeamId;
    const awayId = m.away_team_id ?? m.awayTeamId;
    const homeScore = m.home_score ?? m.homeScore;
    const awayScore = m.away_score ?? m.awayScore;
    if (homeId == null || awayId == null) continue;

    for (const teamId of [homeId, awayId]) {
      const code = resultForTeam(homeId, awayId, homeScore, awayScore, teamId);
      if (!code) continue;
      if (!formMap.has(teamId)) formMap.set(teamId, []);
      const list = formMap.get(teamId);
      list.push(code);
      if (list.length > FORM_LENGTH) list.shift();
    }
  }

  return formMap;
}

export function attachFormToStandings(standingsRows, formMap) {
  return standingsRows.map((row) => ({
    ...row,
    form: formMap.get(row.team_id) || [],
  }));
}

export function padForm(form = []) {
  const padded = [...form];
  while (padded.length < FORM_LENGTH) padded.unshift(null);
  return padded.slice(-FORM_LENGTH);
}

/** Position change after latest result: up / down / same */
export function positionTrend(form) {
  if (!form?.length) return "same";
  const last = form[form.length - 1];
  if (last === "W") return "up";
  if (last === "L") return "down";
  return "same";
}
