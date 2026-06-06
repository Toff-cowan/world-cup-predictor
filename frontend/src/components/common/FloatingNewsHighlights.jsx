import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { matchesApi } from "../../api/matchesApi.js";
import TeamFlag from "../standings/TeamFlag.jsx";

const POLL_MS = 45_000;
const DISMISS_KEY = "wc_live_highlight_dismissed_ids";

function useIsMobile() {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return mobile;
}

function liveMatchKey(matches) {
  return matches
    .map((m) => m.id)
    .sort((a, b) => a - b)
    .join(",");
}

function formatKickoff(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function LiveMatchRow({ match }) {
  return (
    <li className="border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
      <div className="px-3 py-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden />
            Live
          </span>
          <span className="text-[10px] text-zinc-500 tabular-nums">{formatKickoff(match.kickoffAt)}</span>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <div className="flex flex-col items-center gap-1 min-w-0 text-center">
            <TeamFlag
              flagUrl={match.homeFlagUrl}
              countryCode={match.homeCountryCode}
              teamCode={match.homeTeamCode}
              className="w-8 h-5"
            />
            <span className="text-[11px] font-semibold truncate w-full">{match.homeTeamName}</span>
          </div>

          <span className="text-base font-bold tabular-nums shrink-0">
            {match.homeScore ?? 0}
            <span className="text-zinc-400 mx-0.5">–</span>
            {match.awayScore ?? 0}
          </span>

          <div className="flex flex-col items-center gap-1 min-w-0 text-center">
            <TeamFlag
              flagUrl={match.awayFlagUrl}
              countryCode={match.awayCountryCode}
              teamCode={match.awayTeamCode}
              className="w-8 h-5"
            />
            <span className="text-[11px] font-semibold truncate w-full">{match.awayTeamName}</span>
          </div>
        </div>

        <p className="text-[10px] text-zinc-500 m-0 mt-2 text-center truncate">
          {match.groupLetter ? `Group ${match.groupLetter}` : match.stage?.replace(/_/g, " ")}
          {match.venue ? ` · ${match.venue}` : ""}
        </p>
      </div>
    </li>
  );
}

export default function FloatingNewsHighlights() {
  const isMobile = useIsMobile();
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(true);
  const [dismissedKey, setDismissedKey] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) || "";
    } catch {
      return "";
    }
  });

  const currentKey = useMemo(() => liveMatchKey(liveMatches), [liveMatches]);
  const isDismissed = dismissedKey === currentKey && currentKey !== "";

  useEffect(() => {
    if (isMobile) setCollapsed(true);
  }, [isMobile]);

  useEffect(() => {
    let cancelled = false;

    function load() {
      matchesApi
        .all()
        .then((data) => {
          if (cancelled) return;
          const live = (data.matches || []).filter((m) => m.status === "live");
          setLiveMatches(live);
        })
        .catch(() => {
          if (!cancelled) setLiveMatches([]);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  function handleClose() {
    try {
      sessionStorage.setItem(DISMISS_KEY, currentKey);
    } catch {
      /* ignore */
    }
    setDismissedKey(currentKey);
  }

  if (loading || liveMatches.length === 0 || isDismissed) return null;

  return (
    <aside
      className={`fixed z-40 left-4 right-4 sm:left-auto sm:right-6 bottom-4 sm:bottom-6 sm:w-[min(calc(100vw-2rem),20rem)] pointer-events-none safe-bottom ${
        collapsed ? "" : "floating-news-panel"
      }`}
      aria-label="Live match highlights"
    >
      <div className="pointer-events-auto border border-zinc-200/90 dark:border-zinc-700/90 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-xl max-h-[min(45vh,320px)] sm:max-h-[min(55vh,380px)] flex flex-col">
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 m-0 inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden />
            Live now
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCollapsed((c) => !c)}
              className="min-h-[2.5rem] px-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-600 dark:text-white hover:text-zinc-900 dark:hover:text-white"
              aria-expanded={!collapsed}
            >
              {collapsed ? "Show" : "Hide"}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="min-h-[2.5rem] min-w-[2.5rem] flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              aria-label="Close live highlights"
            >
              ✕
            </button>
          </div>
        </div>

        {!collapsed && (
          <ul className="list-none m-0 p-0 overflow-y-auto flex-1 min-h-0">
            {liveMatches.map((match) => (
              <LiveMatchRow key={match.id} match={match} />
            ))}
          </ul>
        )}

        <Link
          to="/fixtures"
          className="flex items-center justify-center min-h-[2.75rem] text-center text-[10px] font-bold uppercase tracking-widest text-[#326295] dark:text-[#7eb3ff] hover:underline underline-offset-2 border-t border-zinc-200 dark:border-zinc-800 shrink-0"
        >
          All fixtures
        </Link>
      </div>
    </aside>
  );
}
