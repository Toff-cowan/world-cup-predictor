import { Link } from "react-router-dom";

const HERO_NEWS = [
  { tag: "Predictions", title: "Build your bracket before kickoff" },
  { tag: "Standings", title: "Live group tables for all 12 groups" },
  { tag: "Teams", title: "48 nations — full squad hub coming soon" },
  { tag: "Tournament", title: "USA, Canada & Mexico host 104 matches" },
];

const NEXT_UP = { tag: "Next up", title: "Open the standings hub" };

export default function HeroSection() {
  return (
    <section className="relative bg-black text-white overflow-hidden">
      {/*
        Hero background video — add your <video> here, e.g.:
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          src="/videos/world-cup-hero.mp4"
        />
      */}
      <div
        className="absolute inset-0 bg-black"
        aria-hidden
        data-hero-video-slot
      />

      <div className="absolute inset-0 bg-black/60 pointer-events-none" aria-hidden />

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-[1fr_minmax(280px,42%)] gap-8 lg:gap-12 py-12 lg:py-16 min-h-[min(72vh,640px)]">
          <div className="flex flex-col justify-center max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70 m-0">
              Bracket predictor
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mt-3 m-0 leading-tight">
              Pick your World Cup 2026 winners
            </h1>
            <p className="text-base text-white/80 mt-4 m-0 leading-relaxed">
              Create brackets, lock stages as the tournament unfolds, and track how
              your predictions stack up against real standings.
            </p>
            <Link
              to="/predictions"
              className="mt-8 inline-flex w-fit items-center justify-center px-8 py-3 bg-white text-black text-sm font-bold hover:bg-white/90 transition-colors"
            >
              Read more
            </Link>
          </div>

          <div className="hidden lg:flex flex-col justify-center">
            <div className="aspect-[4/3] w-full border border-dashed border-white/25 bg-white/5 flex items-center justify-center text-white/40 text-xs uppercase tracking-wider">
              Hero image / video still
            </div>
            <aside className="mt-4 flex gap-3 items-start border-t border-white/15 pt-4">
              <div className="w-16 h-20 shrink-0 border border-dashed border-white/25 bg-white/5" />
              <div>
                <p className="text-[10px] uppercase tracking-widest text-white/50 m-0">
                  {NEXT_UP.tag}
                </p>
                <p className="text-sm font-semibold mt-1 m-0">{NEXT_UP.title}</p>
              </div>
            </aside>
          </div>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 border-t border-white/15 py-8 list-none m-0 p-0">
          {HERO_NEWS.map(({ tag, title }) => (
            <li key={title}>
              <p className="text-[10px] uppercase tracking-widest text-white/50 m-0">
                {tag}
              </p>
              <p className="text-sm font-medium mt-2 m-0 leading-snug">{title}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
