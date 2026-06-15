import { useEffect, useMemo, useState } from "react";
import { standingsApi } from "../../api/standingsApi.js";
import { matchesApi } from "../../api/matchesApi.js";
import GroupStandingsTable from "../../components/standings/GroupStandingsTable.jsx";
import LiveResultsStrip from "../../components/standings/LiveResultsStrip.jsx";
import { liveAndRecentResults, liveMatchByTeamId } from "../../utils/matchRounds.js";

const GROUP_ORDER = "ABCDEFGHIJKL".split("");
const POLL_MS = 30_000;

function sortGroups(keys) {
  return [...keys].sort(
    (a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b)
  );
}

function buildOverallStandings(standingsByGroup) {
  const all = [];
  for (const [group, teams] of Object.entries(standingsByGroup)) {
    for (const team of teams) {
      all.push({ ...team, group_letter: group });
    }
  }
  return all.sort(
    (a, b) =>
      b.points - a.points ||
      b.goal_difference - a.goal_difference ||
      b.goals_for - a.goals_for ||
      a.team_name.localeCompare(b.team_name)
  );
}

export default function StandingsPage() {
  const [standings, setStandings] = useState({});
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("overall");
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    let cancelled = false;

    function load(isInitial = false) {
      Promise.all([
        standingsApi.all(),
        matchesApi.all().catch(() => ({ matches: [] })),
      ])
        .then(([standingsRes, matchesRes]) => {
          if (cancelled) return;
          setStandings(standingsRes.standings || {});
          setMatches(matchesRes.matches || []);
          setUpdatedAt(new Date());
          setError("");
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

  const groups = sortGroups(Object.keys(standings));
  const overallRows = useMemo(
    () => buildOverallStandings(standings),
    [standings]
  );

  const liveByTeamId = useMemo(() => liveMatchByTeamId(matches), [matches]);
  const recentResults = useMemo(() => liveAndRecentResults(matches, 12), [matches]);
  const hasLive = useMemo(
    () => matches.some((m) => m.status === "live"),
    [matches]
  );

  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0a0a0a] text-zinc-900 dark:text-white">
      <section className="w-full bg-black text-white py-10 sm:py-12 lg:py-16 px-4">
        <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-center m-0">
          Standings
        </h1>
        {hasLive && (
          <p className="mt-3 text-center m-0">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" aria-hidden />
              Live matches in play · table updates automatically
            </span>
          </p>
        )}
      </section>

      <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 pb-10 pt-6 sm:pt-8 space-y-6">
        {!loading && !error && recentResults.length > 0 && (
          <LiveResultsStrip matches={recentResults} updatedAt={updatedAt} />
        )}

        <div className="flex justify-stretch sm:justify-end">
          <div className="flex w-full sm:w-auto border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 p-1">
            <button
              type="button"
              onClick={() => setView("overall")}
              className={`flex-1 sm:flex-none min-h-[2.75rem] px-4 py-2 text-sm font-medium transition-colors ${
                view === "overall"
                  ? "bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white"
                  : "text-zinc-600 dark:text-white hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Overall
            </button>
            <button
              type="button"
              onClick={() => setView("groups")}
              className={`flex-1 sm:flex-none min-h-[2.75rem] px-4 py-2 text-sm font-medium transition-colors ${
                view === "groups"
                  ? "bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white"
                  : "text-zinc-600 dark:text-white hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              By group
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-zinc-500 dark:text-white py-12 text-center">Loading standings…</p>
        )}

        {error && (
          <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 p-4 text-sm">
            {error}
          </p>
        )}

        {!loading && !error && groups.length === 0 && (
          <p className="text-zinc-500 dark:text-white py-12 text-center">
            No standings yet. Run{" "}
            <code className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 text-sm">
              npm run scrape
            </code>{" "}
            in the backend.
          </p>
        )}

        {!loading && !error && groups.length > 0 && view === "overall" && (
          <GroupStandingsTable
            title="Overall standings"
            teams={overallRows.map((row, i) => ({ ...row, position: i + 1 }))}
            showGroupColumn
            linkTeamSearch
            highlightQualifiers={false}
            liveByTeamId={liveByTeamId}
          />
        )}

        {!loading && !error && groups.length > 0 && view === "groups" && (
          <div className="space-y-6 pb-12">
            {groups.map((group) => (
              <GroupStandingsTable
                key={group}
                title={`Group ${group}`}
                teams={standings[group]}
                showRank
                linkTeamSearch
                highlightQualifiers
                liveByTeamId={liveByTeamId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
