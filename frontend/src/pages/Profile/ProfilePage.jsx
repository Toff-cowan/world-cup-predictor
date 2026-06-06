import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { predictionsApi } from "../../api/predictionsApi.js";
import { forumApi } from "../../api/forumApi.js";
import { useAuth } from "../../context/AuthContext.jsx";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function initials(username) {
  return (username || "?")
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StatCard({ label, value, hint }) {
  return (
    <div className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-5 py-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 m-0">{label}</p>
      <p className="text-2xl font-bold mt-1 m-0 tabular-nums">{value}</p>
      {hint && <p className="text-xs text-zinc-500 mt-1 m-0">{hint}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      predictionsApi.list(),
      forumApi.list().catch(() => ({ posts: [] })),
    ])
      .then(([preds, forum]) => {
        setPredictions(preds.predictions || []);
        const mine = (forum.posts || []).filter((p) => p.username === user?.username);
        setPosts(mine.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, [user?.username]);

  const lockedCount = useMemo(
    () => predictions.filter((p) => p.is_fully_locked).length,
    [predictions]
  );

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#f3f3f3] dark:bg-[#0a0a0a] text-zinc-500">
        Loading profile…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0a0a0a] text-zinc-900 dark:text-white">
      <section className="w-full bg-black text-white py-10 sm:py-12 lg:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 flex flex-col sm:flex-row sm:items-center gap-6">
          <div
            className="w-20 h-20 shrink-0 flex items-center justify-center text-2xl font-bold bg-white/10 border border-white/20"
            aria-hidden
          >
            {initials(user?.username)}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 m-0">
              Your account
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold uppercase tracking-tight mt-1 m-0 truncate">
              {user?.username || "Profile"}
            </h1>
            <p className="text-sm text-white/70 mt-2 m-0 truncate">{user?.email}</p>
            <p className="text-xs text-white/50 mt-1 m-0">
              Member since {formatDate(user?.created_at)}
            </p>
          </div>
          <Link
            to="/predictions"
            className="sm:ml-auto shrink-0 inline-flex items-center justify-center px-6 py-3 bg-white text-black text-sm font-bold hover:bg-white/90 transition-colors"
          >
            Open predictions
          </Link>
          <button
            type="button"
            onClick={logout}
            className="shrink-0 inline-flex items-center justify-center px-4 py-3 border border-white/30 text-sm font-bold hover:bg-white/10 transition-colors"
          >
            Log out
          </button>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 py-8 sm:py-10 space-y-8 sm:space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Brackets" value={predictions.length} hint="Saved prediction sets" />
          <StatCard label="Locked" value={lockedCount} hint="Fully locked brackets" />
          <StatCard label="Forum posts" value={posts.length} hint="Recent activity" />
        </div>

        <section className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-6 lg:px-8 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold m-0">Your brackets</h2>
            <Link
              to="/predictions"
              className="text-xs font-bold uppercase tracking-wide text-zinc-600 dark:text-white hover:underline underline-offset-4"
            >
              Manage
            </Link>
          </div>

          {predictions.length === 0 ? (
            <div className="px-6 lg:px-8 py-10 text-center">
              <p className="text-zinc-500 m-0">No brackets yet.</p>
              <Link
                to="/predictions"
                className="inline-block mt-4 text-sm font-semibold underline underline-offset-4"
              >
                Create your first bracket
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 m-0 p-0 list-none">
              {predictions.map((p) => (
                <li key={p.id}>
                  <Link
                    to="/predictions"
                    className="flex flex-wrap items-center gap-3 px-6 lg:px-8 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <span className="font-semibold flex-1 min-w-[10rem]">{p.name}</span>
                    <span className="text-xs text-zinc-500">
                      Updated {formatDate(p.updated_at)}
                    </span>
                    {p.is_fully_locked ? (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white">
                        Locked
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                        Editable
                      </span>
                    )}
                    {p.accuracy_score != null && (
                      <span className="text-xs tabular-nums text-zinc-500">
                        Score {p.accuracy_score}%
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-6 lg:px-8 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
            <h2 className="text-lg font-bold m-0">Your forum posts</h2>
            <Link
              to="/forum/new"
              className="text-xs font-bold uppercase tracking-wide text-zinc-600 dark:text-white hover:underline underline-offset-4"
            >
              New post
            </Link>
          </div>

          {posts.length === 0 ? (
            <p className="px-6 lg:px-8 py-8 text-zinc-500 text-sm m-0">
              No forum posts yet.{" "}
              <Link to="/forum/new" className="font-semibold underline">
                Share your first bracket
              </Link>
            </p>
          ) : (
            <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 m-0 p-0 list-none">
              {posts.map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/forum/${p.id}`}
                    state={{ preview: p }}
                    className="block px-6 lg:px-8 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <p className="font-medium m-0">{p.title}</p>
                    {p.username && (
                      <p className="text-xs text-zinc-500 mt-1 m-0">by {p.username}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
