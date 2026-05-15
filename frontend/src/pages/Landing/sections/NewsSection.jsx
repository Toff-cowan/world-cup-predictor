import { Link } from "react-router-dom";

const FEATURED = {
  tag: "Predictions",
  title: "Lock your knockout picks before each stage closes",
  summary:
    "Save separate brackets for friends, family, or office pools. Stages lock automatically when FIFA marks matches complete.",
};

const STORY_LIST = [
  { tag: "Standings", title: "Group tables update from live FIFA data" },
  { tag: "Teams", title: "All 48 qualified nations in one place" },
  { tag: "Matches", title: "Scores & fixtures hub coming soon" },
  { tag: "Forum", title: "Discuss picks with other predictors" },
  { tag: "Profile", title: "Track your accuracy across the tournament" },
  { tag: "Share", title: "Send a read-only link to your bracket" },
  { tag: "Knockout", title: "Round of 32 through the final" },
  { tag: "Groups", title: "12 groups of four — 48 teams total" },
  { tag: "Hosts", title: "USA, Canada, and Mexico 2026" },
];

export default function NewsSection() {
  return (
    <section className="bg-white text-zinc-900">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight m-0">Top stories</h2>

        <div className="mt-8 grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14">
          <article>
            <div className="aspect-[16/10] w-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-400 text-xs uppercase tracking-wider">
              Featured image
            </div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-5 m-0">
              {FEATURED.tag}
            </p>
            <h3 className="text-xl sm:text-2xl font-bold mt-2 m-0 leading-snug">
              {FEATURED.title}
            </h3>
            <p className="text-sm text-zinc-600 mt-3 m-0 leading-relaxed max-w-prose">
              {FEATURED.summary}
            </p>
            <Link
              to="/predictions"
              className="inline-block mt-4 text-sm font-semibold underline underline-offset-4"
            >
              Read more
            </Link>
          </article>

          <ul className="space-y-0 list-none m-0 p-0 divide-y divide-zinc-200">
            {STORY_LIST.map(({ tag, title }) => (
              <li key={title} className="flex gap-4 py-4 first:pt-0">
                <div
                  className="w-16 h-16 shrink-0 bg-zinc-100 border border-zinc-200"
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-500 m-0">
                    {tag}
                  </p>
                  <p className="text-sm font-bold mt-1 m-0 leading-snug">{title}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
