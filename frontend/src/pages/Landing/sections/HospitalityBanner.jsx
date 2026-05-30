import HomeButton from "../../../components/common/HomeButton.jsx";

export default function HospitalityBanner() {
  return (
    <section className="bg-black text-white border-y border-white/10">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-bold m-0">World Cup Bracket Predictor</p>
          <p className="text-xs text-white/60 mt-1 m-0 max-w-xl">
            Save multiple brackets, share with friends, and compare picks to live results.
          </p>
        </div>
        <HomeButton variant="outline" className="shrink-0">
          Choose your package
          <span className="text-lg leading-none" aria-hidden>
            +
          </span>
        </HomeButton>
      </div>
    </section>
  );
}
