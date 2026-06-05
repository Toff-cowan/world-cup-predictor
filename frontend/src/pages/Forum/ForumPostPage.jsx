import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { forumApi } from "../../api/forumApi.js";
import { predictionsApi } from "../../api/predictionsApi.js";
import { teamsApi } from "../../api/teamsApi.js";
import KnockoutBracketView from "../../components/predictions/KnockoutBracketView.jsx";
import { normalizeBracket } from "../../utils/bracketHelpers.js";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function ForumPostPage() {
  const { id } = useParams();
  const location = useLocation();
  const preview = location.state?.preview;

  const [post, setPost] = useState(preview || null);
  const [shared, setShared] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loadingPost, setLoadingPost] = useState(!preview);
  const [loadingBracket, setLoadingBracket] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoadingPost(!preview);
    forumApi
      .get(id)
      .then((data) => {
        if (!cancelled) setPost(data.post);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingPost(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, preview]);

  useEffect(() => {
    if (!post?.share_token) return;
    let cancelled = false;
    setLoadingBracket(true);

    Promise.all([
      predictionsApi.shared(post.share_token),
      teamsApi.all().catch(() => ({ teams: [] })),
    ])
      .then(([predRes, teamsRes]) => {
        if (cancelled) return;
        setShared(predRes.prediction);
        setTeams(teamsRes.teams || []);
      })
      .catch(() => {
        if (!cancelled) setShared(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingBracket(false);
      });

    return () => {
      cancelled = true;
    };
  }, [post?.share_token]);

  const bracket = shared
    ? normalizeBracket(shared.bracket, { teams, matches: [] })
    : null;

  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100">
      <section className="w-full bg-black text-white py-10 sm:py-12 px-4">
        <div className="max-w-[1400px] mx-auto">
          <Link to="/forum" className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white">
            ← Back to forum
          </Link>
          {post ? (
            <>
              <h1 className="font-display text-2xl sm:text-4xl font-bold uppercase tracking-tight mt-4 m-0">
                {post.title}
              </h1>
              <p className="text-sm text-white/60 mt-2 m-0">
                {post.username && <>by {post.username} · </>}
                {formatDate(post.created_at)}
              </p>
            </>
          ) : loadingPost ? (
            <h1 className="font-display text-2xl sm:text-4xl font-bold uppercase tracking-tight mt-4 m-0">
              Loading post…
            </h1>
          ) : null}
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10 space-y-8">
        {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

        {post && (
          <article className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 lg:p-8">
            <p className="text-base leading-relaxed whitespace-pre-wrap m-0">{post.body}</p>
          </article>
        )}

        {post?.share_token && (
          <section className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold m-0">
                {shared?.name || "Shared bracket"}
              </h2>
              <Link
                to={`/share/${post.share_token}`}
                className="text-xs font-bold uppercase tracking-wide underline underline-offset-4"
              >
                Open full view
              </Link>
            </div>
            <div className="p-4 overflow-x-auto">
              {loadingBracket && (
                <p className="text-zinc-500 text-sm px-2">Loading bracket…</p>
              )}
              {!loadingBracket && bracket && (
                <KnockoutBracketView
                  teams={teams}
                  groups={bracket.groups}
                  knockout={bracket.knockout}
                  bracketName={shared?.name}
                />
              )}
              {!loadingBracket && !bracket && (
                <p className="text-zinc-500 text-sm px-2">Bracket unavailable.</p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
