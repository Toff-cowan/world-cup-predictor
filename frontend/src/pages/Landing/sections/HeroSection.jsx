import { useEffect, useState } from "react";
import { TROPHY_IMAGE } from "../../../constants/assets.js";
import { newsApi } from "../../../api/newsApi.js";
import HomeButton from "../../../components/common/HomeButton.jsx";

export default function HeroSection() {
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    newsApi
      .list(3)
      .then((res) => setHighlights((res.articles || []).slice(0, 3)))
      .catch(() => setHighlights([]));
  }, []);

  return (
    <section className="relative bg-black text-white overflow-hidden min-h-[min(85vh,780px)] sm:min-h-[min(88vh,780px)]">
      <div className="absolute inset-0 bg-black" aria-hidden data-hero-video-slot />
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/55 to-black pointer-events-none"
        aria-hidden
      />

      {/* Centre trophy — big, floating */}
      <div
        className="absolute inset-0 flex items-center justify-center max-sm:items-start max-sm:pt-20 pointer-events-none z-[1]"
        aria-hidden
      >
        <img
          src={TROPHY_IMAGE}
          alt=""
          className="hero-trophy-float w-[min(72vw,28rem)] sm:w-[min(65vw,32rem)] lg:w-[min(50vw,36rem)] h-auto max-h-[min(55vh,420px)] max-sm:max-h-[40vh] max-sm:opacity-50 object-contain select-none"
        />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-4 lg:px-8 h-full flex flex-col">
        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-10 py-12 lg:py-16 flex-1 items-center min-h-[min(72vh,640px)]">
          {/* Left — headline */}
          <div className="flex flex-col justify-center max-w-xl lg:max-w-none lg:pr-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70 m-0">
              Bracket predictor
            </p>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight mt-3 m-0 leading-tight drop-shadow-lg">
              Pick your World Cup 2026 winners
            </h1>
            <p className="text-base text-white/85 mt-4 m-0 leading-relaxed max-w-md drop-shadow">
              Create brackets, lock stages as the tournament unfolds, and track how your
              predictions stack up against real standings.
            </p>
            <HomeButton
              as="link"
              to="/predictions"
              variant="primary"
              className="mt-8 w-fit"
            >
              Start predicting
            </HomeButton>
          </div>

          {/* Centre spacer — trophy sits behind via absolute layer */}
          <div className="hidden lg:block w-[min(36rem,42vw)] shrink-0" aria-hidden />

          {/* Right — floating news cards */}
          <div className="hidden lg:flex flex-col gap-4 justify-center">
            {highlights.length > 0 ? (
              highlights.map((story, i) => (
                <a
                  key={story.slug}
                  href={story.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`hero-news-card hero-news-card-${(i % 3) + 1} block border border-white/20 bg-black/45 backdrop-blur-sm px-4 py-3 hover:bg-black/60 transition-colors`}
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  <p className="text-[10px] uppercase tracking-widest text-white/50 m-0">
                    {story.tag || "FIFA News"}
                  </p>
                  <p className="text-sm font-semibold mt-1.5 m-0 leading-snug line-clamp-2">
                    {story.title}
                  </p>
                </a>
              ))
            ) : (
              <>
                <div className="hero-news-card hero-news-card-1 border border-white/20 bg-black/45 backdrop-blur-sm px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/50 m-0">
                    Predictions
                  </p>
                  <p className="text-sm font-semibold mt-1.5 m-0">Build your bracket before kickoff</p>
                </div>
                <div className="hero-news-card hero-news-card-2 border border-white/20 bg-black/45 backdrop-blur-sm px-4 py-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/50 m-0">
                    Standings
                  </p>
                  <p className="text-sm font-semibold mt-1.5 m-0">Live group tables for all 12 groups</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Mobile news strip */}
        {highlights.length > 0 && (
          <ul className="lg:hidden grid grid-cols-1 sm:grid-cols-3 gap-3 pb-8 list-none m-0 p-0 border-t border-white/15 pt-6">
            {highlights.map((story) => (
              <li key={story.slug}>
                <a
                  href={story.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-left"
                >
                  <p className="text-[10px] uppercase tracking-widest text-white/50 m-0">
                    {story.tag || "News"}
                  </p>
                  <p className="text-sm font-medium mt-1 m-0 leading-snug line-clamp-2">
                    {story.title}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
