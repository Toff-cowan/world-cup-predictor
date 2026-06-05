import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { forumApi } from "../../api/forumApi.js";
import AuthModal from "../../components/auth/AuthModal.jsx";
import ForumPageHeader from "../../components/forum/ForumPageHeader.jsx";
import ForumPostCard from "../../components/forum/ForumPostCard.jsx";
import { randomFifaHeaderTheme } from "../../constants/fifaColors.js";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ForumPage() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const pageTheme = useMemo(() => randomFifaHeaderTheme(), []);

  useEffect(() => {
    forumApi
      .list()
      .then((data) => setPosts(data.posts || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function updatePostVotes(postId, voteData) {
    setPosts((list) =>
      list.map((p) =>
        p.id === postId
          ? { ...p, likes: voteData.likes, dislikes: voteData.dislikes, user_vote: voteData.userVote }
          : p
      )
    );
  }

  const newPostAction = isAuthenticated ? (
    <Link
      to="/forum/new"
      className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold shrink-0"
      style={{ backgroundColor: pageTheme.badge, color: pageTheme.badgeText }}
    >
      New post
    </Link>
  ) : (
    <button
      type="button"
      onClick={() => setAuthOpen(true)}
      className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold shrink-0"
      style={{ backgroundColor: pageTheme.badge, color: pageTheme.badgeText }}
    >
      Sign in to share
    </button>
  );

  const useCardGrid = posts.length > 1;

  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100">
      <ForumPageHeader
        theme={pageTheme}
        title="Forum"
        subtitle="Ask questions, share brackets, vote on picks, and copy them into your predictions."
        action={newPostAction}
      />

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
          <div
            className={
              useCardGrid
                ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                : "max-w-3xl mx-auto"
            }
          >
            {posts.map((post) => (
              <ForumPostCard
                key={post.id}
                post={post}
                compact={useCardGrid}
                onVoteChange={(data) => updatePostVotes(post.id, data)}
              />
            ))}
          </div>
        )}
      </div>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        onSuccess={() => setAuthOpen(false)}
        title="Sign in to post"
        message="Create a free account to ask questions or share brackets on the forum."
      />
    </div>
  );
}
