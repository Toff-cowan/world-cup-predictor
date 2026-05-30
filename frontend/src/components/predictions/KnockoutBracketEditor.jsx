import { KNOCKOUT_ROUNDS, matchKey } from "../../constants/bracket.js";
import { teamById } from "../../utils/bracketHelpers.js";
import TeamFlag from "../standings/TeamFlag.jsx";
import TeamPicker from "./TeamPicker.jsx";

function MatchCard({
  roundKey,
  matchIndex,
  match,
  teams,
  locked,
  autoFilled,
  onSide,
  onWinner,
}) {
  const homeTeam = teamById(teams, match.home);
  const awayTeam = teamById(teams, match.away);
  const canPickSides = roundKey === "round_of_32" && !locked;
  const canPickWinner = !locked && match.home && match.away;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 p-3 min-w-[200px]">
      <p className="text-[10px] uppercase tracking-widest text-zinc-500 m-0 mb-2">
        {matchKey(matchIndex)}
        {autoFilled ? " · auto" : ""}
      </p>

      {canPickSides ? (
        <>
          <TeamPicker
            teams={teams}
            value={match.home}
            disabled={locked}
            onChange={(id) => onSide(roundKey, matchIndex, "home", id)}
            placeholder="Home"
            className="mb-2"
          />
          <TeamPicker
            teams={teams}
            value={match.away}
            disabled={locked}
            onChange={(id) => onSide(roundKey, matchIndex, "away", id)}
            placeholder="Away"
            className="mb-2"
          />
        </>
      ) : (
        <div className="space-y-1 mb-2 text-sm">
          <div className="flex items-center gap-2 min-h-[28px]">
            {homeTeam ? (
              <>
                <TeamFlag countryCode={homeTeam.country_code} teamCode={homeTeam.code} />
                <span className="truncate">{homeTeam.name}</span>
              </>
            ) : (
              <span className="text-zinc-400">TBD</span>
            )}
          </div>
          <div className="flex items-center gap-2 min-h-[28px]">
            {awayTeam ? (
              <>
                <TeamFlag countryCode={awayTeam.country_code} teamCode={awayTeam.code} />
                <span className="truncate">{awayTeam.name}</span>
              </>
            ) : (
              <span className="text-zinc-400">TBD</span>
            )}
          </div>
        </div>
      )}

      {canPickWinner && (
        <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            disabled={locked}
            onClick={() => onWinner(roundKey, matchIndex, match.home)}
            className={`flex-1 text-xs py-1.5 border transition-colors ${
              match.winner === match.home
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-900 dark:hover:border-white"
            }`}
          >
            Home
          </button>
          <button
            type="button"
            disabled={locked}
            onClick={() => onWinner(roundKey, matchIndex, match.away)}
            className={`flex-1 text-xs py-1.5 border transition-colors ${
              match.winner === match.away
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-900 dark:hover:border-white"
            }`}
          >
            Away
          </button>
        </div>
      )}
    </div>
  );
}

export default function KnockoutBracketEditor({
  teams,
  knockout,
  isStageLocked,
  onSide,
  onWinner,
}) {
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-6 min-w-max">
        {KNOCKOUT_ROUNDS.map((round) => (
          <div key={round.key} className="flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 m-0 sticky top-0 bg-[#f3f3f3] dark:bg-[#0a0a0a] py-1">
              {round.label}
            </h3>
            <div className="flex flex-col gap-3 justify-around flex-1">
              {Array.from({ length: round.count }, (_, i) => {
                const idx = i + 1;
                const match = knockout[round.key]?.[matchKey(idx)] || {
                  home: null,
                  away: null,
                  winner: null,
                };
                const locked = isStageLocked(round.key);
                return (
                  <MatchCard
                    key={`${round.key}-${idx}`}
                    roundKey={round.key}
                    matchIndex={idx}
                    match={match}
                    teams={teams}
                    locked={locked}
                    autoFilled={round.key !== "round_of_32"}
                    onSide={onSide}
                    onWinner={onWinner}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
