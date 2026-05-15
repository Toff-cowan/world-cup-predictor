import CountdownCompact from "./CountdownCompact.jsx";
import { WC_BLUE } from "../../constants/wcTheme.js";

/** FIFA-style blue countdown ribbon (below site header) */
export default function CountdownRibbon({ onClose }) {
  return (
    <section
      className="font-sans text-white relative dark:border-b dark:border-white/10"
      style={{ backgroundColor: WC_BLUE }}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 lg:top-4 lg:right-6 p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Hide countdown"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-5 pr-12 lg:pr-16 flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
        <div className="shrink-0">
          <p className="text-xl sm:text-2xl font-bold tracking-tight m-0">
            FIFA World Cup 2026™
          </p>
          <p className="text-sm sm:text-base text-white/90 mt-1 m-0">11 June – 19 July 2026</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:ml-auto">
          <CountdownCompact />
        </div>
      </div>
    </section>
  );
}
