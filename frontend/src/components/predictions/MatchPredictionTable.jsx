import TeamFlag from "../standings/TeamFlag.jsx";

const GRID_COLS =
  "grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_minmax(0,1fr)]";

function ScoreInput({ value, disabled, onChange, ariaLabel }) {
  return (
    <input
      type="number"
      min={0}
      max={99}
      inputMode="numeric"
      disabled={disabled}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      aria-label={ariaLabel}
      className="w-full text-center text-sm tabular-nums bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 px-1 py-1.5 disabled:opacity-50"
    />
  );
}

function TeamCell({ team, align = "left" }) {
  if (!team) {
    return (
      <span className={`text-sm text-zinc-400 ${align === "right" ? "text-right" : ""}`}>
        TBD
      </span>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 min-w-0 ${
        align === "right" ? "justify-end text-right" : ""
      }`}
    >
      {align === "right" ? (
        <>
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {team.name}
          </span>
          <TeamFlag countryCode={team.country_code} teamCode={team.code || team.team_code} />
        </>
      ) : (
        <>
          <TeamFlag countryCode={team.country_code} teamCode={team.code || team.team_code} />
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {team.name}
          </span>
        </>
      )}
    </div>
  );
}

export default function MatchPredictionTable({
  title,
  rows,
  locked = false,
  footer,
}) {
  return (
    <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 overflow-hidden w-full">
      <div className="px-6 lg:px-10 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 m-0">{title}</h3>
      </div>

      <div
        className={`grid ${GRID_COLS} gap-x-4 lg:gap-x-8 items-center px-6 lg:px-10 py-3 border-b border-zinc-100 dark:border-zinc-800 text-xs font-semibold text-zinc-500 dark:text-zinc-400`}
      >
        <span className="text-[10px] sm:text-xs">Home team</span>
        <span className="text-center text-[10px] sm:text-xs">Home</span>
        <span className="text-center text-[10px] sm:text-xs">Away</span>
        <span className="text-right text-[10px] sm:text-xs">Away team</span>
      </div>

      <ul>
        {rows.map((row) => (
          <li
            key={row.key}
            className={`grid ${GRID_COLS} gap-x-4 lg:gap-x-8 items-center px-6 lg:px-10 py-4 border-b border-zinc-100 dark:border-zinc-800 last:border-0`}
          >
            <div className="min-w-0">
              {row.homePicker ?? <TeamCell team={row.homeTeam} />}
            </div>

            <ScoreInput
              value={row.homeScore}
              disabled={locked || row.scoreDisabled}
              onChange={(v) => row.onHomeScoreChange?.(v)}
              ariaLabel={`${row.label || "Match"} home score`}
            />

            <ScoreInput
              value={row.awayScore}
              disabled={locked || row.scoreDisabled}
              onChange={(v) => row.onAwayScoreChange?.(v)}
              ariaLabel={`${row.label || "Match"} away score`}
            />

            <div className="min-w-0">
              {row.awayPicker ?? <TeamCell team={row.awayTeam} align="right" />}
            </div>

            {row.tieBreaker && (
              <div className="col-span-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 mt-1">
                {row.tieBreaker}
              </div>
            )}
          </li>
        ))}
      </ul>

      {footer}
    </section>
  );
}

export { ScoreInput, TeamCell, GRID_COLS };
