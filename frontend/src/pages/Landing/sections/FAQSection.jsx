import { useState } from "react";
import { useTheme } from "../../../context/ThemeContext.jsx";

const FAQ_DURATION = "1400ms";
const FAQ_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

function faqColors(isDark) {
  return {
    active: isDark ? "#f4f4f5" : "#120B2F",
    number: isDark ? "#71717a" : "#8a8a8a",
    icon: isDark ? "#71717a" : "#9ca3af",
    heading: isDark ? "#a1a1aa" : "#6b6b6b",
    focusRing: isDark ? "focus-visible:ring-zinc-400/40" : "focus-visible:ring-[#120B2F]/30",
  };
}

const FAQ_ITEMS = [
  {
    label: "Brackets",
    headingClass: "font-semibold tracking-[0.06em] lg:tracking-[0.1em]",
    q: "How do I create a World Cup 2026 bracket?",
    a: "Sign in, open My Predictions, and fill in your picks for each stage. You can save multiple named brackets and lock stages as the tournament progresses.",
    icon: BracketIcon,
  },
  {
    label: "Schedule",
    headingClass: "font-bold tracking-[0.04em] lg:tracking-[0.08em] italic",
    q: "When will the FIFA World Cup 2026™ be played?",
    a: "The tournament runs from 11 June to 19 July 2026 across host cities in the United States, Canada, and Mexico.",
    icon: CalendarIcon,
  },
  {
    label: "Teams",
    headingClass: "font-bold tracking-[0.12em] lg:tracking-[0.16em]",
    q: "Which teams have qualified for the FIFA World Cup 2026™?",
    a: "Forty-eight nations compete in twelve groups of four. View the full list and live tables on the Standings page.",
    icon: TeamsIcon,
  },
  {
    label: "Standings",
    headingClass: "font-semibold tracking-[0.02em] lg:tracking-[0.05em]",
    q: "How are standings updated?",
    a: "Group tables sync from FIFA competition data when you run the backend scraper or seed command.",
    icon: TableIcon,
  },
  {
    label: "Final",
    headingClass: "font-bold tracking-[0.14em] lg:tracking-[0.2em]",
    q: "When and where will the final be played?",
    a: "The final is scheduled for 19 July 2026. Stadium and kickoff details appear on FIFA’s official schedule.",
    icon: TrophyIcon,
  },
];

function faqTransition(props) {
  return { transition: `${props} ${FAQ_DURATION} ${FAQ_EASE}` };
}

function BracketIcon({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="6" width="10" height="6" rx="1" />
      <rect x="18" y="6" width="10" height="6" rx="1" />
      <rect x="11" y="20" width="10" height="6" rx="1" />
      <path d="M9 12v3h7v2M23 12v3h-7v2" />
    </svg>
  );
}

function CalendarIcon({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="7" width="22" height="20" rx="2" />
      <path d="M5 13h22M11 5v4M21 5v4" />
    </svg>
  );
}

function TeamsIcon({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="12" r="4" />
      <circle cx="21" cy="12" r="4" />
      <path d="M4 26c0-4 3.5-7 7-7s7 3 7 7M17 26c0-3 2.5-5 5-5" />
    </svg>
  );
}

function TableIcon({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 8h20v18H6zM6 14h20M12 8v18M18 8v18" />
    </svg>
  );
}

