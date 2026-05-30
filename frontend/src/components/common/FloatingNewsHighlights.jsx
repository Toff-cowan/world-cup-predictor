import { useEffect, useState } from "react";
import { newsApi } from "../../api/newsApi.js";

function useIsMobile() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return mobile;
}

export default function FloatingNewsHighlights() {
  const [articles, setArticles] = useState([]);
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  useEffect(() => {
    newsApi
      .list(4)
      .then((res) => setArticles(res.articles || []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || articles.length === 0) return null;

  return (
    <aside
      className={`fixed z-40 left-4 right-4 sm:left-auto sm:right-6 bottom-4 sm:bottom-6 sm:w-[min(calc(100vw-2rem),18rem)] pointer-events-none safe-bottom ${
        collapsed ? "" : "floating-news-panel"
      }`}
      aria-label="FIFA news highlights"
    >
      <div className="pointer-events-auto border border-zinc-200/90 dark:border-zinc-700/90 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-xl max-h-[min(45vh,280px)] sm:max-h-[min(50vh,320px)] flex flex-col">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 m-0">
            FIFA highlights
          </p>
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="min-h-[2.5rem] px-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
            aria-expanded={!collapsed}
          >
            {collapsed ? "Show" : "Hide"}
          </button>
        </div>

        {!collapsed && (
          <ul className="list-none m-0 p-0 overflow-y-auto flex-1 min-h-0">
            {articles.map((story, i) => (
              <li
                key={story.slug}
                className={`floating-news-item floating-news-item-${(i % 3) + 1}`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <a
                  href={story.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex gap-2.5 px-3 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/80 transition-colors border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
                >
                  {story.imageUrl ? (
                    <img
                      src={story.imageUrl}
                      alt=""
                      className="w-11 h-11 shrink-0 object-cover border border-zinc-200 dark:border-zinc-700"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className="w-11 h-11 shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                      aria-hidden
                    />
                  )}
                  <span className="min-w-0">
                    <span className="block text-[9px] uppercase tracking-widest text-zinc-500 truncate">
                      {story.tag || "News"}
                    </span>
                    <span className="block text-xs font-semibold leading-snug mt-0.5 line-clamp-2 text-zinc-900 dark:text-zinc-100">
                      {story.title}
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}

        <a
          href="https://www.fifa.com/en/news"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center min-h-[2.75rem] text-center text-[10px] font-bold uppercase tracking-widest text-[#326295] dark:text-[#7eb3ff] hover:underline underline-offset-2 border-t border-zinc-200 dark:border-zinc-800 shrink-0"
        >
          More on FIFA.com
        </a>
      </div>
    </aside>
  );
}
