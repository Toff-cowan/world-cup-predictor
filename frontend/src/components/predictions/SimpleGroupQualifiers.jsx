import { useMemo } from "react";
import { GROUP_LETTERS } from "../../constants/bracket.js";
import { normTeamId } from "../../utils/bracketHelpers.js";
import TeamFlag from "../standings/TeamFlag.jsx";

const RANK_LABELS = ["1st", "2nd", "3rd", "4th"];
const RANK_SLOTS = ["first", "second", "third", "fourth"];

function teamRank(picks, teamId) {
  const id = normTeamId(teamId);
  for (let i = 0; i < RANK_SLOTS.length; i++) {
    if (normTeamId(picks?.[RANK_SLOTS[i]]) === id) return i + 1;
  }
  return null;
}

function GroupCard({ letter, groupTeams, picks, onRank, disabled }) {
  const rankedCount = RANK_SLOTS.filter((slot) => picks?.[slot]).length;

  function handleTeamClick(teamId) {
    if (disabled) return;
    onRank(letter, teamId);
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 p-3">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-900 dark:text-white m-0">
          Group {letter}
        </h4>
        <span className="text-[10px] font-semibold text-zinc-500 dark:text-white/60">
          {rankedCount}/4
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {groupTeams.map((team) => {
          const rank = teamRank(picks, team.id);
          return (
            <button
              key={team.id}
              type="button"
              disabled={disabled}
              onClick={() => handleTeamClick(team.id)}
              className={`flex items-center gap-2 w-full px-2 py-1.5 border text-left transition-colors disabled:opacity-50 ${
                rank
                  ? "border-zinc-900 dark:border-white bg-zinc-900 dark:bg-zinc-800 text-white"
                  : "border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-500"
              }`}
            >
              <TeamFlag
                flagUrl={team.flag_url}
                countryCode={team.country_code}
                teamCode={team.code}
                className="w-7 h-5 shrink-0"
              />
              <span
                className={`text-xs font-semibold truncate flex-1 ${
                  rank ? "text-white" : "text-zinc-900 dark:text-white"
                }`}
              >
                {team.name}
              </span>
              {rank ? (
                <span className="text-[10px] font-bold uppercase shrink-0 text-emerald-300">
                  {RANK_LABELS[rank - 1]}
                </span>
              ) : (
                <span className="text-[10px] text-zinc-400 dark:text-white/40 shrink-0">—</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function SimpleGroupQualifiers({ teams, groups, onRank, disabled }) {
  const teamsByGroup = useMemo(() => {
    const map = {};
    for (const t of teams) {
      const letter = String(t.group_letter || "").toUpperCase();
      if (!letter) continue;
      if (!map[letter]) map[letter] = [];
      map[letter].push(t);
    }
    for (const letter of Object.keys(map)) {
      map[letter].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    return map;
  }, [teams]);

  const completeGroups = useMemo(() => {
    let count = 0;
    for (const letter of GROUP_LETTERS) {
      const picks = groups?.[letter];
      if (picks?.first && picks?.second && picks?.third && picks?.fourth) {
        count += 1;
      }
    }
    return count;
  }, [groups]);

  return (
    <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white m-0">Group stage</h3>
          <p className="text-xs text-zinc-500 dark:text-white/70 mt-1 mb-0">
            Click teams in order to rank them 1st to 4th. Top 2 plus the best 8 third-place teams
            fill the Round of 32 automatically.
          </p>
        </div>
        <p className="text-xs font-semibold text-zinc-600 dark:text-white/80 m-0 shrink-0">
          {completeGroups} / 12 groups complete
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {GROUP_LETTERS.map((letter) => (
          <GroupCard
            key={letter}
            letter={letter}
            groupTeams={teamsByGroup[letter] || []}
            picks={groups?.[letter]}
            onRank={onRank}
            disabled={disabled}
          />
        ))}
      </div>
    </section>
  );
}
