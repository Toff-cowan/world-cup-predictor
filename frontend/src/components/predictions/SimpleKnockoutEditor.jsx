import { useRef, useState } from "react";
import { downloadElementScreenshot } from "../../utils/downloadScreenshot.js";
import { countSimpleGroupsComplete } from "../../utils/bracketHelpers.js";
import SimpleKnockoutBracket from "./SimpleKnockoutBracket.jsx";
import ShareBracketPrompt from "./ShareBracketPrompt.jsx";

export default function SimpleKnockoutEditor({
  teams,
  groups,
  knockout,
  bracketName,
  isStageLocked,
  shareReady,
  shareMessage,
  predictionId,
  predictionName,
  isAuthenticated,
  onSignIn,
  onWinner,
  onBackToGroups,
}) {
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const bracketRef = useRef(null);

  const groupsComplete = countSimpleGroupsComplete(groups);
  const remaining = 12 - groupsComplete;

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
      await downloadElementScreenshot(target, `${safeName}-simple-knockout.png`);
    } catch (err) {
      setDownloadError(err?.message || "Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-zinc-500 dark:text-white/70 m-0 max-w-xl">
            Tap the team you think wins each match. Winners advance through the tree automatically.
          </p>
          <button
            type="button"
            onClick={onBackToGroups}
            className="self-start text-xs font-bold uppercase tracking-wide text-zinc-600 dark:text-white/80 hover:text-zinc-900 dark:hover:text-white"
          >
            ← Edit group stage
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={downloading}
            onClick={handleDownload}
            className="min-h-[2.75rem] px-4 py-2 text-xs font-bold uppercase tracking-wide border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-white hover:border-zinc-900 dark:hover:border-white disabled:opacity-50"
          >
            {downloading ? "Preparing…" : "Download PNG"}
          </button>
          {downloadError && (
            <span className="text-xs text-red-500 dark:text-red-400 max-w-[14rem]">
              {downloadError}
            </span>
          )}
        </div>
      </div>

      {remaining > 0 && (
        <div className="p-4 border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/30 text-sm text-amber-900 dark:text-amber-200">
          {remaining} group{remaining === 1 ? "" : "s"} still incomplete — some Round of 32 slots
          will show TBD until every group is ranked.
        </div>
      )}

      <SimpleKnockoutBracket
        ref={bracketRef}
        knockout={knockout}
        teams={teams}
        groups={groups}
        bracketName={bracketName}
        isStageLocked={isStageLocked}
        onWinner={onWinner}
      />

      <ShareBracketPrompt
        ready={shareReady}
        message={shareMessage}
        predictionId={predictionId}
        predictionName={predictionName}
        isAuthenticated={isAuthenticated}
        onSignIn={onSignIn}
      />
    </div>
  );
}
