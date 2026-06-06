import { forwardRef } from "react";
import BracketFitViewport from "./BracketFitViewport.jsx";
import BracketHalfLayout from "./BracketHalfLayout.jsx";

const KnockoutBracketShell = forwardRef(function KnockoutBracketShell(
  { hint, title = "2026 World Cup Knockout", subtitle, centerColumn, renderMatch },
  ref
) {
  return (
    <section className="bracket-shell bg-white text-zinc-900 border border-zinc-200 dark:border-zinc-700 pb-4 sm:pb-6">
      <BracketFitViewport ref={ref}>
        <div className="w-max px-1 sm:px-2 py-2 sm:py-3 bg-white">
          {hint && (
            <p className="bracket-hint text-xs text-zinc-500 text-center m-0 mb-2">{hint}</p>
          )}
          <h2 className="bracket-shell-title font-display text-lg xl:text-xl font-bold uppercase tracking-tight text-center m-0 mb-0.5 text-zinc-900">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-[11px] text-zinc-500 text-center m-0 mb-3">{subtitle}</p>
          ) : (
            <div className="mb-3" />
          )}

          <div className="flex items-stretch justify-center gap-0.5 xl:gap-1">
            <BracketHalfLayout
              side="left"
              renderMatch={(roundKey, idx) => renderMatch(roundKey, idx, false)}
            />

            {centerColumn}

            <BracketHalfLayout
              side="right"
              renderMatch={(roundKey, idx) => renderMatch(roundKey, idx, true)}
            />
          </div>
        </div>
      </BracketFitViewport>
    </section>
  );
});

export default KnockoutBracketShell;
