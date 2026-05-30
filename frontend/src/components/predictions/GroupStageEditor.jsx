import { useMemo, useState } from "react";
import { GROUP_LETTERS } from "../../constants/bracket.js";
import GroupStandingsTable from "../standings/GroupStandingsTable.jsx";
import { isGroupLocked, teamById } from "../../utils/bracketHelpers.js";
import {
  computePredictedStandings,
  getGroupFixtures,
} from "../../utils/groupPredictionHelpers.js";
import MatchPredictionTable from "./MatchPredictionTable.jsx";

export default function GroupStageEditor({
  teams,
  matches,
  bracket,
  onScore,
  onSaveGroup,
  onUnlockGroup,
  savingGroup,
  unlockingGroup = false,
}) {
  const [activeGroup, setActiveGroup] = useState("A");
  const lockedGroups = bracket.locked_groups || [];
  const groupMatches = bracket.group_matches || {};
  const groupLocked = isGroupLocked(bracket, activeGroup);

  const teamsByGroup = useMemo(() => {
    const map = {};
    for (const t of teams) {
      if (!t.group_letter) continue;
      if (!map[t.group_letter]) map[t.group_letter] = [];
      map[t.group_letter].push(t);
    }
    return map;
  }, [teams]);

  const groupTeams = teamsByGroup[activeGroup] || [];
  const fixtures = useMemo(
    () => getGroupFixtures(activeGroup, groupTeams, matches),
    [activeGroup, groupTeams, matches]
  );

  const standings = useMemo(
    () => computePredictedStandings(groupTeams, fixtures, groupMatches),
    [groupTeams, fixtures, groupMatches]
  );

  const tableRows = fixtures.map((fixture, index) => {
    const pred = groupMatches[String(fixture.id)] || {};
    const homeTeam =
      teamById(teams, fixture.home_team_id) ||
      (fixture.home_team_name
        ? {
            name: fixture.home_team_name,
            code: fixture.home_team_code,
            country_code: null,
          }
        : null);
    const awayTeam =
      teamById(teams, fixture.away_team_id) ||
      (fixture.away_team_name
        ? {
            name: fixture.away_team_name,
            code: fixture.away_team_code,
            country_code: null,
          }
        : null);

    return {
      key: fixture.id,
      label: `Group ${activeGroup} match ${index + 1}`,
      homeTeam,
      awayTeam,
      homeScore: pred.home_score,
      awayScore: pred.away_score,
      onHomeScoreChange: (value) => onScore(fixture.id, "home_score", value, activeGroup),
      onAwayScoreChange: (value) => onScore(fixture.id, "away_score", value, activeGroup),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {GROUP_LETTERS.map((letter) => {
          const saved = lockedGroups.includes(letter);
          return (
            <button
              key={letter}
              type="button"
              onClick={() => setActiveGroup(letter)}
              className={`min-w-[2.75rem] px-3 py-2 text-sm font-bold uppercase tracking-wide border transition-colors ${
                activeGroup === letter
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-600 hover:border-zinc-900 dark:hover:border-white"
              }`}
            >
              {saved ? "✓ " : ""}
              {letter}
            </button>
          );
        })}
      </div>

      {groupTeams.length === 0 && (
        <p className="text-zinc-500 dark:text-zinc-400 text-sm py-8 text-center">
          No teams in Group {activeGroup} yet. Run{" "}
          <code className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5">npm run scrape</code> in the
          backend.
        </p>
      )}

      {groupTeams.length > 0 && fixtures.length === 0 && (
        <p className="text-zinc-500 dark:text-zinc-400 text-sm py-8 text-center">
          Not enough teams to build Group {activeGroup} fixtures.
        </p>
      )}

      {fixtures.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 m-0">
              {groupLocked
                ? `Group ${activeGroup} is locked. Unlock to edit scores again.`
                : `Enter scores for Group ${activeGroup}, then save to lock your picks.`}
            </p>
            <div className="flex flex-wrap gap-2 shrink-0">
              {!groupLocked && (
                <button
                  type="button"
                  disabled={savingGroup}
                  onClick={() => onSaveGroup(activeGroup)}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wide bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 disabled:opacity-50"
                >
                  {savingGroup ? "Saving…" : `Save group ${activeGroup}`}
                </button>
              )}
              {groupLocked && onUnlockGroup && (
                <button
                  type="button"
                  disabled={unlockingGroup}
                  onClick={() => onUnlockGroup(activeGroup)}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wide border border-amber-600 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 disabled:opacity-50"
                >
                  {unlockingGroup ? "Unlocking…" : `Unlock group ${activeGroup}`}
                </button>
              )}
            </div>
          </div>

          <MatchPredictionTable
            title={`Group ${activeGroup} — match predictions`}
            rows={tableRows}
            locked={groupLocked}
          />

          <GroupStandingsTable
            title={`Group ${activeGroup} — predicted table`}
            teams={standings}
            showRank
          />
        </>
      )}
    </div>
  );
}
