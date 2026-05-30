import { useCallback, useEffect, useRef, useState } from "react";
import { matchesApi } from "../../api/matchesApi.js";
import { predictionsApi } from "../../api/predictionsApi.js";
import { teamsApi } from "../../api/teamsApi.js";
import BracketSelector from "../../components/predictions/BracketSelector.jsx";
import GroupStageEditor from "../../components/predictions/GroupStageEditor.jsx";
import KnockoutBracketEditor from "../../components/predictions/KnockoutBracketEditor.jsx";
import PredictionHelpTour, {
  shouldShowHelpOnLoad,
} from "../../components/predictions/PredictionHelpTour.jsx";
import PredictionTipBanner from "../../components/predictions/PredictionTipBanner.jsx";
import { STAGE_LABELS, STAGE_ORDER } from "../../constants/bracket.js";
import {
  createEmptyBracket,
  lockGroupInBracket,
  normalizeBracket,
  setGroupMatchScore,
  setKnockoutMatchScore,
  setKnockoutSide,
  setKnockoutWinner,
} from "../../utils/bracketHelpers.js";
import {
  getHelpTargetId,
  helpTargetProps,
  resolveHelpNavigation,
} from "../../utils/predictionHelp.js";

export default function PredictionsPage() {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [brackets, setBrackets] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [bracket, setBracket] = useState(createEmptyBracket);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("group");
  const [helpOpen, setHelpOpen] = useState(false);
  const [helpStep, setHelpStep] = useState(0);
  const [savingGroup, setSavingGroup] = useState(false);
  const saveTimer = useRef(null);
  const bracketRef = useRef(bracket);
  const predictionRef = useRef(prediction);

  bracketRef.current = bracket;
  predictionRef.current = prediction;

  const helpHighlight = helpOpen ? getHelpTargetId(helpStep) : null;

  const lockedStages = prediction?.locked_stages || [];
  const lockedGroups = bracket.locked_groups || [];
  const hasAnyLock =
    lockedStages.length > 0 || lockedGroups.length > 0 || prediction?.is_fully_locked;

  const isStageLocked = (stage) =>
    lockedStages.includes(stage) || prediction?.is_fully_locked;

  const persist = useCallback(async (predId, nextBracket) => {
    setSaving(true);
    try {
      const data = await predictionsApi.update(predId, { bracket: nextBracket });
      setPrediction(data.prediction);
      setBrackets((list) =>
        list.map((b) => (b.id === data.prediction.id ? { ...b, ...data.prediction } : b))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }, []);

  const flushSave = useCallback(async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const pred = predictionRef.current;
    if (pred?.id) {
      await persist(pred.id, bracketRef.current);
    }
  }, [persist]);

  const queueSave = useCallback(
    (nextBracket) => {
      if (!prediction?.id) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => persist(prediction.id, nextBracket), 600);
    },
    [prediction?.id, persist]
  );

  const loadPrediction = useCallback(
    async (id, loadedTeams, loadedMatches) => {
      const full = await predictionsApi.get(id);
      setPrediction(full.prediction);
      setBracket(
        normalizeBracket(full.prediction.bracket, {
          teams: loadedTeams,
          matches: loadedMatches,
        })
      );
      setError("");
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const [teamsRes, matchesRes, listRes] = await Promise.all([
          teamsApi.all(),
          matchesApi.all().catch(() => ({ matches: [] })),
          predictionsApi.list(),
        ]);
        if (cancelled) return;

        const loadedTeams = teamsRes.teams || [];
        const loadedMatches = matchesRes.matches || [];
        setTeams(loadedTeams);
        setMatches(loadedMatches);

        let list = listRes.predictions || [];
        if (list.length === 0) {
          const created = await predictionsApi.create({
            name: "My Bracket",
            bracket: createEmptyBracket(),
          });
          list = [created.prediction];
        }

        setBrackets(list);
        await loadPrediction(list[0].id, loadedTeams, loadedMatches);

        if (shouldShowHelpOnLoad()) {
          setHelpStep(0);
          setHelpOpen(true);
        }
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
  }, [loadPrediction]);

  useEffect(() => {
    if (!helpHighlight) return;
    const nav = resolveHelpNavigation(helpHighlight);
    if (nav.tab) setTab(nav.tab);
    const timer = window.setTimeout(() => {
      document
        .querySelector(`[data-help-id="${helpHighlight}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);
    return () => window.clearTimeout(timer);
  }, [helpHighlight]);

  function openHelp() {
    setHelpStep(0);
    setHelpOpen(true);
  }

  function closeHelp() {
    setHelpOpen(false);
    setHelpStep(0);
  }

  function updateBracket(updater) {
    setBracket((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      queueSave(next);
      return next;
    });
  }

  function updateGroupScore(matchId, side, value, groupLetter) {
    setBracket((prev) => {
      if (prev.locked_groups?.includes(groupLetter)) return prev;
      return setGroupMatchScore(prev, matchId, side, value, teams, matches);
    });
  }

  async function saveGroup(groupLetter) {
    if (!prediction?.id || bracket.locked_groups?.includes(groupLetter)) return;
    setSavingGroup(true);
    try {
      const next = lockGroupInBracket(bracketRef.current, groupLetter);
      setBracket(next);
      await persist(prediction.id, next);
    } catch (err) {
      setError(err.message);
    } finally {
      setSavingGroup(false);
    }
  }

  async function handleSelectBracket(id) {
    if (id === prediction?.id) return;
    setSwitching(true);
    try {
      await flushSave();
      await loadPrediction(id, teams, matches);
    } catch (err) {
      setError(err.message);
    } finally {
      setSwitching(false);
    }
  }

  async function handleCreated(pred) {
    await flushSave();
    const listRes = await predictionsApi.list();
    setBrackets(listRes.predictions || []);
    await loadPrediction(pred.id, teams, matches);
  }

  function handleRenamed(pred) {
    setPrediction(pred);
    setBrackets((list) => list.map((b) => (b.id === pred.id ? { ...b, name: pred.name } : b)));
  }

  async function handleDeleted(deletedId) {
    const listRes = await predictionsApi.list();
    const list = listRes.predictions || [];
    setBrackets(list);
    if (list.length > 0) {
      await loadPrediction(list[0].id, teams, matches);
    }
  }

  async function lockStage(stage) {
    if (!prediction?.id) return;
    try {
      const data = await predictionsApi.lockStage(prediction.id, stage);
      setPrediction(data.prediction);
      setBrackets((list) =>
        list.map((b) => (b.id === data.prediction.id ? { ...b, ...data.prediction } : b))
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function applyUnlock(body) {
    if (!prediction?.id) return;
    setSaving(true);
    try {
      const data = await predictionsApi.unlock(prediction.id, body);
      setPrediction(data.prediction);
      setBracket(
        normalizeBracket(data.prediction.bracket, {
          teams,
          matches,
        })
      );
      setBrackets((list) =>
        list.map((b) => (b.id === data.prediction.id ? { ...b, ...data.prediction } : b))
      );
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function unlockStage(stage) {
    return applyUnlock({ stage });
  }

  function unlockGroup(groupLetter) {
    return applyUnlock({ group: groupLetter });
  }

  function unlockEntireBracket() {
    return applyUnlock({ all: true });
  }

  function toggleStageLock(stage) {
    if (lockedStages.includes(stage)) {
      unlockStage(stage);
    } else {
      lockStage(stage);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400">Loading bracket…</p>
      </div>
    );
  }

  if (error && !prediction) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0a0a0a] p-8">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-100">
      <section className="w-full bg-black text-white py-10 sm:py-12 lg:py-16 px-4">
        <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-center m-0">
          My Predictions
        </h1>
        {prediction?.name && (
          <p className="text-sm text-white/70 mt-2 text-center m-0">{prediction.name}</p>
        )}
      </section>

      <div className="w-full max-w-none mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 pb-10 pt-6 sm:pt-8 space-y-5 sm:space-y-6">
        <div
          className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
          {...helpTargetProps("help-brackets", helpHighlight)}
        >
          <BracketSelector
            brackets={brackets}
            activeId={prediction?.id}
            activeName={prediction?.name}
            disabled={switching || saving}
            onSelect={handleSelectBracket}
            onCreated={handleCreated}
            onRenamed={handleRenamed}
            onDeleted={handleDeleted}
          />
          <button
            type="button"
            onClick={openHelp}
            className="shrink-0 px-4 py-2 text-xs font-bold uppercase tracking-wide border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-zinc-900 dark:hover:border-white self-start"
          >
            How it works
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 order-2 sm:order-1">
            {switching && <span className="text-xs text-zinc-500">Loading bracket…</span>}
            {saving && !switching && <span className="text-xs text-zinc-500">Saving…</span>}
            {error && (
              <span className="text-xs text-red-500 dark:text-red-400">{error}</span>
            )}
          </div>

          <div
            className="flex justify-end order-1 sm:order-2"
            {...helpTargetProps("help-stage-tabs", helpHighlight)}
          >
            <div className="flex border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 p-1">
              <button
                type="button"
                onClick={() => setTab("group")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  tab === "group"
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
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
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Knockout
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div
            className="mobile-scroll-x -mx-4 px-4 sm:mx-0 sm:px-0"
            {...helpTargetProps("help-stage-locks", helpHighlight)}
          >
            <div className="flex flex-nowrap sm:flex-wrap gap-2 min-w-min pb-1 sm:pb-0">
            {STAGE_ORDER.map((stage) => {
              const locked = lockedStages.includes(stage);
              return (
                <button
                  key={stage}
                  type="button"
                  disabled={saving}
                  onClick={() => toggleStageLock(stage)}
                  title={
                    locked
                      ? `Unlock ${STAGE_LABELS[stage]} to edit again`
                      : `Lock ${STAGE_LABELS[stage]}`
                  }
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide border transition-colors ${
                    locked
                      ? "border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:border-amber-600 hover:text-amber-700 dark:hover:text-amber-400"
                      : "border-zinc-300 dark:border-zinc-600 hover:border-zinc-900 dark:hover:border-white"
                  } disabled:opacity-40`}
                >
                  {locked ? "✓ " : ""}
                  {STAGE_LABELS[stage]}
                  {locked && <span className="sr-only"> (locked — click to unlock)</span>}
                </button>
              );
            })}
            </div>
          </div>
          {hasAnyLock && (
            <button
              type="button"
              disabled={saving}
              onClick={unlockEntireBracket}
              className="w-full sm:w-auto shrink-0 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide border border-amber-600 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 disabled:opacity-40"
            >
              Unlock entire bracket
            </button>
          )}
        </div>

        {tab === "group" && (
          <div {...helpTargetProps("help-group-stage", helpHighlight)}>
            <PredictionTipBanner tab="group" />
            <GroupStageEditor
              teams={teams}
              matches={matches}
              bracket={bracket}
              savingGroup={savingGroup}
              unlockingGroup={saving}
              onSaveGroup={saveGroup}
              onUnlockGroup={unlockGroup}
              onScore={(matchId, side, value, groupLetter) =>
                updateGroupScore(matchId, side, value, groupLetter)
              }
            />
          </div>
        )}

        {tab === "knockout" && (
          <div>
            <PredictionTipBanner tab="knockout" />
            <KnockoutBracketEditor
              teams={teams}
              groups={bracket.groups}
              knockout={bracket.knockout}
              bracketName={prediction?.name}
              helpHighlight={helpHighlight}
              isStageLocked={isStageLocked}
              onSide={(roundKey, matchIndex, side, teamId) =>
                updateBracket((b) => setKnockoutSide(b, roundKey, matchIndex, side, teamId))
              }
              onScore={(roundKey, matchIndex, side, value) =>
                updateBracket((b) =>
                  setKnockoutMatchScore(b, roundKey, matchIndex, side, value)
                )
              }
              onWinner={(roundKey, matchIndex, teamId) =>
                updateBracket((b) => setKnockoutWinner(b, roundKey, matchIndex, teamId))
              }
            />
          </div>
        )}
      </div>

      <PredictionHelpTour
        open={helpOpen}
        stepIndex={helpStep}
        onStepChange={setHelpStep}
        onClose={closeHelp}
      />
    </div>
  );
}
