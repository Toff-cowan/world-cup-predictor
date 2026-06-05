import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { forumApi } from "../../api/forumApi.js";
import AuthModal from "../../components/auth/AuthModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ForumPage() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    forumApi
      .list()
      .then((data) => setPosts(data.posts || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100">
      <section className="w-full bg-black text-white py-10 sm:py-12 lg:py-16 px-4">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight m-0">
              Forum
            </h1>
            <p className="text-sm text-white/70 mt-2 m-0 max-w-xl">
              Discuss the tournament and share your bracket predictions with the community.
            </p>
          </div>
          {isAuthenticated ? (
            <Link
              to="/forum/new"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-black text-sm font-bold hover:bg-white/90 shrink-0"
            >
              Share your bracket
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-black text-sm font-bold hover:bg-white/90 shrink-0"
            >
              Sign in to share
            </button>
          )}
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10">
        {loading && <p className="text-zinc-500">Loading forum…</p>}
        {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

        {!loading && !error && posts.length === 0 && (
          <div className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-8 text-center">
            <p className="text-zinc-500 m-0">No posts yet. Be the first to share your bracket!</p>
            {isAuthenticated ? (
              <Link to="/forum/new" className="inline-block mt-4 text-sm font-semibold underline">
                Create a post
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="inline-block mt-4 text-sm font-semibold underline"
              >
                Sign in to post
              </button>
            )}
          </div>
        )}

        {!loading && posts.length > 0 && (
          <ul className="divide-y divide-zinc-200 dark:divide-zinc-700 border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 list-none m-0 p-0">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  to={`/forum/${post.id}`}
                  state={{ preview: post }}
                  className="block px-6 py-5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold m-0 leading-snug">{post.title}</h2>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 m-0 line-clamp-2">
                        {post.body}
                      </p>
                    </div>
                    {post.share_token && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 shrink-0">
                        Bracket shared
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-3 m-0">
                    {post.username && <>by {post.username} · </>}
                    {formatDate(post.created_at)}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => setAuthOpen(false)}
        title="Sign in to share your bracket"
        message="Create a free account to post your predictions to the forum."
      />
    </div>
  );
}
