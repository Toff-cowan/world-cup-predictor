import { WC_BLUE } from "../../constants/wcTheme.js";

const PHRASE = "ITS WORLD CUP TIME!!!!!!!";
// Rendered twice over; the track animates by -50% for a seamless loop.
const ITEMS = Array.from({ length: 12 });

/** FIFA-style blue ribbon with a right-to-left scrolling marquee. */
export default function CountdownRibbon({ onClose }) {
  return (
    <section
      className="font-sans text-white relative overflow-hidden dark:border-b dark:border-white/10"
      style={{ backgroundColor: WC_BLUE }}
    >
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-1/2 -translate-y-1/2 right-3 lg:right-6 z-10 p-1.5 text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Hide countdown"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}

      <div
        className="wc-marquee py-4 sm:py-5"
        role="marquee"
        aria-label="It's World Cup time"
      >
        <div className="wc-marquee__track">
          {ITEMS.map((_, i) => (
            <span key={i} className="wc-marquee__item" aria-hidden={i !== 0}>
              <span className="font-display font-bold tracking-tight text-xl sm:text-2xl lg:text-3xl">
                {PHRASE}
              </span>
              <span className="wc-marquee__sep" aria-hidden>
                ★
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
