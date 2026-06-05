import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forumApi } from "../../api/forumApi.js";
import { predictionsApi } from "../../api/predictionsApi.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { syncLocalBracketsToServer } from "../../utils/localBrackets.js";

export default function CreatePost() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [brackets, setBrackets] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent("/forum/new")}`, { replace: true });
      return;
    }

    async function loadBrackets() {
      try {
        await syncLocalBracketsToServer(predictionsApi);
        const data = await predictionsApi.list();
        const list = data.predictions || [];
        setBrackets(list);
        if (list.length > 0) setSelectedId(String(list[0].id));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadBrackets();
  }, [authLoading, isAuthenticated, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const selected = brackets.find((b) => String(b.id) === String(selectedId));
      const shareToken = selected?.share_token || null;
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

  if (authLoading || loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-[#f3f3f3] dark:bg-[#0a0a0a] text-zinc-500">
        Loading…
      </div>
    );
  }

  const inputClass =
    "mt-1 w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100";

  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100">
      <section className="w-full bg-black text-white py-10 sm:py-12 px-4">
        <div className="max-w-[1400px] mx-auto">
          <Link to="/forum" className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white">
            ← Back to forum
          </Link>
          <h1 className="font-display text-2xl sm:text-4xl font-bold uppercase tracking-tight mt-4 m-0">
            Share your bracket
          </h1>
          <p className="text-sm text-white/70 mt-2 m-0">
            Post to the forum with an attached bracket link the community can open.
          </p>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-5"
      >
        {error && <p className="text-red-600 dark:text-red-400 text-sm m-0">{error}</p>}

        {brackets.length === 0 ? (
          <div className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-6">
            <p className="text-zinc-500 m-0">You need a saved bracket first.</p>
            <Link to="/predictions" className="inline-block mt-3 text-sm font-semibold underline">
              Build a bracket
            </Link>
          </div>
        ) : (
          <>
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

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Title
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dark horses for the knockout stage"
                className={`${inputClass} min-h-[2.75rem]`}
                maxLength={200}
                required
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Message
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Tell the community about your picks…"
                rows={6}
                className={`${inputClass} resize-y min-h-[8rem]`}
                required
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold disabled:opacity-50"
            >
              {submitting ? "Posting…" : "Post to forum"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
