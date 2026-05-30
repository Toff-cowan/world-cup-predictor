import { useCountdownVisibility } from "../../context/CountdownVisibilityContext.jsx";
import { WC_BLUE } from "../../constants/wcTheme.js";

/** Always visible — toggles the countdown ribbon on/off (replaces Show timer). */
export default function CountdownKickoffButton() {
  const { visible, show, hide } = useCountdownVisibility();

  return (
    <button
      type="button"
      onClick={() => (visible ? hide() : show())}
      className="flex flex-col items-center -mt-px outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black shrink-0"
      aria-pressed={visible}
      aria-label={visible ? "Hide kickoff countdown" : "Show kickoff countdown"}
    >
      <span
        className="inline-flex items-center gap-2 rounded-b-lg px-3 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.12em] text-white transition-opacity hover:brightness-110"
        style={{ backgroundColor: WC_BLUE }}
      >
        Kickoff
        <svg
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${
            visible ? "rotate-180" : "rotate-0"
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </span>
      <span
        className="h-0 w-0 border-l-[8px] border-r-[8px] border-t-[7px] border-l-transparent border-r-transparent"
        style={{ borderTopColor: WC_BLUE }}
        aria-hidden
      />
    </button>
  );
}
