import { useRef, useState, useEffect } from "react";
import { KNOCKOUT_ROUNDS, matchKey } from "../../constants/bracket.js";
import { getKnockoutMatchLabel } from "../../constants/knockoutBracket2026.js";
import { helpTargetProps } from "../../utils/predictionHelp.js";
import { getVisibleKnockoutMatchIndices, teamById } from "../../utils/bracketHelpers.js";
import { downloadElementScreenshot } from "../../utils/downloadScreenshot.js";
import KnockoutBracketView from "./KnockoutBracketView.jsx";
import MatchPredictionTable from "./MatchPredictionTable.jsx";

function TieBreaker({ match, locked, onWinner }) {
  if (!match.home || !match.away) return null;
  const hs = match.scores?.home;
  const as = match.scores?.away;
  if (hs == null || as == null || hs !== as) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500 dark:text-white/70">
        Winner after extra time / penalties
      </span>
      <button
        type="button"
        disabled={locked}
        onClick={() => onWinner(match.home)}
        className={`px-3 py-1 text-xs border transition-colors ${
          match.winner === match.home
            ? "bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white border-zinc-900 dark:border-white"
            : "border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-white hover:border-zinc-900 dark:hover:border-white"
        }`}
      >
        Home
      </button>
      <button
        type="button"
        disabled={locked}
        onClick={() => onWinner(match.away)}
        className={`px-3 py-1 text-xs border transition-colors ${
          match.winner === match.away
            ? "bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white border-zinc-900 dark:border-white"
            : "border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-white hover:border-zinc-900 dark:hover:border-white"
        }`}
      >
        Away
      </button>
    </div>
  );
}

export default function KnockoutBracketEditor({
  teams,
  groups,
  knockout,
  bracketName,
  isStageLocked,
  helpHighlight,
  onScore,
  onWinner,
}) {
  const [mode, setMode] = useState("view");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const bracketRef = useRef(null);

  useEffect(() => {
    if (helpHighlight === "help-knockout-edit") setMode("edit");
    if (helpHighlight === "help-knockout-view") setMode("view");
  }, [helpHighlight]);

  async function handleDownload() {
    const target = bracketRef.current;
    if (!target) {
      setDownloadError("Bracket not ready — try again in a moment.");
      return;
    }

    setDownloading(true);
    setDownloadError("");
    try {
      const safeName = (bracketName || "bracket").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
      await downloadElementScreenshot(target, `${safeName}-knockout.png`);
    } catch (err) {
      setDownloadError(err?.message || "Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-zinc-500 dark:text-white/70 m-0">
          {mode === "view"
            ? "Knockout teams are filled from your group-stage predictions (top two per group plus eight best third-place teams)."
            : "Enter scores only — Round of 32 pairings follow the official FIFA bracket and update from group results."}
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {mode === "view" && (
            <>
              <button
                type="button"
                disabled={downloading}
                onClick={handleDownload}
                className="w-full sm:w-auto min-h-[2.75rem] px-4 py-2 text-xs font-bold uppercase tracking-wide border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-white hover:border-zinc-900 dark:hover:border-white disabled:opacity-50"
              >
                {downloading ? "Preparing…" : "Download PNG"}
              </button>
              {downloadError && (
                <span className="text-xs text-red-500 dark:text-red-400 max-w-[14rem]">
                  {downloadError}
                </span>
              )}
            </>
          )}
          <div className="flex border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 p-1 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setMode("view")}
              className={`flex-1 sm:flex-none min-h-[2.75rem] px-4 py-2 text-sm font-medium transition-colors ${
                mode === "view"
                  ? "bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white"
                  : "text-zinc-600 dark:text-white/80 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Bracket view
            </button>
            <button
              type="button"
              onClick={() => setMode("edit")}
              className={`flex-1 sm:flex-none min-h-[2.75rem] px-4 py-2 text-sm font-medium transition-colors ${
                mode === "edit"
                  ? "bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white"
                  : "text-zinc-600 dark:text-white/80 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Edit scores
            </button>
          </div>
        </div>
      </div>

      {mode === "view" && (
        <div {...helpTargetProps("help-knockout-view", helpHighlight)}>
          <KnockoutBracketView
            ref={bracketRef}
            knockout={knockout}
            teams={teams}
            groups={groups}
            bracketName={bracketName}
          />
        </div>
      )}

      {mode === "edit" && (
        <div className="space-y-8" {...helpTargetProps("help-knockout-edit", helpHighlight)}>
          {KNOCKOUT_ROUNDS.map((round) => {
            const locked = isStageLocked(round.key);
            const matchIndices = getVisibleKnockoutMatchIndices(round, knockout);

            if (matchIndices.length === 0) {
              if (round.key === "round_of_32") {
                return (
                  <section
                    key={round.key}
                    className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-8 text-center"
                  >
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white m-0">{round.label}</h3>
                    <p className="text-sm text-zinc-500 dark:text-white/70 mt-2 m-0 max-w-lg mx-auto">
                      Enter group-stage scores first. The Round of 32 fills with group winners,
                      runners-up, and the eight best third-place teams per FIFA rules.
                    </p>
                  </section>
                );
              }
              return null;
            }

            const rows = matchIndices.map((idx) => {
              const mk = matchKey(idx);
              const match = knockout[round.key]?.[mk] || {
                home: null,
                away: null,
                winner: null,
                scores: { home: null, away: null },
              };
              const label = getKnockoutMatchLabel(round.key, idx);

              return {
                key: `${round.key}-${mk}`,
                label: label || mk,
                homeTeam: teamById(teams, match.home),
                awayTeam: teamById(teams, match.away),
                homeScore: match.scores?.home,
                awayScore: match.scores?.away,
                scoreDisabled: !match.home || !match.away,
                onHomeScoreChange: (value) => onScore(round.key, idx, "home_score", value),
                onAwayScoreChange: (value) => onScore(round.key, idx, "away_score", value),
                tieBreaker: (
                  <TieBreaker
                    match={match}
                    locked={locked}
                    onWinner={(teamId) => onWinner(round.key, idx, teamId)}
                  />
                ),
              };
            });

            return (
              <MatchPredictionTable
                key={round.key}
                title={round.label}
                rows={rows}
                locked={locked}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
