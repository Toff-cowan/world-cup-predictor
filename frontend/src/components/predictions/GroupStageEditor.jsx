import { GROUP_LETTERS } from "../../constants/bracket.js";
import TeamPicker from "./TeamPicker.jsx";

export default function GroupStageEditor({ teams, groups, onPick, locked }) {
  const byGroup = {};
  for (const t of teams) {
    const g = t.group_letter;
    if (!g) continue;
    if (!byGroup[g]) byGroup[g] = [];
    byGroup[g].push(t);
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {GROUP_LETTERS.map((letter) => {
        const groupTeams = byGroup[letter] || [];
        const picks = groups[letter] || { first: null, second: null };

        return (
          <div
            key={letter}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-4"
          >
            <h3 className="text-sm font-bold uppercase tracking-wide m-0 mb-3">
              Group {letter}
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 m-0 mb-1">
                  1st place
                </p>
                <TeamPicker
                  teams={groupTeams.length ? groupTeams : teams}
                  value={picks.first}
                  disabled={locked}
                  excludeIds={picks.second ? [picks.second] : []}
                  onChange={(id) => onPick(letter, "first", id)}
                  placeholder="1st"
                />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 m-0 mb-1">
                  2nd place
                </p>
                <TeamPicker
                  teams={groupTeams.length ? groupTeams : teams}
                  value={picks.second}
                  disabled={locked}
                  excludeIds={picks.first ? [picks.first] : []}
                  onChange={(id) => onPick(letter, "second", id)}
                  placeholder="2nd"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
