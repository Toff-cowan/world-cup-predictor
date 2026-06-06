import { countSimpleGroupsComplete } from "../../utils/bracketHelpers.js";
import SimpleGroupQualifiers from "./SimpleGroupQualifiers.jsx";

export default function SimpleGroupStageEditor({
  teams,
  groups,
  isStageLocked,
  onGroupRank,
  onContinueToBracket,
}) {
  const groupsComplete = countSimpleGroupsComplete(groups);
  const remaining = 12 - groupsComplete;

  return (
    <div className="space-y-6 pb-12">
      <p className="text-sm text-zinc-500 dark:text-white/70 m-0 max-w-2xl">
        Click teams in each group to rank them 1st through 4th. Top 2 plus the best 8 third-place
        teams will fill the official Round of 32 when you move to the bracket.
      </p>

      <SimpleGroupQualifiers
        teams={teams}
        groups={groups}
        onRank={onGroupRank}
        disabled={isStageLocked("round_of_32")}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-zinc-200 dark:border-zinc-700">
        {remaining > 0 ? (
          <p className="text-sm text-zinc-500 dark:text-white/70 m-0">
            Complete all 12 groups ({remaining} remaining) to unlock the full bracket.
          </p>
        ) : (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium m-0">
            All groups ranked — your Round of 32 is ready.
          </p>
        )}
        <button
          type="button"
          onClick={onContinueToBracket}
          disabled={remaining > 0}
          className="min-h-[2.75rem] px-5 py-2 text-xs font-bold uppercase tracking-wide bg-zinc-900 dark:bg-zinc-800 text-white disabled:opacity-40 shrink-0"
        >
          Continue to bracket
        </button>
      </div>
    </div>
  );
}
