import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { forumApi } from "../../api/forumApi.js";
import { predictionsApi } from "../../api/predictionsApi.js";
import AuthModal from "../auth/AuthModal.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { copySharedToLocal } from "../../utils/localBrackets.js";

export default function ForumPostActions({
  postId,
  shareToken,
  likes = 0,
  dislikes = 0,
  userVote = 0,
  sharedName,
  onVoteChange,
  compact = false,
  showVotes = true,
  showCopy = true,
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [counts, setCounts] = useState({ likes, dislikes, userVote });
  const [voting, setVoting] = useState(false);
  const [copying, setCopying] = useState(false);
  const [message, setMessage] = useState("");
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    setCounts({ likes, dislikes, userVote });
  }, [likes, dislikes, userVote]);

  async function handleVote(vote, e) {
    e?.preventDefault();
    e?.stopPropagation();
    if (!postId) return;
    if (!isAuthenticated) {
      setAuthOpen(true);
      return;
    }

    setVoting(true);
    setMessage("");
    try {
      const data = await forumApi.vote(postId, vote);
      const next = {
        likes: data.likes,
        dislikes: data.dislikes,
        userVote: data.user_vote,
      };
      setCounts(next);
      onVoteChange?.(next);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setVoting(false);
    }
  }

  async function handleCopy(e) {
    e?.preventDefault();
    e?.stopPropagation();
    if (!shareToken) return;

    setCopying(true);
    setMessage("");
    try {
      if (isAuthenticated) {
        await predictionsApi.copyFromShare(
          shareToken,
          sharedName ? `${sharedName} (copy)` : undefined
        );
      } else {
        const data = await predictionsApi.shared(shareToken);
        copySharedToLocal(data.prediction, `${data.prediction.name} (copy)`);
      }
      navigate("/predictions");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setCopying(false);
    }
  }

  const btnClass = (active, positive) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border transition-colors disabled:opacity-50 ${
      active
        ? positive
          ? "border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300"
        : "border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-white hover:border-zinc-900 dark:hover:border-white"
    }`;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${compact ? "" : "pt-1"}`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      role="presentation"
    >
      {showVotes && postId && (
        <>
          <button
            type="button"
            disabled={voting}
            onClick={(e) => handleVote(1, e)}
            className={btnClass(counts.userVote === 1, true)}
            aria-pressed={counts.userVote === 1}
            title="Like this bracket"
          >
            ▲ {counts.likes}
          </button>
          <button
            type="button"
            disabled={voting}
            onClick={(e) => handleVote(-1, e)}
            className={btnClass(counts.userVote === -1, false)}
            aria-pressed={counts.userVote === -1}
            title="Dislike this bracket"
          >
            ▼ {counts.dislikes}
          </button>
        </>
      )}

      {showCopy && shareToken && (
        <button
          type="button"
          disabled={copying}
          onClick={handleCopy}
          className="inline-flex items-center px-3 py-1.5 text-xs font-bold border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-white hover:border-zinc-900 dark:hover:border-white disabled:opacity-50"
        >
          {copying ? "Copying…" : "Copy to my predictions"}
        </button>
      )}

      {message && <span className="text-xs text-red-500 w-full sm:w-auto">{message}</span>}

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        title="Sign in to vote"
        message="Sign in to like or dislike community brackets."
        onSuccess={() => setAuthOpen(false)}
      />
    </div>
  );
}
