import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { forumApi } from "../../api/forumApi.js";
import { predictionsApi } from "../../api/predictionsApi.js";
import ForumPageHeader from "../../components/forum/ForumPageHeader.jsx";
import { randomFifaHeaderTheme } from "../../constants/fifaColors.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { FORUM_LIMITS, validateForumPost } from "../../utils/forumContentFilter.js";
import { syncLocalBracketsToServer } from "../../utils/localBrackets.js";

const POST_TYPES = [
  { id: "question", label: "Ask a question", hint: "Start a discussion — no bracket required." },
  { id: "bracket", label: "Share a bracket", hint: "Attach one of your saved brackets for others to view and copy." },
];

export default function CreatePost() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [postType, setPostType] = useState(location.state?.postType || "question");
  const [brackets, setBrackets] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loadingBrackets, setLoadingBrackets] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const pageTheme = useMemo(() => randomFifaHeaderTheme(), []);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent("/forum/new")}`, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || postType !== "bracket") return;

    let cancelled = false;
    setLoadingBrackets(true);

    async function loadBrackets() {
      try {
        await syncLocalBracketsToServer(predictionsApi);
        const data = await predictionsApi.list();
        if (cancelled) return;
        const list = data.predictions || [];
        setBrackets(list);
        if (list.length > 0) {
          const fromState = location.state?.bracketId
            ? list.find((b) => String(b.id) === String(location.state.bracketId))
            : location.state?.bracketName
              ? list.find((b) => b.name === location.state.bracketName)
              : null;
          setSelectedId(String((fromState || list[0]).id));
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoadingBrackets(false);
      }
    }

    loadBrackets();
    return () => {
      cancelled = true;
    };
  }, [authLoading, isAuthenticated, postType, location.state?.bracketId, location.state?.bracketName]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const contentCheck = validateForumPost(title, body);
    if (!contentCheck.ok) {
      setError(contentCheck.message);
      return;
    }

    if (postType === "bracket" && brackets.length === 0) {
      setError("Create a bracket first, or post as a question instead.");
      return;
    }

    setSubmitting(true);
    try {
      let shareToken = null;
      if (postType === "bracket") {
        const selected = brackets.find((b) => String(b.id) === String(selectedId));
        shareToken = selected?.share_token || null;
      }

      const data = await forumApi.create({
        title: title.trim(),
        body: body.trim(),
        share_token: shareToken,
      });
      navigate(`/forum/${data.post.id}`, { state: { preview: data.post } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#f3f3f3] dark:bg-[#0a0a0a] text-zinc-500">
        Loading…
      </div>
    );
  }

  const inputClass =
    "mt-1 w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white";
  const activeType = POST_TYPES.find((t) => t.id === postType);

  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0a0a0a] text-zinc-900 dark:text-white">
      <ForumPageHeader
        theme={pageTheme}
        backTo="/forum"
        title="New forum post"
        subtitle="Ask the community a question or share your bracket predictions. Keep language respectful — explicit words are blocked."
      />

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-5"
      >
        {error && <p className="text-red-600 dark:text-red-400 text-sm m-0">{error}</p>}

        <fieldset className="border-0 p-0 m-0">
          <legend className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
            Post type
          </legend>
          <div className="flex flex-col sm:flex-row gap-2">
            {POST_TYPES.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setPostType(id)}
                className={`flex-1 px-4 py-3 text-sm font-bold border text-left transition-colors ${
                  postType === id
                    ? "border-zinc-900 dark:border-white bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white"
                    : "border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-white hover:border-zinc-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {activeType && (
            <p className="text-xs text-zinc-500 mt-2 m-0">{activeType.hint}</p>
          )}
        </fieldset>

        {postType === "bracket" && loadingBrackets && (
          <p className="text-sm text-zinc-500 m-0">Loading your brackets…</p>
        )}

        {postType === "bracket" && !loadingBrackets && brackets.length === 0 && (
          <div className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
            <p className="text-zinc-500 m-0">You don&apos;t have a saved bracket yet.</p>
            <Link to="/predictions" className="inline-block mt-3 text-sm font-semibold underline">
              Build a bracket
            </Link>
            <p className="text-sm text-zinc-500 mt-4 m-0">
              Or switch to{" "}
              <button
                type="button"
                onClick={() => setPostType("question")}
                className="font-semibold underline text-zinc-900 dark:text-white"
              >
                Ask a question
              </button>{" "}
              to post without a bracket.
            </p>
          </div>
        )}

        {(postType === "question" || (postType === "bracket" && brackets.length > 0 && !loadingBrackets)) && (
          <>
            {postType === "bracket" && (
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Bracket to share
                </span>
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className={`${inputClass} min-h-[2.75rem]`}
                  required
                >
                  {brackets.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label className="block">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Title
                </span>
                <span className="text-[10px] text-zinc-400 tabular-nums">
                  {title.length}/{FORUM_LIMITS.titleMax}
                </span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={
                  postType === "question"
                    ? "e.g. Who wins Group A if Mexico draw with Argentina?"
                    : "e.g. Dark horses for the knockout stage"
                }
                className={`${inputClass} min-h-[2.75rem]`}
                maxLength={FORUM_LIMITS.titleMax}
                required
              />
            </label>

            <label className="block">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {postType === "question" ? "Your question" : "Message"}
                </span>
                <span className="text-[10px] text-zinc-400 tabular-nums">
                  {body.length}/{FORUM_LIMITS.bodyMax}
                </span>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={
                  postType === "question"
                    ? "What do you want to know or discuss?"
                    : "Tell the community about your picks…"
                }
                rows={6}
                className={`${inputClass} resize-y min-h-[8rem]`}
                maxLength={FORUM_LIMITS.bodyMax}
                required
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white font-bold disabled:opacity-50"
            >
              {submitting ? "Posting…" : postType === "question" ? "Post question" : "Share bracket"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
