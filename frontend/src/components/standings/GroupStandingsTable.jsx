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

function LiveMatchTag({ live, compact = false }) {
  if (!live) return null;

  const scoreline =
    live.teamScore != null && live.oppScore != null
      ? `${live.teamScore}–${live.oppScore}`
      : null;

  if (live.isLive) {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] font-bold tabular-nums text-red-600 dark:text-red-400"
        title={`Live vs ${live.opponentName || "opponent"}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" aria-hidden />
        {compact ? "LIVE" : `LIVE ${scoreline ?? ""}`.trim()}
      </span>
    );
  }

  if (compact || scoreline == null) return null;

  return (
    <span
      className="text-[10px] font-medium text-zinc-400 dark:text-white/50 tabular-nums"
      title={`Last result vs ${live.opponentName || "opponent"}`}
    >
      FT {scoreline}
    </span>
  );
}

function MobileStandingCard({
  row,
  rank,
  isQualifier,
  showRank,
  linkTeamSearch,
  trend,
  live,
}) {
  return (
    <li
      className={`px-4 py-3.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0 ${
        isQualifier
          ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-l-4 border-l-emerald-500"
          : ""
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {showRank && (
          <span
            className={`w-6 text-sm font-bold tabular-nums shrink-0 ${
              isQualifier ? "text-emerald-700 dark:text-white" : "text-zinc-400 dark:text-white"
            }`}
          >
            {rank}
            {isQualifier && (
              <span className="block text-[8px] font-bold text-emerald-600 dark:text-white">
                Q
              </span>
            )}
          </span>
        )}
        <TeamFlag
          flagUrl={row.flag_url}
          countryCode={row.country_code}
          teamCode={row.team_code}
          className="w-9 h-6"
        />
        <div className="min-w-0 flex-1">
          {linkTeamSearch && row.team_name ? (
            <a
              href={nationalTeamSearchUrl(row.team_name)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-zinc-900 dark:text-white truncate block"
            >
              {row.team_name}
            </a>
          ) : (
            <span className="text-sm font-semibold text-zinc-900 dark:text-white truncate block">
              {row.team_name}
            </span>
          )}
          <div className="flex items-center gap-2">
            {row.group_letter && (
              <span className="text-[10px] text-zinc-500 dark:text-white/70 uppercase">Group {row.group_letter}</span>
            )}
            <LiveMatchTag live={live} />
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-lg font-bold tabular-nums text-zinc-900 dark:text-white">{row.points ?? 0}</span>
          <span className="text-[9px] uppercase tracking-wide text-zinc-400 dark:text-white/50">Pts</span>
        </div>
      </div>

      <div className="mt-2.5 grid grid-cols-4 gap-1 text-center">
        {STAT_COLS.slice(0, -1).map((col) => (
          <div key={col.key} className="bg-zinc-50 dark:bg-zinc-800/50 py-1 rounded-sm">
            <span className="block text-[9px] text-zinc-500 dark:text-white/70 uppercase">{col.label}</span>
            <span className="block text-xs font-semibold tabular-nums text-zinc-900 dark:text-white">{row[col.key] ?? 0}</span>
          </div>
        ))}
      </div>

      <div className="mt-2 flex justify-end">
        <FormIndicators form={row.form} showTrend trend={trend} />
      </div>
    </li>
  );
}

export default function GroupStandingsTable({
  title = "Standings",
  teams,
  showGroupColumn = false,
  showRank = true,
  linkTeamSearch = false,
  highlightQualifiers = !showGroupColumn,
  liveByTeamId = null,
}) {
  const getLive = (row) =>
    liveByTeamId && row.team_id != null ? liveByTeamId.get(row.team_id) : null;
  const sorted = [...teams].sort(
    (a, b) =>
      (a.position ?? 99) - (b.position ?? 99) ||
      b.points - a.points ||
      b.goal_difference - a.goal_difference
  );

  const gridCols = showGroupColumn
    ? "grid-cols-[minmax(12rem,4fr)_3rem_repeat(8,minmax(2.25rem,1fr))_7rem]"
    : "grid-cols-[minmax(12rem,4fr)_repeat(8,minmax(2.25rem,1fr))_7rem]";

  return (
    <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 overflow-hidden w-full">
      <div className="px-4 sm:px-6 lg:px-12 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white m-0">{title}</h3>
      </div>

      {highlightQualifiers && sorted.length > 0 && (
        <p className="px-4 sm:px-6 lg:px-12 py-2 text-[10px] uppercase tracking-widest text-emerald-700 dark:text-white bg-emerald-50/80 dark:bg-emerald-950/30 border-b border-emerald-100 dark:border-emerald-900/40 m-0">
          Top two advance
        </p>
      )}

      {/* Mobile — card layout */}
      <ul className="md:hidden list-none m-0 p-0">
        {sorted.map((row, index) => {
          const rank = row.position ?? index + 1;
          const isQualifier = highlightQualifiers && rank <= 2;
          return (
            <MobileStandingCard
              key={row.id || row.team_id}
              row={row}
              rank={rank}
              isQualifier={isQualifier}
              showRank={showRank}
              linkTeamSearch={linkTeamSearch}
              trend={positionTrend(row.form)}
              live={getLive(row)}
            />
          );
        })}
      </ul>

      {/* Desktop — table */}
      <div className="hidden md:block mobile-scroll-x">
        <p className="mobile-scroll-hint px-4 sm:px-6 lg:px-12 pt-2">Swipe for more stats →</p>
        <div className="min-w-[720px]">
          <div
            className={`grid ${gridCols} gap-x-3 lg:gap-x-8 items-center px-4 sm:px-6 lg:px-12 py-3 border-b border-zinc-100 dark:border-zinc-800 text-xs font-semibold text-zinc-500 dark:text-white/70`}
          >
            <span className="text-sm font-bold text-zinc-900 dark:text-white">Team</span>
            {showGroupColumn && <span className="text-center">Grp</span>}
            {STAT_COLS.map((col) => (
              <span key={col.key} className="text-center tabular-nums">
                {col.label}
              </span>
            ))}
            <span className="text-right">Form</span>
          </div>

          <ul className="list-none m-0 p-0">
            {sorted.map((row, index) => {
              const rank = row.position ?? index + 1;
              const isQualifier = highlightQualifiers && rank <= 2;
              const trend = positionTrend(row.form);
              const live = getLive(row);

              return (
                <li
                  key={row.id || row.team_id}
                  className={`grid ${gridCols} gap-x-3 lg:gap-x-8 items-center px-4 sm:px-6 lg:px-12 py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0 transition-colors ${
                    isQualifier
                      ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-l-4 border-l-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      : "hover:bg-zinc-50/80 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {showRank && (
                      <span
                        className={`w-5 text-sm font-medium tabular-nums shrink-0 flex items-center gap-0.5 ${
                          isQualifier
                            ? "text-emerald-700 dark:text-white font-bold"
                            : "text-zinc-400 dark:text-white"
                        }`}
                      >
                        {rank}
                        {isQualifier && (
                          <span
                            className="text-[9px] uppercase tracking-wide text-emerald-600 dark:text-white"
                            title="Qualifying position"
                          >
                            Q
                          </span>
                        )}
                      </span>
                    )}
                    <TeamFlag
                      flagUrl={row.flag_url}
                      countryCode={row.country_code}
                      teamCode={row.team_code}
                    />
                    {linkTeamSearch && row.team_name ? (
                      <a
                        href={nationalTeamSearchUrl(row.team_name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-zinc-900 dark:text-white truncate hover:underline underline-offset-2"
                      >
                        {row.team_name}
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                        {row.team_name}
                      </span>
                    )}
                    <LiveMatchTag live={live} />
                  </div>

                  {showGroupColumn && (
                    <span className="text-center text-sm font-medium text-zinc-600 dark:text-white/80">
                      {row.group_letter}
                    </span>
                  )}

                  {STAT_COLS.map((col) => (
                    <span
                      key={col.key}
                      className="text-center text-sm tabular-nums text-zinc-700 dark:text-white"
                    >
                      {row[col.key] ?? 0}
                    </span>
                  ))}

                  <FormIndicators form={row.form} showTrend trend={trend} />
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
