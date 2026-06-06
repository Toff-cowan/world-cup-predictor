import MatchFixturesSection from "../Landing/sections/MatchFixturesSection.jsx";

export default function MatchesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
      <section className="w-full bg-black text-white py-10 sm:py-12 lg:py-16 px-4">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight m-0">
            Fixtures
          </h1>
          <p className="text-sm text-white/70 mt-2 m-0">
            Group stage matches, live scores, and qualification picture.
          </p>
        </div>
      </section>
      <MatchFixturesSection embedded />
    </div>
  );
}
