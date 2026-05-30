import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { HELP_SECTIONS } from "../../utils/predictionHelp.js";

const HELP_KEY = "wc-predictions-help-seen";

export function shouldShowHelpOnLoad() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(HELP_KEY) !== "true";
}

export function markHelpSeen() {
  localStorage.setItem(HELP_KEY, "true");
}

const CARD_WIDTH_MAX = 320;
const GAP = 14;
const VIEWPORT_PAD = 16;

function cardWidth() {
  return Math.min(CARD_WIDTH_MAX, window.innerWidth - VIEWPORT_PAD * 2);
}

function measureTarget(targetId, cardHeight) {
  const el = document.querySelector(`[data-help-id="${targetId}"]`);
  if (!el) return null;

  const width = cardWidth();
  const rect = el.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const placeAbove = spaceBelow < cardHeight + GAP + VIEWPORT_PAD;

  let top;
  if (placeAbove) {
    top = Math.max(VIEWPORT_PAD, rect.top - cardHeight - GAP);
  } else {
    top = Math.min(
      window.innerHeight - cardHeight - VIEWPORT_PAD,
      rect.bottom + GAP
    );
  }

  const centerX = rect.left + rect.width / 2;
  let left = centerX - width / 2;
  left = Math.max(VIEWPORT_PAD, Math.min(left, window.innerWidth - width - VIEWPORT_PAD));

  const arrowLeft = Math.max(20, Math.min(width - 20, centerX - left));

  return { top, left, width, arrowLeft, placement: placeAbove ? "above" : "below" };
}

export default function PredictionHelpTour({ open, stepIndex, onStepChange, onClose }) {
  const section = HELP_SECTIONS[stepIndex];
  const cardRef = useRef(null);
  const [layout, setLayout] = useState(null);
  const total = HELP_SECTIONS.length;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === total - 1;

  const finish = useCallback(() => {
    markHelpSeen();
    onClose();
  }, [onClose]);

  const prev = useCallback(() => {
    if (stepIndex > 0) onStepChange(stepIndex - 1);
  }, [stepIndex, onStepChange]);

  const next = useCallback(() => {
    if (stepIndex >= total - 1) finish();
    else onStepChange(stepIndex + 1);
  }, [stepIndex, total, finish, onStepChange]);

  const updateLayout = useCallback(() => {
    if (!open || !section) return;
    const height = cardRef.current?.offsetHeight ?? 200;
    setLayout(measureTarget(section.targetId, height));
  }, [open, section]);

  useLayoutEffect(() => {
    updateLayout();
  }, [updateLayout, stepIndex]);

  useEffect(() => {
    if (!open) return;
    const t1 = window.setTimeout(updateLayout, 160);
    const t2 = window.setTimeout(updateLayout, 400);
    window.addEventListener("resize", updateLayout);
    window.addEventListener("scroll", updateLayout, true);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener("resize", updateLayout);
      window.removeEventListener("scroll", updateLayout, true);
    };
  }, [open, updateLayout, stepIndex]);

  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, finish, next, prev]);

  if (!open || !section) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] bg-black/45" aria-hidden onClick={finish} />

      <div
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prediction-help-step-title"
        className="fixed z-[102] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl"
        style={{
          top: layout?.top ?? VIEWPORT_PAD,
          left: layout?.left ?? VIEWPORT_PAD,
          width: layout?.width ?? cardWidth(),
          maxWidth: `calc(100vw - ${VIEWPORT_PAD * 2}px)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {layout && (
          <div
            className={`absolute w-3 h-3 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 rotate-45 ${
              layout.placement === "below"
                ? "-top-1.5 border-l border-t"
                : "-bottom-1.5 border-r border-b"
            }`}
            style={{ left: layout.arrowLeft - 6 }}
            aria-hidden
          />
        )}

        <div className="relative px-5 pt-5 pb-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#0047FF] m-0">
              Step {stepIndex + 1} of {total}
            </p>
            <button
              type="button"
              onClick={finish}
              className="p-0.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white shrink-0 -mt-0.5"
              aria-label="Close tour"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <h2
            id="prediction-help-step-title"
            className="font-display text-base font-bold uppercase tracking-tight m-0 mb-2 text-zinc-900 dark:text-zinc-100"
          >
            {section.title}
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 m-0 leading-relaxed">
            {section.body}
          </p>
        </div>

        <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={isFirst}
            className="flex items-center justify-center w-9 h-9 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:border-zinc-900 dark:hover:border-white disabled:opacity-30 disabled:pointer-events-none"
            aria-label="Previous step"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={isLast ? finish : next}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wide bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
          >
            {isLast ? "Got it" : "Next"}
          </button>

          <button
            type="button"
            onClick={next}
            disabled={isLast}
            className="flex items-center justify-center w-9 h-9 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:border-zinc-900 dark:hover:border-white disabled:opacity-30 disabled:pointer-events-none"
            aria-label={isLast ? "End of tour" : "Next step"}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
