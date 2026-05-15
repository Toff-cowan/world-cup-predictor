import { useCountdown } from "../../hooks/useCountdown.js";

/** 2026 World Cup brand palette (from tournament graphics) */
const WC = {
  yellow: "#FFE800",
  blue: "#2165F4",
  purple: "#6B2C91",
  green: "#00B84A",
  lime: "#9FD536",
  red: "#E81D2C",
  maroon: "#8B1538",
};

const SEGMENTS = [
  { key: "days", label: "days", color: WC.yellow },
  { key: "hours", label: "hours", color: WC.blue },
  { key: "mins", label: "mins", color: WC.red },
  { key: "secs", label: "secs", color: WC.green },
];

export default function CountdownBlock() {
  const time = useCountdown();
  const values = {
    days: time.days,
    hours: String(time.hours).padStart(2, "0"),
    mins: String(time.mins).padStart(2, "0"),
    secs: String(time.secs).padStart(2, "0"),
  };

  return (
    <section className="w-full text-center leading-none py-8 lg:py-10">
      <h2
        className="font-bold text-zinc-900 tracking-tight m-0 text-[clamp(2rem,8vw,90px)] lg:text-[90px]"
        style={{ lineHeight: 1.05 }}
      >
        World Cup 2026:
      </h2>
      <p
        className="font-bold tabular-nums m-0 mt-2 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-1 text-[clamp(2rem,12vw,120px)] lg:text-[120px]"
        style={{ lineHeight: 1 }}
      >
        {SEGMENTS.map(({ key, label, color }, i) => (
          <span key={key} className="inline-flex items-baseline gap-1">
            {i > 0 && <span className="text-zinc-400 font-normal text-[0.25em]">·</span>}
            <span style={{ color }}>{values[key]}</span>
            <span className="text-zinc-600 font-semibold text-[0.22em] uppercase tracking-wide">
              {label}
            </span>
          </span>
        ))}
      </p>
    </section>
  );
}
