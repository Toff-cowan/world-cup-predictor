import { padForm } from "../../utils/teamForm.js";

function FormArrow({ result }) {
  if (result === "W") {
    return (
      <span
        className="inline-flex items-center justify-center w-5 h-5 text-emerald-600 dark:text-emerald-400"
        title="Win"
        aria-label="Win"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M8 12V5M8 5L5 8M8 5l3 3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  if (result === "L") {
    return (
      <span
        className="inline-flex items-center justify-center w-5 h-5 text-red-600 dark:text-red-400"
        title="Loss"
        aria-label="Loss"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path d="M8 4v7M8 11L5 8M8 11l3-3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  if (result === "D") {
    return (
      <span
        className="inline-flex items-center justify-center w-5 h-5 text-zinc-400 dark:text-white text-sm font-bold"
        title="Draw"
        aria-label="Draw"
      >
        —
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center w-5 h-5 text-zinc-300 dark:text-zinc-600 text-sm"
      aria-hidden
    >
      —
    </span>
  );
}

export function PositionTrendIcon({ trend }) {
  if (trend === "up") {
    return (
      <span className="text-emerald-600 dark:text-emerald-400 text-[10px] font-bold leading-none" title="Improving" aria-label="Improving">
        ▲
      </span>
    );
  }
  if (trend === "down") {
    return (
      <span className="text-red-600 dark:text-red-400 text-[10px] font-bold leading-none" title="Declining" aria-label="Declining">
        ▼
      </span>
    );
  }
  return (
    <span className="text-zinc-400 dark:text-white text-sm leading-none" title="Unchanged" aria-hidden>
      —
    </span>
  );
}

export default function FormIndicators({ form = [], showTrend = false, trend = "same" }) {
  const slots = padForm(form);

  return (
    <div className="flex items-center justify-end gap-0.5">
      {showTrend && (
        <span className="mr-1 shrink-0 w-3 text-center">
          <PositionTrendIcon trend={trend} />
        </span>
      )}
      {slots.map((result, i) => (
        <FormArrow key={i} result={result} />
      ))}
    </div>
  );
}
