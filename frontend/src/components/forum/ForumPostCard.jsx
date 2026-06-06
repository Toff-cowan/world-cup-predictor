import { Link } from "react-router-dom";
import { fifaHeaderThemeForId } from "../../constants/fifaColors.js";
import ForumCommentPreview from "./ForumCommentPreview.jsx";
import ForumPostActions from "./ForumPostActions.jsx";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ForumPostCard({ post, onVoteChange, compact = false }) {
  const theme = fifaHeaderThemeForId(post.id);
  const isBracket = Boolean(post.share_token);

  return (
    <article className="interactive-card border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm flex flex-col h-full">
      <Link
        to={`/forum/${post.id}`}
        state={{ preview: post }}
        className="flex flex-col flex-1 min-h-0 hover:opacity-[0.98] transition-opacity"
      >
        <div
          className="px-4 py-4 sm:px-5 sm:py-5"
          style={{ backgroundColor: theme.bg, color: theme.text }}
        >
          <span
            className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 mb-2"
            style={{ backgroundColor: theme.badge, color: theme.badgeText }}
          >
            {isBracket ? "Bracket" : "Question"}
          </span>
          <h2 className={`font-bold m-0 leading-snug ${compact ? "text-base" : "text-lg"}`}>
            {post.title}
          </h2>
          <p className="text-xs mt-2 m-0 opacity-80">
            {post.username && <>by {post.username} · </>}
            {formatDate(post.created_at)}
          </p>
        </div>

        <div className="px-4 sm:px-5 py-4 flex-1">
          <p className="text-sm text-zinc-600 dark:text-white m-0 line-clamp-3">{post.body}</p>
          <ForumCommentPreview
            comments={post.recent_comments}
            commentCount={post.comment_count}
          />
        </div>
      </Link>

      <div className="px-4 sm:px-5 pb-4 border-t border-zinc-100 dark:border-zinc-800 pt-3 mt-auto">
        <ForumPostActions
          postId={post.id}
          shareToken={post.share_token}
          likes={post.likes}
          dislikes={post.dislikes}
          userVote={post.user_vote}
          sharedName={post.title}
          compact
          onVoteChange={onVoteChange}
        />
      </div>
    </article>
  );
}
