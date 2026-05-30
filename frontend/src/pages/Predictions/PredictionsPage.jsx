import { useCallback, useEffect, useRef, useState } from "react";
import { predictionsApi } from "../../api/predictionsApi.js";
import { teamsApi } from "../../api/teamsApi.js";
import GroupStageEditor from "../../components/predictions/GroupStageEditor.jsx";
import KnockoutBracketEditor from "../../components/predictions/KnockoutBracketEditor.jsx";
import { STAGE_LABELS, STAGE_ORDER } from "../../constants/bracket.js";
import {
  createEmptyBracket,
  normalizeBracket,
  setGroupPick,
  setKnockoutSide,
  setKnockoutWinner,
} from "../../utils/bracketHelpers.js";

export default function PredictionsPage() {
  const [teams, setTeams] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [bracket, setBracket] = useState(createEmptyBracket);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("group");
  const saveTimer = useRef(null);

  const lockedStages = prediction?.locked_stages || [];
  const groupLocked = lockedStages.includes("group");
  const isStageLocked = (stage) =>
    lockedStages.includes(stage) || prediction?.is_fully_locked;

  const persist = useCallback(async (predId, nextBracket) => {
    setSaving(true);
    try {
      const data = await predictionsApi.update(predId, { bracket: nextBracket });
      setPrediction(data.prediction);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }, []);

  const queueSave = useCallback(
    (nextBracket) => {
      if (!prediction?.id) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(prediction.id, nextBracket), 600);
    },
    [prediction?.id, persist]
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const [teamsRes, listRes] = await Promise.all([
          teamsApi.all(),
          predictionsApi.list(),
        ]);
        if (cancelled) return;

        setTeams(teamsRes.teams || []);

        let pred = listRes.predictions?.[0];
        if (!pred) {
          const created = await predictionsApi.create({
            name: "My Bracket",
            bracket: createEmptyBracket(),
          });
          pred = created.prediction;
        }

        const full = await predictionsApi.get(pred.id);
        if (cancelled) return;

        setPrediction(full.prediction);
        setBracket(normalizeBracket(full.prediction.bracket));
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  function updateBracket(updater) {
    setBracket((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      queueSave(next);
      return next;
    });
  }

  async function lockStage(stage) {
    if (!prediction?.id) return;
    try {
      const data = await predictionsApi.lockStage(prediction.id, stage);
      setPrediction(data.prediction);
    } catch (err) {
      setError(err.message);
    }
  }

  async function createNewBracket() {
    try {
      const data = await predictionsApi.create({
        name: `Bracket ${Date.now().toString(36)}`,
        bracket: createEmptyBracket(),
      });
      setPrediction(data.prediction);
      setBracket(createEmptyBracket());
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-zinc-500">Loading bracket…</p>
      </div>
    );
  }

  if (error && !prediction) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0a0a0a] p-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100">
      <section className="w-full bg-black text-white py-10 lg:py-12">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight m-0">
            My Predictions
          </h1>
          <p className="text-sm text-white/70 mt-2 m-0">{prediction?.name}</p>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-12 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 p-1">
            <button
              type="button"
              onClick={() => setTab("group")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === "group"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Group stage
            </button>
            <button
              type="button"
              onClick={() => setTab("knockout")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                tab === "knockout"
                  ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                  : "text-zinc-600 dark:text-zinc-400"
              }`}
            >
              Knockout
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {saving && <span className="text-xs text-zinc-500">Saving…</span>}
            {error && <span className="text-xs text-red-500">{error}</span>}
            <button
              type="button"
              onClick={createNewBracket}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wide bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
            >
              New bracket
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {STAGE_ORDER.map((stage) => {
            const locked = lockedStages.includes(stage);
            return (
              <button
                key={stage}
                type="button"
                disabled={locked || prediction?.is_fully_locked}
                onClick={() => lockStage(stage)}
                className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide border ${
                  locked
                    ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
                    : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-900 dark:hover:border-white"
                } disabled:opacity-40`}
              >
                {locked ? "✓ " : ""}
                {STAGE_LABELS[stage]}
              </button>
            );
          })}
        </div>

        {tab === "group" && (
          <GroupStageEditor
            teams={teams}
            groups={bracket.groups}
            locked={groupLocked || prediction?.is_fully_locked}
            onPick={(group, slot, teamId) =>
              updateBracket((b) => setGroupPick(b, group, slot, teamId))
            }
          />
        )}

        {tab === "knockout" && (
          <KnockoutBracketEditor
            teams={teams}
            knockout={bracket.knockout}
            isStageLocked={isStageLocked}
            onSide={(roundKey, matchIndex, side, teamId) =>
              updateBracket((b) => setKnockoutSide(b, roundKey, matchIndex, side, teamId))
            }
            onWinner={(roundKey, matchIndex, teamId) =>
              updateBracket((b) => setKnockoutWinner(b, roundKey, matchIndex, teamId))
            }
          />
        )}
      </div>
    </div>
  );
}
