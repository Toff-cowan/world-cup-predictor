import { useEffect, useState } from "react";
import { standingsApi } from "../../../api/standingsApi.js";
import GroupStandingsTable from "../../../components/standings/GroupStandingsTable.jsx";
import HomeButton from "../../../components/common/HomeButton.jsx";

const GROUP_ORDER = "ABCDEFGHIJKL".split("");

function sortGroups(keys) {
  return [...keys].sort(
    (a, b) => GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b)
  );
}

export default function StandingsPreview() {
  const [standings, setStandings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    standingsApi
      .all()
      .then((data) => setStandings(data.standings || {}))
      .catch(() => setStandings({}))
      .finally(() => setLoading(false));
  }, []);

  const groups = sortGroups(Object.keys(standings));

  return (
    <section className="text-zinc-900 dark:text-white bg-[#f3f3f3] dark:bg-[#0a0a0a]">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight m-0">
            Group standings
          </h2>
          <HomeButton as="link" to="/standings" variant="link" className="shrink-0">
            View all standings
          </HomeButton>
        </div>

        {loading && (
          <p className="text-sm text-zinc-500">Loading standings…</p>
        )}

        {!loading && groups.length === 0 && (
          <p className="text-sm text-zinc-500">
            Standings will appear here once tournament data is synced.
          </p>
        )}

        {!loading && groups.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {groups.map((letter) => (
              <div key={letter} className="overflow-x-auto min-w-0">
                <GroupStandingsTable
                  title={`Group ${letter}`}
                  teams={standings[letter]}
                  showRank
                  highlightQualifiers
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
