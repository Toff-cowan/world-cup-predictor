import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { newsApi } from "../../api/newsApi.js";
import ExternalSiteLink from "../../components/common/ExternalSiteLink.jsx";
import HomeButton from "../../components/common/HomeButton.jsx";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ArticleCard({ article }) {
  return (
    <Link
      to={`/news/${article.slug}`}
      state={{ preview: article }}
      className="group interactive-card flex flex-col border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden hover:border-zinc-400 dark:hover:border-zinc-500"
    >
      {article.imageUrl ? (
        <div className="aspect-[16/10] overflow-hidden">
          <img
            src={article.imageUrl}
            alt=""
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="aspect-[16/10] bg-zinc-100 dark:bg-zinc-800" />
      )}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[10px] uppercase tracking-widest text-zinc-500 m-0">
          {article.tag || "News"}
        </p>
        <h2 className="text-base font-bold mt-2 m-0 leading-snug group-hover:underline underline-offset-2">
          {article.title}
        </h2>
        {article.summary && (
          <p className="text-sm text-zinc-600 dark:text-white mt-2 m-0 line-clamp-3 flex-1">
            {article.summary}
          </p>
        )}
        {article.publishedAt && (
          <p className="text-xs text-zinc-500 mt-3 m-0">{formatDate(article.publishedAt)}</p>
        )}
      </div>
    </Link>
  );
}

export default function NewsPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    function load(isInitial = false) {
      if (isInitial) setLoading(true);
      newsApi
        .list(24)
        .then((data) => {
          if (!cancelled) {
            setArticles(data.articles || []);
            setError("");
          }
        })
        .catch((err) => {
          if (!cancelled) setError(err.message);
        })
        .finally(() => {
          if (!cancelled && isInitial) setLoading(false);
        });
    }

    load(true);
    const id = setInterval(() => load(false), 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <section className="w-full bg-black text-white py-10 sm:py-12 lg:py-16 px-4">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight m-0">
            News
          </h1>
          <p className="text-sm text-white/70 mt-2 m-0">
            Tournament stories sourced from{" "}
            <ExternalSiteLink
              href="https://www.fifa.com/en/news"
              hint="fifa.com · news"
              showArrow={false}
              className="underline underline-offset-2 text-white/90 hover:text-white"
            >
              FIFA.com
            </ExternalSiteLink>
          </p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
        {loading && <p className="text-zinc-500">Loading news…</p>}
        {error && (
          <p className="text-red-600 dark:text-red-400 text-sm">
            {error}. Run <code className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5">npm run scrape</code> in the backend.
          </p>
        )}

        {!loading && !error && articles.length === 0 && (
          <p className="text-zinc-500 text-sm">No news articles yet.</p>
        )}

        {!loading && articles.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}

        <div className="mt-10">
          <HomeButton as="link" to="/" variant="link">
            ← Back to home
          </HomeButton>
        </div>
      </div>
    </div>
  );
}
