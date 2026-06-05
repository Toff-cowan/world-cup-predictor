import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { newsApi } from "../../api/newsApi.js";
import HomeButton from "../../components/common/HomeButton.jsx";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function NewsDetailPage() {
  const { slug } = useParams();
  const location = useLocation();
  const preview = location.state?.preview;

  const [article, setArticle] = useState(preview || null);
  const [loadingBody, setLoadingBody] = useState(!preview?.body);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    if (preview?.body) {
      setArticle(preview);
      setLoadingBody(false);
      return undefined;
    }

    setLoadingBody(true);
    newsApi
      .get(slug)
      .then((data) => {
        if (!cancelled) setArticle(data.article);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoadingBody(false);
      });

    return () => {
      cancelled = true;
    };
  }, [slug, preview]);

  if (!article && !error && loadingBody) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-white dark:bg-zinc-950 text-zinc-500">
        Loading article…
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center bg-white dark:bg-zinc-950 px-4">
        <p className="text-red-600 dark:text-red-400">{error || "Article not found."}</p>
        <HomeButton as="link" to="/news" variant="link" className="mt-4">
          Back to news
        </HomeButton>
      </div>
    );
  }

  const content = article.body || article.summary;

  return (
    <article className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="w-full bg-black text-white py-8 sm:py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <Link to="/news" className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white">
            ← All news
          </Link>
          <p className="text-[10px] uppercase tracking-widest text-white/50 mt-6 m-0">
            {article.tag || "News"}
          </p>
          <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight mt-2 m-0 leading-tight">
            {article.title}
          </h1>
          {article.publishedAt && (
            <p className="text-sm text-white/60 mt-3 m-0">{formatDate(article.publishedAt)}</p>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt=""
            className="w-full aspect-[16/10] object-cover border border-zinc-200 dark:border-zinc-700 mb-8"
          />
        )}

        {loadingBody && !content ? (
          <p className="text-zinc-500">Loading full article…</p>
        ) : (
          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <p className="text-base sm:text-lg leading-relaxed whitespace-pre-wrap m-0">{content}</p>
          </div>
        )}

        {article.sourceUrl && (
          <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <HomeButton as="a" href={article.sourceUrl} target="_blank" rel="noopener noreferrer" variant="link">
              Read on FIFA.com →
            </HomeButton>
          </div>
        )}
      </div>
    </article>
  );
}
