import { useEffect, useMemo, useState } from "react";
import { standingsApi } from "../../api/standingsApi.js";
import GroupStandingsTable from "../../components/standings/GroupStandingsTable.jsx";

const GROUP_ORDER = "ABCDEFGHIJKL".split("");

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("overall");

  useEffect(() => {
    standingsApi
      .all()
      .then((data) => setStandings(data.standings || {}))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const groups = sortGroups(Object.keys(standings));
  const overallRows = useMemo(
    () => buildOverallStandings(standings),
    [standings]
  );

  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100">
      <section className="w-full bg-black text-white py-12 lg:py-16">
        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-center m-0">
          Standings
        </h1>
      </section>

      <div className="w-full max-w-none mx-auto px-6 lg:px-12 xl:px-16 pb-10 pt-8 space-y-6">
        <div className="flex justify-end">
          <div className="flex border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 p-1">
            <button
              type="button"
              onClick={() => setView("overall")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                view === "overall"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Overall
            </button>
            <button
              type="button"
              onClick={() => setView("groups")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                view === "groups"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              By group
            </button>
          </div>
        </div>

        {loading && (
          <p className="text-zinc-500 dark:text-zinc-400 py-12 text-center">Loading standings…</p>
        )}

        {error && (
          <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/50 p-4 text-sm">
            {error}
          </p>
        )}

        {!loading && !error && groups.length === 0 && (
          <p className="text-zinc-500 dark:text-zinc-400 py-12 text-center">
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
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
