import { useCountdown } from "../../hooks/useCountdown.js";

const SEGMENTS = [
  { key: "days", label: "days" },
  { key: "hours", label: "hours" },
  { key: "mins", label: "mins" },
  { key: "secs", label: "secs" },
];

/** Compact white countdown for blue header bars */
export default function CountdownCompact({ className = "" }) {
  const time = useCountdown();
  const values = {
    days: time.days,
    hours: String(time.hours).padStart(2, "0"),
    mins: String(time.mins).padStart(2, "0"),
    secs: String(time.secs).padStart(2, "0"),
  };

  return (
    <div
      role="group"
      className={`font-sport flex items-end gap-5 sm:gap-8 tabular-nums ${className}`}
      aria-label="Countdown to World Cup 2026 kickoff"
    >
      {SEGMENTS.map(({ key, label }) => (
        <div key={key} className="flex flex-col items-center min-w-[3rem] sm:min-w-[3.25rem]">
          <span className="text-3xl sm:text-4xl font-extrabold leading-none text-white tracking-tight">
            {values[key]}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-white/85 mt-1.5 uppercase tracking-[0.12em]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
