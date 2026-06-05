import HeroSection from "./sections/HeroSection.jsx";
import NewsSection from "./sections/NewsSection.jsx";
import StandingsPreview from "./sections/StandingsPreview.jsx";
import MatchFixturesSection from "./sections/MatchFixturesSection.jsx";
import FAQSection from "./sections/FAQSection.jsx";

export default function LandingPage() {
  return (
    <div className="font-sans min-h-screen bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100">
      <HeroSection />
      <NewsSection />
      <StandingsPreview />
      <MatchFixturesSection />
      <FAQSection />
    </div>
  );
}
