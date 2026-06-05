import { useEffect, useState } from "react";
import { forumApi } from "../../api/forumApi.js";
import AuthModal from "../auth/AuthModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { FORUM_LIMITS, validateForumComment } from "../../utils/forumContentFilter.js";

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

export default function ForumComments({ postId, initialComments = [] }) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }
    const contentCheck = validateForumComment(body);
    if (!contentCheck.ok) {
      setError(contentCheck.message);
      return;
    }

    setError("");
    setSubmitting(true);
    try {
      const data = await forumApi.addComment(postId, { body: body.trim() });
      setComments((list) => [...list, data.comment]);
      setBody("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-lg font-bold m-0">
          Feedback
          {comments.length > 0 && (
            <span className="text-sm font-normal text-zinc-500 ml-2">
              ({comments.length})
            </span>
          )}
        </h2>
        <p className="text-sm text-zinc-500 mt-1 m-0">
          Share your thoughts on this post or bracket.
        </p>
      </div>

      <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 m-0 p-0 list-none">
        {comments.length === 0 ? (
          <li className="px-6 py-8 text-sm text-zinc-500">
            No feedback yet. Be the first to comment.
          </li>
        ) : (
          comments.map((comment) => (
            <li key={comment.id} className="px-6 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-sm font-semibold m-0">{comment.username}</p>
                <time className="text-xs text-zinc-500" dateTime={comment.created_at}>
                  {formatDate(comment.created_at)}
                </time>
              </div>
              <p className="text-sm leading-relaxed mt-2 m-0 whitespace-pre-wrap">
                {comment.body}
              </p>
            </li>
          ))
        )}
      </ul>

      <form onSubmit={handleSubmit} className="px-6 py-5 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
        {error && <p className="text-red-600 dark:text-red-400 text-sm m-0 mb-3">{error}</p>}

        {isAuthenticated ? (
          <label className="block">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Comment as {user?.username}
              </span>
              <span className="text-[10px] text-zinc-400 tabular-nums">
                {body.length}/{FORUM_LIMITS.commentMax}
              </span>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Leave your feedback…"
              rows={3}
              maxLength={FORUM_LIMITS.commentMax}
              className="mt-1 w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100 resize-y min-h-[5rem]"
              required
            />
          </label>
        ) : (
          <p className="text-sm text-zinc-600 dark:text-zinc-400 m-0">
            Sign in to leave feedback on this post.
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-3">
          {isAuthenticated ? (
            <button
              type="submit"
              disabled={submitting || !body.trim()}
              className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold disabled:opacity-50"
            >
              {submitting ? "Posting…" : "Post comment"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setAuthOpen(true)}
              className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold"
            >
              Sign in to comment
            </button>
          )}
        </div>
      </form>

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        title="Sign in to comment"
        message="Create a free account or sign in to leave feedback on forum posts."
        onSuccess={() => setAuthOpen(false)}
      />
    </section>
  );
}
