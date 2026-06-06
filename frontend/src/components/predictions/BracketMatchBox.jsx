import TeamFlag from "../standings/TeamFlag.jsx";
import { TROPHY_IMAGE } from "../../constants/assets.js";
import { teamSeedLabel } from "../../utils/knockoutBracketLayout.js";
import { teamById } from "../../utils/bracketHelpers.js";

function formatScore(value) {
  return value == null ? "–" : String(value);
}

function ScoreLine({ match }) {
  const hs = match.scores?.home;
  const as = match.scores?.away;
  const hasScores = hs != null || as != null;

  if (!hasScores) return null;

  return (
    <div className="bracket-score-line flex items-center justify-center gap-1 shrink-0">
      <span
        className={`text-[10px] font-bold tabular-nums ${
          match.winner === match.home ? "text-teal-800" : "text-zinc-700"
        }`}
      >
        {formatScore(hs)}
      </span>
      <span className="text-[9px] text-zinc-400 font-bold">:</span>
      <span
        className={`text-[10px] font-bold tabular-nums ${
          match.winner === match.away ? "text-teal-800" : "text-zinc-700"
        }`}
      >
        {formatScore(as)}
      </span>
    </div>
  );
}

function TeamRow({
  team,
  seed,
  winner,
  mirrored,
  locked,
  onClick,
}) {
  const interactive = Boolean(onClick) && !locked && team;

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? onClick : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={[
        "bracket-team-row flex items-center gap-1.5 px-2 py-1.5 min-h-[26px]",
        winner ? "bracket-team-row--winner" : "",
        mirrored ? "flex-row-reverse text-right" : "",
        interactive ? "cursor-pointer hover:brightness-[0.98]" : "",
        !team ? "opacity-60" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="text-[9px] text-zinc-500 w-6 shrink-0 tabular-nums font-medium">
        {seed}
      </span>
      {team ? (
        <>
          {!mirrored && (
            <TeamFlag
              flagUrl={team.flag_url}
              countryCode={team.country_code}
              teamCode={team.code}
              className="bracket-flag w-5 h-5 shrink-0 pointer-events-none"
            />
          )}
          <span className="text-[11px] font-bold uppercase tracking-wide truncate text-zinc-900 pointer-events-none">
            {team.name}
          </span>
          {mirrored && (
            <TeamFlag
              flagUrl={team.flag_url}
              countryCode={team.country_code}
              teamCode={team.code}
              className="bracket-flag w-5 h-5 shrink-0 pointer-events-none"
            />
          )}
        </>
      ) : (
        <span className="text-[11px] text-zinc-400 uppercase">TBD</span>
      )}
    </div>
  );
}

export function BracketMatchBox({
  match,
  teams,
  groups,
  mirrored = false,
  showScores = false,
  locked = true,
  onPickHome,
  onPickAway,
}) {
  const homeTeam = teamById(teams, match.home);
  const awayTeam = teamById(teams, match.away);
  const canPick = !locked && match.home && match.away;

  return (
    <div className="bracket-match-box w-[132px] xl:w-[148px] shrink-0 flex flex-col overflow-hidden">
      <TeamRow
        team={homeTeam}
        seed={teamSeedLabel(match.home, groups, teams)}
        winner={match.winner === match.home}
        mirrored={mirrored}
        locked={!canPick}
        onClick={canPick ? onPickHome : undefined}
      />
      {showScores && <ScoreLine match={match} />}
      <TeamRow
        team={awayTeam}
        seed={teamSeedLabel(match.away, groups, teams)}
        winner={match.winner === match.away}
        mirrored={mirrored}
        locked={!canPick}
        onClick={canPick ? onPickAway : undefined}
      />
    </div>
  );
}

export function BracketFlagNode({
  team,
  large = false,
  winner = false,
  onClick,
  locked = false,
}) {
  const size = large ? "w-10 h-10" : "w-7 h-7";
  if (!team) {
    return (
      <div
        className={`${size} rounded-full border border-zinc-200 bg-zinc-50 shrink-0`}
        aria-hidden
      />
    );
  }

  const Tag = onClick && !locked ? "button" : "div";
  return (
    <Tag
      type={Tag === "button" ? "button" : undefined}
      onClick={onClick}
      disabled={locked}
      className={[
        size,
        "shrink-0 rounded-full overflow-hidden border p-0 bg-transparent",
        winner ? "border-teal-500 ring-2 ring-teal-200" : "border-zinc-200",
        onClick && !locked ? "cursor-pointer hover:opacity-90" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <TeamFlag
        flagUrl={team.flag_url}
        countryCode={team.country_code}
        teamCode={team.code}
        className={`${size} bracket-flag`}
      />
    </Tag>
  );
}

export function BracketCenterColumn({ children }) {
  return (
    <div className="bracket-center flex flex-col items-center justify-between shrink-0 self-stretch px-2 py-2 min-w-[100px] xl:min-w-[120px]">
      {children}
    </div>
  );
}

export function BracketWinnerBlock({ champion, large = true }) {
  return (
    <div className="text-center">
      <p className="bracket-round-label m-0 mb-2">Winners</p>
      {champion ? (
        <>
          <div className="flex justify-center mb-2">
            <BracketFlagNode team={champion} large={large} />
          </div>
          <p className="font-display text-lg xl:text-xl font-bold uppercase tracking-tight m-0 text-zinc-900 leading-tight">
            {champion.name}
          </p>
        </>
      ) : (
        <p className="text-xs text-zinc-400 uppercase m-0">TBD</p>
      )}
    </div>
  );
}

export function BracketTrophy() {
  return (
    <div className="bracket-trophy flex items-center justify-center py-3 min-h-[80px]">
      <img
        src={TROPHY_IMAGE}
        alt="FIFA World Cup trophy"
        crossOrigin="anonymous"
        className="bracket-trophy-img w-20 xl:w-28 h-auto max-h-28 object-contain"
      />
    </div>
  );
}
