import TeamFlag from "./TeamFlag.jsx";
import FormIndicators from "./FormIndicators.jsx";
import { nationalTeamSearchUrl } from "../../utils/teamSearchUrl.js";
import { positionTrend } from "../../utils/teamForm.js";

const STAT_COLS = [
  { key: "played", label: "P" },
  { key: "won", label: "W" },
  { key: "drawn", label: "D" },
  { key: "lost", label: "L" },
  { key: "goals_for", label: "GF" },
  { key: "goals_against", label: "GA" },
  { key: "goal_difference", label: "GD" },
  { key: "points", label: "Pts" },
];

export default function GroupStandingsTable({
  title = "Standings",
  teams,
  showGroupColumn = false,
  showRank = true,
  linkTeamSearch = false,
  highlightQualifiers = !showGroupColumn,
}) {
  const sorted = [...teams].sort(
    (a, b) =>
      (a.position ?? 99) - (b.position ?? 99) ||
      b.points - a.points ||
      b.goal_difference - a.goal_difference
  );

  const gridCols = showGroupColumn
    ? "grid-cols-[minmax(20rem,4fr)_4rem_repeat(8,minmax(3.5rem,1.25fr))_9rem]"
    : "grid-cols-[minmax(20rem,4fr)_repeat(8,minmax(3.5rem,1.25fr))_9rem]";

  return (
    <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 overflow-hidden w-full">
      <div
        className={`grid ${gridCols} gap-x-6 lg:gap-x-8 items-center px-8 lg:px-12 py-3.5 border-b border-zinc-100 dark:border-zinc-800 text-xs font-semibold text-zinc-500 dark:text-zinc-400`}
      >
        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{title}</span>
        {showGroupColumn && <span className="text-center">Grp</span>}
        {STAT_COLS.map((col) => (
          <span key={col.key} className="text-center tabular-nums">
            {col.label}
          </span>
        ))}
        <span className="text-right">Form</span>
      </div>

      {highlightQualifiers && sorted.length > 0 && (
        <p className="px-8 lg:px-12 py-2 text-[10px] uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40 m-0">
          Top two advance
        </p>
      )}

      <ul>
        {sorted.map((row, index) => {
          const rank = row.position ?? index + 1;
          const isQualifier = highlightQualifiers && rank <= 2;
          const trend = positionTrend(row.form);

          return (
            <li
              key={row.id || row.team_id}
              className={`grid ${gridCols} gap-x-6 lg:gap-x-8 items-center px-8 lg:px-12 py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors ${
                isQualifier
                  ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-l-4 border-l-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  : "hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {showRank && (
                  <span
                    className={`w-5 text-sm font-medium tabular-nums shrink-0 flex items-center gap-0.5 ${
                      isQualifier ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-zinc-400"
                    }`}
                  >
                    {rank}
                    {isQualifier && (
                      <span className="text-[9px] uppercase tracking-wide text-emerald-600 dark:text-emerald-400" title="Qualifying position">
                        Q
                      </span>
                    )}
                  </span>
                )}
                <TeamFlag countryCode={row.country_code} teamCode={row.team_code} />
                {linkTeamSearch && row.team_name ? (
                  <a
                    href={nationalTeamSearchUrl(row.team_name)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate hover:underline underline-offset-2"
                    title={`Search ${row.team_name} on Google`}
                  >
                    {row.team_name}
                  </a>
                ) : (
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                    {row.team_name}
                  </span>
                )}
              </div>

              {showGroupColumn && (
                <span className="text-center text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {row.group_letter}
                </span>
              )}

              {STAT_COLS.map((col) => (
                <span
                  key={col.key}
                  className="text-center text-sm tabular-nums text-zinc-700 dark:text-zinc-300"
                >
                  {row[col.key] ?? 0}
                </span>
              ))}

              <FormIndicators form={row.form} showTrend trend={trend} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
