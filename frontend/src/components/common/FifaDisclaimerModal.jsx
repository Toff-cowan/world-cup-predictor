import { useEffect, useState } from "react";

const STORAGE_KEY = "wc2026-fifa-disclaimer-v1";
const FIFA_URL = "https://www.fifa.com/en";

export default function FifaDisclaimerModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        setOpen(true);
      }
    } catch {
      setOpen(true);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fifa-disclaimer-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Dismiss disclaimer"
        onClick={dismiss}
      />

      <div className="relative w-full max-w-lg max-h-[min(90vh,90dvh)] overflow-y-auto border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 shadow-2xl animate-[disclaimer-in_0.45s_cubic-bezier(0.16,1,0.3,1)_both] safe-bottom">
        <div
          className="h-1.5 w-full"
          style={{
            background:
              "linear-gradient(90deg, #326295 0%, #00a651 35%, #ffd100 70%, #e4002b 100%)",
          }}
          aria-hidden
        />

        <div className="px-6 sm:px-8 pt-7 pb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 m-0">
            Before you explore
          </p>
          <h2
            id="fifa-disclaimer-title"
            className="text-xl sm:text-2xl font-bold tracking-tight mt-2 m-0 text-zinc-900 dark:text-zinc-50"
          >
            Fan project — not an official FIFA product
          </h2>

          <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-4 m-0 leading-relaxed">
            Match data, standings, and news on this site are{" "}
            <strong className="font-semibold text-zinc-800 dark:text-zinc-100">
              aggregated from public FIFA sources
            </strong>{" "}
            for prediction and fan use only. They are not official records and should not be
            treated as authoritative or used as original published content.
          </p>

          <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-3 m-0 leading-relaxed">
            For verified news, schedules, and tournament information, always refer to the source:
          </p>

          <a
            href={FIFA_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex items-center justify-between gap-4 group border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/80 px-4 py-3.5 hover:border-[#326295] dark:hover:border-[#5a8fd4] transition-colors"
          >
            <span className="min-w-0">
              <span className="block text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                Official source
              </span>
              <span className="block text-base font-bold text-[#326295] dark:text-[#7eb3ff] mt-0.5 truncate group-hover:underline underline-offset-4">
                FIFA.com →
              </span>
            </span>
            <span
              className="shrink-0 w-10 h-10 flex items-center justify-center text-lg font-black text-white"
              style={{ background: "linear-gradient(135deg, #326295, #00a651)" }}
              aria-hidden
            >
              F
            </span>
          </a>

          <button
            type="button"
            onClick={dismiss}
            className="mt-6 w-full py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-sm font-bold hover:opacity-90 transition-opacity"
          >
            I understand — continue
          </button>
        </div>
      </div>
    </div>
  );
}
