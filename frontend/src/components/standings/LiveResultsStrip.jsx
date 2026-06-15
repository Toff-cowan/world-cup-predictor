import TeamFlag from "./TeamFlag.jsx";

function kickoffLabel(match) {
  const iso = match.kickoffAt || match.kickoff_at;
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusPill({ status }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden />
        Live
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-white/70">
      Full time
    </span>
  );
}

function ResultCard({ match }) {
  const homeScore = match.homeScore ?? match.home_score ?? 0;
  const awayScore = match.awayScore ?? match.away_score ?? 0;
  const homeWin = homeScore > awayScore;
  const awayWin = awayScore > homeScore;

  return (
    <article className="shrink-0 w-60 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <StatusPill status={match.status} />
        <span className="text-[10px] text-zinc-500 dark:text-white/70 tabular-nums truncate">
          {match.groupLetter ? `Grp ${match.groupLetter}` : match.stage?.replace(/_/g, " ")}
          {" · "}
          {kickoffLabel(match)}
        </span>
      </div>

      <div className="space-y-1">
        <div
          className={`flex items-center gap-2 ${
            homeWin ? "font-bold text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-white/80"
          }`}
        >
          <TeamFlag
            flagUrl={match.homeFlagUrl}
            countryCode={match.homeCountryCode}
            teamCode={match.homeTeamCode}
            className="w-6 h-4 shrink-0"
          />
          <span className="text-xs truncate flex-1">{match.homeTeamName}</span>
          <span className="text-sm tabular-nums">{homeScore}</span>
        </div>
        <div
          className={`flex items-center gap-2 ${
            awayWin ? "font-bold text-zinc-900 dark:text-white" : "text-zinc-600 dark:text-white/80"
          }`}
        >
          <TeamFlag
            flagUrl={match.awayFlagUrl}
            countryCode={match.awayCountryCode}
            teamCode={match.awayTeamCode}
            className="w-6 h-4 shrink-0"
          />
          <span className="text-xs truncate flex-1">{match.awayTeamName}</span>
          <span className="text-sm tabular-nums">{awayScore}</span>
        </div>
      </div>
    </article>
  );
}

export default function LiveResultsStrip({ matches, updatedAt }) {
  if (!matches || matches.length === 0) return null;

  const hasLive = matches.some((m) => m.status === "live");

  return (
    <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-12 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-white m-0 flex items-center gap-2">
          {hasLive && (
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden />
          )}
          {hasLive ? "Live & recent results" : "Recent results"}
        </h3>
        {updatedAt && (
          <span className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-white/50 tabular-nums">
            Updated {updatedAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
          </span>
        )}
      </div>

      <div className="mobile-scroll-x">
        <div className="flex gap-3 px-4 sm:px-6 lg:px-12 py-4 min-w-min">
          {matches.map((match) => (
            <ResultCard key={match.id} match={match} />
          ))}
        </div>
      </div>
    </section>
  );
}
