import { useEffect, useMemo, useState } from "react";
import { matchesApi } from "../../../api/matchesApi.js";
import HomeButton from "../../../components/common/HomeButton.jsx";
import { isLikelyEmptyDatabase } from "../../../utils/apiError.js";
import TeamFlag from "../../../components/standings/TeamFlag.jsx";
import { topTwoByGroupSoFar, upcomingMatches } from "../../../utils/matchRounds.js";

const UPCOMING_LIMIT = 12;
const POLL_MS = 30_000;
const GROUP_ORDER = "ABCDEFGHIJKL".split("");

function formatKickoff(iso) {
  if (!iso) return "TBD";
  return new Date(iso).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function StatusBadge({ status }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden />
        Live
      </span>
    );
  }
  if (status === "completed") {
    return (
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-white">
        Full time
      </span>
    );
  }
  return (
    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
      Upcoming
    </span>
  );
}

function MatchCard({ match }) {
  const showScore =
    match.status === "live" ||
    match.status === "completed" ||
    match.homeScore != null ||
    match.awayScore != null;

  return (
    <article className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <StatusBadge status={match.status} />
        <span className="text-xs text-zinc-500 dark:text-white tabular-nums">
          {formatKickoff(match.kickoffAt)}
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-2 min-w-0 text-center">
          <TeamFlag
            flagUrl={match.homeFlagUrl}
            countryCode={match.homeCountryCode}
            teamCode={match.homeTeamCode}
            className="w-10 h-7"
          />
          <span className="text-xs sm:text-sm font-semibold truncate w-full text-zinc-900 dark:text-white">
            {match.homeTeamName}
          </span>
        </div>

        <div className="text-center shrink-0 min-w-[3.5rem]">
          {showScore ? (
            <span className="text-xl font-bold tabular-nums tracking-tight text-zinc-900 dark:text-white">
              {match.homeScore ?? 0}
              <span className="text-zinc-400 mx-1">–</span>
              {match.awayScore ?? 0}
            </span>
          ) : (
            <span className="text-sm font-bold text-zinc-400 dark:text-white/70">vs</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 min-w-0 text-center">
          <TeamFlag
            flagUrl={match.awayFlagUrl}
            countryCode={match.awayCountryCode}
            teamCode={match.awayTeamCode}
            className="w-10 h-7"
          />
          <span className="text-xs sm:text-sm font-semibold truncate w-full text-zinc-900 dark:text-white">
            {match.awayTeamName}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-zinc-500 dark:text-white/70 m-0 text-center truncate">
        {match.groupLetter ? `Group ${match.groupLetter}` : match.stage?.replace(/_/g, " ")}
        {match.venue ? ` · ${match.venue}` : ""}
      </p>
    </article>
  );
}

function QualifierChip({ team, rank }) {
  return (
    <div className="flex items-center gap-2 min-w-0 px-2 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
      <span className="text-[10px] font-bold text-emerald-700 dark:text-white shrink-0">
        {rank}
      </span>
      <TeamFlag
        flagUrl={team.flag_url}
        countryCode={team.country_code}
        teamCode={team.team_code}
        className="w-6 h-4 shrink-0"
      />
      <span className="text-xs font-semibold truncate text-zinc-900 dark:text-white">{team.team_name}</span>
    </div>
  );
}

function RoundQualifiers({ topTwoByGroup }) {
  const groups = GROUP_ORDER.filter((g) => topTwoByGroup[g]?.length);

  if (groups.length === 0) {
    return (
      <p className="text-xs text-zinc-500 dark:text-white m-0 mt-4">
        Top two per group appear here once group-stage results are in.
      </p>
    );
  }

  return (
    <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-700">
      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-white m-0 mb-3">
        Top two so far
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {groups.map((group) => (
          <div key={group} className="min-w-0">
            <p className="text-[10px] font-bold text-zinc-500 dark:text-white m-0 mb-1.5">Grp {group}</p>
            <div className="space-y-1.5">
              {(topTwoByGroup[group] || []).map((team) => (
                <QualifierChip key={team.team_id} team={team} rank={team.position} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MatchFixturesSection({ embedded = false }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    function load(isInitial = false) {
      matchesApi
        .all()
        .then((data) => {
          if (!cancelled) {
            setMatches(data.matches || []);
            setError("");
          }
        })
        .catch((err) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled && isInitial) setLoading(false);
        });
    }

    function onVisible() {
      if (document.visibilityState === "visible") load(false);
    }

    load(true);
    const id = setInterval(() => load(false), POLL_MS);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  const nextMatches = useMemo(
    () => upcomingMatches(matches, UPCOMING_LIMIT),
    [matches]
  );

  const topTwoByGroup = useMemo(() => topTwoByGroupSoFar(matches), [matches]);

  return (
    <section
      id={embedded ? undefined : "fixtures"}
      className={`bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white ${
        embedded ? "" : "border-t border-zinc-200 dark:border-zinc-800"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
        {!embedded && (
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight m-0">Match fixtures</h2>
              <p className="text-sm text-zinc-500 dark:text-white mt-2 m-0">
                Upcoming fixtures · provisional top two per group from results so far
              </p>
            </div>
            <HomeButton as="link" to="/fixtures" variant="link">
              Full fixtures page →
            </HomeButton>
          </div>
        )}

        {loading && (
          <p className="text-zinc-500 dark:text-white">Loading fixtures…</p>
        )}

        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm">
            {error}
            {isLikelyEmptyDatabase({ message: error }) && (
              <>
                {" "}
                Run{" "}
                <code className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5">npm run scrape</code>{" "}
                in the backend (or seed production via{" "}
                <code className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5">
                  POST /api/scraper/run
                </code>
                ).
              </>
            )}
          </p>
        )}

        {!loading && !error && matches.length === 0 && (
          <p className="text-zinc-500 dark:text-white text-sm">
            No fixtures yet. Sync tournament data with{" "}
            <code className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5">npm run scrape</code>.
          </p>
        )}

        {!loading && !error && matches.length > 0 && (
          <div className="space-y-10">
            <div>
              <div className="mb-4 pb-2 border-b border-zinc-200 dark:border-zinc-700">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-white m-0">
                  Upcoming matches
                </h3>
              </div>
              {nextMatches.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-white">
                  No upcoming matches right now. Check back after the next kickoff window.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {nextMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              )}
            </div>

            <div className="border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 p-5 lg:p-6 text-zinc-900 dark:text-white">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-white m-0">
                Qualification picture
              </h3>
              <p className="text-xs text-zinc-500 dark:text-white mt-2 m-0 leading-relaxed">
                Provisional top two in each group based on results so far. Green rows in standings
                mark teams on course to advance.
              </p>
              <RoundQualifiers topTwoByGroup={topTwoByGroup} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
