import { useEffect, useMemo, useState } from "react";
import { matchesApi } from "../../../api/matchesApi.js";
import { isLikelyEmptyDatabase } from "../../../utils/apiError.js";
import TeamFlag from "../../../components/standings/TeamFlag.jsx";
import {
  groupStageFixturesByRound,
  topTwoByGroupThroughRound,
} from "../../../utils/matchRounds.js";

const MATCHES_PER_ROUND = 3;
const POLL_MS = 45_000;
const GROUP_ORDER = "ABCDEFGHIJKL".split("");

function formatKickoff(iso) {
  if (!iso) return "TBD";
  return new Date(iso).toLocaleTimeString(undefined, {
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
      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
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
        <span className="text-xs text-zinc-500 tabular-nums">{formatKickoff(match.kickoffAt)}</span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex flex-col items-center gap-2 min-w-0 text-center">
          <TeamFlag
            countryCode={match.homeCountryCode}
            teamCode={match.homeTeamCode}
            className="w-10 h-7"
          />
          <span className="text-xs sm:text-sm font-semibold truncate w-full">{match.homeTeamName}</span>
        </div>

        <div className="text-center shrink-0 min-w-[3.5rem]">
          {showScore ? (
            <span className="text-xl font-bold tabular-nums tracking-tight">
              {match.homeScore ?? 0}
              <span className="text-zinc-400 mx-1">–</span>
              {match.awayScore ?? 0}
            </span>
          ) : (
            <span className="text-sm font-bold text-zinc-400">vs</span>
          )}
        </div>

        <div className="flex flex-col items-center gap-2 min-w-0 text-center">
          <TeamFlag
            countryCode={match.awayCountryCode}
            teamCode={match.awayTeamCode}
            className="w-10 h-7"
          />
          <span className="text-xs sm:text-sm font-semibold truncate w-full">{match.awayTeamName}</span>
        </div>
      </div>

      <p className="text-[10px] text-zinc-500 m-0 text-center truncate">
        {match.groupLetter ? `Group ${match.groupLetter}` : match.stage?.replace(/_/g, " ")}
        {match.venue ? ` · ${match.venue}` : ""}
      </p>
    </article>
  );
}

function QualifierChip({ team, rank }) {
  return (
    <div className="flex items-center gap-2 min-w-0 px-2 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50">
      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 shrink-0">
        {rank}
      </span>
      <TeamFlag countryCode={team.country_code} teamCode={team.team_code} className="w-6 h-4 shrink-0" />
      <span className="text-xs font-semibold truncate">{team.team_name}</span>
    </div>
  );
}

function RoundQualifiers({ topTwoByGroup, round }) {
  const groups = GROUP_ORDER.filter((g) => topTwoByGroup[g]?.length);

  if (groups.length === 0) {
    return (
      <p className="text-xs text-zinc-500 m-0 mt-4">
        Top two per group appear here once results are in through round {round}.
      </p>
    );
  }

  return (
    <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-700">
      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400 m-0 mb-3">
        Top two after round {round}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {groups.map((group) => (
          <div key={group} className="min-w-0">
            <p className="text-[10px] font-bold text-zinc-500 m-0 mb-1.5">Grp {group}</p>
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

export default function MatchFixturesSection() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeRound, setActiveRound] = useState(1);

  useEffect(() => {
    let cancelled = false;

    function load() {
      matchesApi
        .all()
        .then((data) => {
          if (!cancelled) setMatches(data.matches || []);
        })
        .catch((err) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const rounds = useMemo(() => groupStageFixturesByRound(matches), [matches]);

  const topTwoByGroup = useMemo(
    () => topTwoByGroupThroughRound(matches, activeRound),
    [matches, activeRound]
  );

  const roundMatches = (rounds[activeRound] || []).slice(0, MATCHES_PER_ROUND);

  return (
    <section
      id="fixtures"
      className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 border-t border-zinc-200 dark:border-zinc-800"
    >
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight m-0">Match fixtures</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 m-0">
              Group stage by round · three featured matches · top two qualifiers per group
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {[1, 2, 3].map((round) => (
              <button
                key={round}
                type="button"
                onClick={() => setActiveRound(round)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wide border transition-colors ${
                  activeRound === round
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-600 hover:border-zinc-900 dark:hover:border-white"
                }`}
              >
                Round {round}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <p className="text-zinc-500 dark:text-zinc-400">Loading fixtures…</p>
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
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            No fixtures yet. Sync tournament data with{" "}
            <code className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5">npm run scrape</code>.
          </p>
        )}

        {!loading && !error && matches.length > 0 && (
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-14">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-4 m-0 pb-2 border-b border-zinc-200 dark:border-zinc-700">
                Round {activeRound} — featured matches
              </h3>
              {roundMatches.length === 0 ? (
                <p className="text-sm text-zinc-500">No matches scheduled for this round yet.</p>
              ) : (
                <div className="space-y-4">
                  {roundMatches.map((match) => (
                    <MatchCard key={match.id} match={match} />
                  ))}
                </div>
              )}
            </div>

            <div className="border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 p-5 lg:p-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 m-0">
                Qualification picture
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 m-0 leading-relaxed">
                Provisional top two in each group based on results through round {activeRound}.
                Green rows in standings mark teams on course to advance.
              </p>
              <RoundQualifiers topTwoByGroup={topTwoByGroup} round={activeRound} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
