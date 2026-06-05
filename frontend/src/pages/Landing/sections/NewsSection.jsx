import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { newsApi } from "../../../api/newsApi.js";
import HomeButton from "../../../components/common/HomeButton.jsx";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function NewsSection() {
  const [featured, setFeatured] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([newsApi.featured(), newsApi.list(9)])
      .then(([featuredRes, listRes]) => {
        setFeatured(featuredRes.article || null);
        const rest = (listRes.articles || []).filter(
          (a) => a.slug !== featuredRes.article?.slug
        );
        setArticles(rest.slice(0, 8));
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="news" className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight m-0">Top stories</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 m-0">
              Latest from{" "}
              <a
                href="https://www.fifa.com/en/news"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-zinc-900 dark:hover:text-white"
              >
                FIFA.com
              </a>
            </p>
          </div>
          <HomeButton as="link" to="/news" variant="link">
            View all news →
          </HomeButton>
        </div>

        {loading && (
          <p className="text-zinc-500 dark:text-zinc-400 mt-8">Loading news…</p>
        )}

        {error && (
          <p className="text-red-600 dark:text-red-400 mt-8 text-sm">
            {error}. Run{" "}
            <code className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5">npm run scrape</code> in
            the backend.
          </p>
        )}

        {!loading && !error && !featured && articles.length === 0 && (
          <p className="text-zinc-500 dark:text-zinc-400 mt-8 text-sm">
            No news yet. Run{" "}
            <code className="bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5">npm run scrape</code> in
            the backend to pull stories from FIFA.com.
          </p>
        )}

        {!loading && featured && (
          <div className="mt-8 grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14">
            <article>
              {featured.imageUrl ? (
                <a
                  href={featured.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block aspect-[16/10] w-full overflow-hidden border border-zinc-200 dark:border-zinc-700"
                >
                  <img
                    src={featured.imageUrl}
                    alt=""
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </a>
              ) : (
                <div className="aspect-[16/10] w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700" />
              )}
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-5 m-0">
                {featured.tag || "News"}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold mt-2 m-0 leading-snug">
                {featured.title}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-3 m-0 leading-relaxed max-w-prose">
                {featured.body || featured.summary}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <HomeButton as="link" to={`/news/${featured.slug}`} state={{ preview: featured }}>
                  Read article
                </HomeButton>
                <HomeButton
                  as="a"
                  href={featured.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="ghost"
                >
                  FIFA.com
                </HomeButton>
                {featured.publishedAt && (
                  <span className="text-xs text-zinc-500">{formatDate(featured.publishedAt)}</span>
                )}
              </div>
            </article>

            <ul className="space-y-0 list-none m-0 p-0 divide-y divide-zinc-200 dark:divide-zinc-700">
              {articles.map((story) => (
                <li key={story.slug} className="flex gap-4 py-4 first:pt-0">
                  {story.imageUrl ? (
                    <a
                      href={story.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-16 h-16 shrink-0 overflow-hidden border border-zinc-200 dark:border-zinc-700"
                    >
                      <img
                        src={story.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </a>
                  ) : (
                    <div
                      className="w-16 h-16 shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                      aria-hidden
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 m-0">
                      {story.tag || "News"}
                    </p>
                    <Link
                      to={`/news/${story.slug}`}
                      state={{ preview: story }}
                      className="text-sm font-bold mt-1 m-0 leading-snug block hover:underline underline-offset-2"
                    >
                      {story.title}
                    </Link>
                    {story.summary && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 m-0 line-clamp-2">
                        {story.summary}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
