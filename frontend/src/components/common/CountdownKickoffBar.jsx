import CountdownKickoffButton from "./CountdownKickoffButton.jsx";
import CountdownRibbon from "./CountdownRibbon.jsx";
import { useCountdownVisibility } from "../../context/CountdownVisibilityContext.jsx";

/** Right-aligned kickoff tab; ribbon slides down and replaces the button when open. */
export default function CountdownKickoffBar() {
  const { visible, show, hide } = useCountdownVisibility();

  return (
    <div className="relative bg-black border-b border-white/10">
      <div
        className={`max-w-[1400px] mx-auto px-4 lg:px-8 flex justify-end overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          visible ? "max-h-0 opacity-0 pointer-events-none" : "max-h-14 opacity-100"
        }`}
        aria-hidden={visible}
      >
        <CountdownKickoffButton onClick={show} />
      </div>

      <div
        className={`countdown-ribbon-grid grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          visible ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <div
            className={visible ? "countdown-ribbon-slide-in" : ""}
            aria-hidden={!visible}
          >
            <CountdownRibbon onClose={hide} />
          </div>
        </div>
      </div>
    </div>
  );
}