function TrophyIcon({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 8h12v6c0 4-2.5 6-6 6s-6-2-6-6V8zM8 10H5c0 3 2 5 5 5M24 10h3c0 3-2 5-5 5M13 20v4h6v-4M10 24h12" />
    </svg>
  );
}

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState(null);
  const { isDark } = useTheme();
  const colors = faqColors(isDark);

  return (
    <section className="font-sans bg-white dark:bg-[#0a0a0a] text-zinc-900 dark:text-white">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-12 py-20 lg:py-28">
        <h2 className="font-display text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-bold uppercase tracking-tight text-[#120B2F] dark:text-white m-0 leading-[0.95]">
          FAQs
        </h2>
        <p className="mt-4 text-sm text-zinc-500 dark:text-white m-0 max-w-md">
          Hover a topic to read more
        </p>

        <ul
          className="mt-14 lg:mt-20 list-none m-0 p-0 border-t border-[#eeeeee] dark:border-zinc-800"
          onMouseLeave={() => setActiveIndex(null)}
        >
          {FAQ_ITEMS.map(({ label, headingClass, q, a, icon: Icon }, i) => {
            const active = activeIndex === i;
            const alignRight = i % 2 === 1;
            const labelMuted = activeIndex !== null && !active;

            return (
              <li
                key={q}
                className="border-b border-[#eeeeee] dark:border-zinc-800"
                onMouseEnter={() => setActiveIndex(i)}
              >
                <div className={`flex ${alignRight ? "justify-end" : "justify-start"}`}>
                  <button
                    type="button"
                    className={`w-full max-w-[min(100%,52rem)] text-left outline-none focus-visible:ring-2 focus-visible:ring-offset-4 dark:focus-visible:ring-offset-zinc-950 motion-reduce:transition-none ${colors.focusRing} ${
                      alignRight ? "text-right" : "text-left"
                    }`}
                    aria-expanded={active}
                    onClick={() => setActiveIndex(active ? null : i)}
                    onFocus={() => setActiveIndex(i)}
                  >
                    <div
                      className={`flex items-start gap-4 sm:gap-6 lg:gap-8 motion-reduce:transition-none ${
                        alignRight ? "flex-row-reverse" : ""
                      }`}
                      style={{
                        paddingTop: active ? "3.5rem" : "2rem",
                        paddingBottom: active ? "3.5rem" : "2rem",
                        transform: active
                          ? alignRight
                            ? "translateX(-2rem)"
                            : "translateX(2rem)"
                          : "translateX(0)",
                        ...faqTransition("padding, transform"),
                      }}
                    >
                      <span
                        className="font-display text-sm font-semibold tabular-nums w-10 shrink-0 motion-reduce:transition-none"
                        style={{
                          color: active ? colors.active : colors.number,
                          opacity: labelMuted ? 0.55 : 1,
                          paddingTop: active ? "0.75rem" : "0.25rem",
                          ...faqTransition("color, opacity, padding-top"),
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <Icon
                        className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 motion-reduce:transition-none ${
                          active ? "faq-icon-enter" : ""
                        }`}
                        style={{
                          color: active ? colors.active : colors.icon,
                          opacity: active ? 1 : labelMuted ? 0.5 : 0.7,
                          maxHeight: active ? "4rem" : "2.5rem",
                          marginTop: active ? "0.5rem" : "0.15rem",
                          transform: active ? "scale(1)" : "scale(0.9)",
                          transformOrigin: alignRight ? "right center" : "left center",
                          overflow: "hidden",
                          ...faqTransition(
                            "color, opacity, max-height, transform, margin-top"
                          ),
                        }}
                        aria-hidden={!active}
                      />

                      <div
                        className={`flex-1 min-w-0 flex flex-col ${
                          alignRight ? "items-end" : "items-start"
                        }`}
                      >
                        <h3
                          className={`font-display uppercase m-0 leading-[0.9] motion-reduce:transition-none ${alignRight ? "origin-right" : "origin-left"} ${headingClass}`}
                          style={{
                            color: active ? colors.active : colors.heading,
                            opacity: active ? 1 : labelMuted ? 0.5 : 0.82,
                            fontSize: active
                              ? "clamp(2.75rem, 8vw, 5.5rem)"
                              : "clamp(1.75rem, 4.5vw, 3rem)",
                            transform: active ? "scale(1)" : "scale(0.96)",
                            ...faqTransition("color, opacity, font-size, transform"),
                          }}
                        >
                          {label}
                        </h3>

                        <div
                          className="grid w-full motion-reduce:transition-none"
                          style={{
                            gridTemplateRows: active ? "1fr" : "0fr",
                            opacity: active ? 1 : 0,
                            ...faqTransition("grid-template-rows, opacity"),
                          }}
                        >
                          <div
                            className={`overflow-hidden ${alignRight ? "text-right" : "text-left"}`}
                          >
                            {active && (
                              <p
                                key={`faq-answer-${i}`}
                                className={`font-sans faq-answer-enter text-base sm:text-lg leading-relaxed m-0 mt-5 lg:mt-7 max-w-xl text-[#3a3a3a] dark:text-white ${
                                  alignRight ? "ml-auto" : "mr-auto"
                                }`}
                              >
                                {a}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="sr-only">{q}</span>
                      </div>
                    </div>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
