import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { predictionsApi } from "../../api/predictionsApi.js";
import { teamsApi } from "../../api/teamsApi.js";
import KnockoutBracketView from "../../components/predictions/KnockoutBracketView.jsx";
import ForumPostActions from "../../components/forum/ForumPostActions.jsx";
import { normalizeBracket } from "../../utils/bracketHelpers.js";

export default function SharedBracketPage() {
  const { token } = useParams();
  const [shared, setShared] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      predictionsApi.shared(token),
      teamsApi.all().catch(() => ({ teams: [] })),
    ])
      .then(([predRes, teamsRes]) => {
        if (cancelled) return;
        setShared(predRes.prediction);
        setTeams(teamsRes.teams || []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const bracket = shared
    ? normalizeBracket(shared.bracket, { teams, matches: [] })
    : null;

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#f3f3f3] dark:bg-[#0a0a0a] text-zinc-500">
        Loading shared bracket…
      </div>
    );
  }

  if (error || !shared || !bracket) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center bg-[#f3f3f3] dark:bg-[#0a0a0a] px-4">
        <p className="text-red-600 dark:text-red-400">{error || "Shared bracket not found."}</p>
        <Link to="/forum" className="mt-4 text-sm font-semibold underline">
          Browse forum
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0a0a0a] text-zinc-900 dark:text-white">
      <section className="w-full bg-black text-white py-10 sm:py-12 px-4">
        <div className="max-w-[1400px] mx-auto text-center">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 m-0">
            Shared prediction
          </p>
          <h1 className="font-display text-2xl sm:text-4xl font-bold uppercase tracking-tight mt-2 m-0">
            {shared.name}
          </h1>
          {shared.username && (
            <p className="text-sm text-white/70 mt-2 m-0">by {shared.username}</p>
          )}
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-6">
        <ForumPostActions
          shareToken={token}
          sharedName={shared.name}
          showVotes={false}
        />
        {bracket && (
          <KnockoutBracketView
            teams={teams}
            groups={bracket.groups}
            knockout={bracket.knockout}
            bracketName={shared.name}
          />
        )}
      </div>
    </div>
  );
}
