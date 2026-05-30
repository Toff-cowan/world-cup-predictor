import { useRef, useState, useEffect } from "react";
import { KNOCKOUT_ROUNDS, matchKey } from "../../constants/bracket.js";
import { helpTargetProps } from "../../utils/predictionHelp.js";
import { teamById } from "../../utils/bracketHelpers.js";
import { downloadElementScreenshot } from "../../utils/downloadScreenshot.js";
import KnockoutBracketView from "./KnockoutBracketView.jsx";
import MatchPredictionTable from "./MatchPredictionTable.jsx";
import TeamPicker from "./TeamPicker.jsx";

function TieBreaker({ match, locked, onWinner }) {
  if (!match.home || !match.away) return null;
  const hs = match.scores?.home;
  const as = match.scores?.away;
  if (hs == null || as == null || hs !== as) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500">
        Winner after extra time / penalties
      </span>
      <button
        type="button"
        disabled={locked}
        onClick={() => onWinner(match.home)}
        className={`px-3 py-1 text-xs border transition-colors ${
          match.winner === match.home
            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
            : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-900 dark:hover:border-white"
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
            ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
            : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-900 dark:hover:border-white"
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
  onSide,
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
        <p className="text-sm text-zinc-500 dark:text-zinc-400 m-0">
          {mode === "view"
            ? "Bracket view — your predicted path to the final."
            : "Edit mode — pick teams and enter Home / Away scores."}
        </p>
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {mode === "view" && (
            <>
              <button
                type="button"
                disabled={downloading}
                onClick={handleDownload}
                className="w-full sm:w-auto min-h-[2.75rem] px-4 py-2 text-xs font-bold uppercase tracking-wide border border-zinc-300 dark:border-zinc-600 hover:border-zinc-900 dark:hover:border-white disabled:opacity-50"
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
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              Bracket view
            </button>
            <button
              type="button"
              onClick={() => setMode("edit")}
              className={`flex-1 sm:flex-none min-h-[2.75rem] px-4 py-2 text-sm font-medium transition-colors ${
                mode === "edit"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
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
        <div
          className="grid grid-cols-1 xl:grid-cols-2 gap-6"
          {...helpTargetProps("help-knockout-edit", helpHighlight)}
        >
          {KNOCKOUT_ROUNDS.map((round) => {
            const locked = isStageLocked(round.key);
            const canPickTeams = round.key === "round_of_32";

            const rows = Array.from({ length: round.count }, (_, i) => {
              const idx = i + 1;
              const mk = matchKey(idx);
              const match = knockout[round.key]?.[mk] || {
                home: null,
                away: null,
                winner: null,
                scores: { home: null, away: null },
              };
              const homeTeam = teamById(teams, match.home);
              const awayTeam = teamById(teams, match.away);

              return {
                key: `${round.key}-${mk}`,
                label: mk,
                homeTeam,
                awayTeam,
                homeScore: match.scores?.home,
                awayScore: match.scores?.away,
                scoreDisabled: !match.home || !match.away,
                onHomeScoreChange: (value) => onScore(round.key, idx, "home_score", value),
                onAwayScoreChange: (value) => onScore(round.key, idx, "away_score", value),
                homePicker: canPickTeams ? (
                  <TeamPicker
                    teams={teams}
                    value={match.home}
                    disabled={locked}
                    excludeIds={match.away ? [match.away] : []}
                    onChange={(id) => onSide(round.key, idx, "home", id)}
                    placeholder="Home team"
                  />
                ) : undefined,
                awayPicker: canPickTeams ? (
                  <TeamPicker
                    teams={teams}
                    value={match.away}
                    disabled={locked}
                    excludeIds={match.home ? [match.home] : []}
                    onChange={(id) => onSide(round.key, idx, "away", id)}
                    placeholder="Away team"
                  />
                ) : undefined,
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
