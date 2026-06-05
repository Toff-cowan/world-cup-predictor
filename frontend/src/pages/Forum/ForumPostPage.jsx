import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { forumApi } from "../../api/forumApi.js";
import { predictionsApi } from "../../api/predictionsApi.js";
import { teamsApi } from "../../api/teamsApi.js";
import KnockoutBracketView from "../../components/predictions/KnockoutBracketView.jsx";
import ForumComments from "../../components/forum/ForumComments.jsx";
import ForumPageHeader from "../../components/forum/ForumPageHeader.jsx";
import ForumPostActions from "../../components/forum/ForumPostActions.jsx";
import { fifaHeaderThemeForId } from "../../constants/fifaColors.js";
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
  const [comments, setComments] = useState([]);
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
        if (!cancelled) {
          setPost(data.post);
          setComments(data.comments || []);
        }
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
  const headerTheme = post ? fifaHeaderThemeForId(post.id) : { bg: "#000000", text: "#ffffff", badge: "#ffd100", badgeText: "#000000" };

  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100">
      <ForumPageHeader
        theme={headerTheme}
        backTo="/forum"
        title={post?.title || (loadingPost ? "Loading post…" : "Forum post")}
        badge={post ? (post.share_token ? "Bracket post" : "Question") : null}
        meta={
          post
            ? `${post.username ? `by ${post.username} · ` : ""}${formatDate(post.created_at)}`
            : null
        }
      />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 py-8 sm:py-10 space-y-8">
        {error && <p className="text-red-600 dark:text-red-400">{error}</p>}

        {post && (
          <article className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6 lg:p-8 space-y-4">
            <p className="text-base leading-relaxed whitespace-pre-wrap m-0">{post.body}</p>
            <ForumPostActions
              postId={post.id}
              shareToken={post.share_token}
              likes={post.likes}
              dislikes={post.dislikes}
              userVote={post.user_vote}
              sharedName={shared?.name || post.title}
              onVoteChange={(data) =>
                setPost((p) =>
                  p
                    ? {
                        ...p,
                        likes: data.likes,
                        dislikes: data.dislikes,
                        user_vote: data.userVote,
                      }
                    : p
                )
              }
            />
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

        {post && <ForumComments postId={post.id} initialComments={comments} />}
      </div>
    </div>
  );
}
