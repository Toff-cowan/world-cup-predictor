import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { matchesApi } from "../../api/matchesApi.js";
import { predictionsApi } from "../../api/predictionsApi.js";
import { teamsApi } from "../../api/teamsApi.js";
import AuthModal from "../../components/auth/AuthModal.jsx";
import BracketSelector from "../../components/predictions/BracketSelector.jsx";
import GroupStageEditor from "../../components/predictions/GroupStageEditor.jsx";
import KnockoutBracketEditor from "../../components/predictions/KnockoutBracketEditor.jsx";
import SimpleGroupStageEditor from "../../components/predictions/SimpleGroupStageEditor.jsx";
import SimpleKnockoutEditor from "../../components/predictions/SimpleKnockoutEditor.jsx";
import PredictionHelpTour, {
  shouldShowHelpOnLoad,
} from "../../components/predictions/PredictionHelpTour.jsx";
import PredictionTipBanner from "../../components/predictions/PredictionTipBanner.jsx";
import { STAGE_LABELS, STAGE_ORDER } from "../../constants/bracket.js";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  createEmptyBracket,
  isSimpleBracket,
  lockGroupInBracket,
  normalizeBracket,
  resyncBracketFromGroups,
  setBracketMode,
  setGroupMatchScore,
  setKnockoutMatchScore,
  setKnockoutWinner,
  setSimpleGroupRank,
} from "../../utils/bracketHelpers.js";
import { syncSimpleKnockoutFromGroups } from "../../utils/knockoutPopulation.js";
import {
  createLocalBracket,
  deleteLocalBracket,
  ensureDefaultLocalBracket,
  getLocalBracket,
  setActiveLocalBracket,
  updateLocalBracket,
} from "../../utils/localBrackets.js";
import ShareBracketPrompt from "../../components/predictions/ShareBracketPrompt.jsx";
import { getBracketShareStatus } from "../../utils/bracketShare.js";
import {
  getHelpTargetId,
  helpTargetProps,
  resolveHelpNavigation,
} from "../../utils/predictionHelp.js";

export default function PredictionsPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const isLocal = !isAuthenticated;

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
  const [authOpen, setAuthOpen] = useState(false);
  const saveTimer = useRef(null);
  const bracketRef = useRef(bracket);
  const predictionRef = useRef(prediction);
  const bracketCache = useRef(new Map());

  bracketRef.current = bracket;
  predictionRef.current = prediction;

  const helpHighlight = helpOpen ? getHelpTargetId(helpStep) : null;

  const isSimple = isSimpleBracket(bracket);
  const shareStatus = useMemo(() => getBracketShareStatus(bracket), [bracket]);

  const lockedStages = prediction?.locked_stages || [];
  const lockedGroups = bracket.locked_groups || [];
  const hasAnyLock =
    lockedStages.length > 0 || lockedGroups.length > 0 || prediction?.is_fully_locked;

  const isStageLocked = (stage) =>
    lockedStages.includes(stage) || prediction?.is_fully_locked;

  const applyPrediction = useCallback((pred, loadedTeams, loadedMatches) => {
    setPrediction(pred);
    setBracket(
      normalizeBracket(pred.bracket, {
        teams: loadedTeams,
        matches: loadedMatches,
      })
    );
    setError("");
  }, []);

  const persist = useCallback(
    async (predId, nextBracket) => {
      setSaving(true);
      try {
        if (isLocal) {
          const updated = updateLocalBracket(predId, { bracket: nextBracket });
          if (updated) {
            setPrediction(updated);
            setBrackets((list) => list.map((b) => (b.id === updated.id ? updated : b)));
          }
          return;
        }
        const data = await predictionsApi.update(predId, { bracket: nextBracket });
        setPrediction(data.prediction);
        bracketCache.current.set(data.prediction.id, data.prediction);
        setBrackets((list) =>
          list.map((b) => (b.id === data.prediction.id ? { ...b, ...data.prediction } : b))
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setSaving(false);
      }
    },
    [isLocal]
  );

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

  const loadLocalPrediction = useCallback(
    (id, loadedTeams, loadedMatches) => {
      const full = getLocalBracket(id);
      if (!full) return;
      setActiveLocalBracket(id);
      applyPrediction(full, loadedTeams, loadedMatches);
    },
    [applyPrediction]
  );

  const loadPrediction = useCallback(
    async (id, loadedTeams, loadedMatches) => {
      if (isLocal) {
        loadLocalPrediction(id, loadedTeams, loadedMatches);
        return;
      }

      const cached = bracketCache.current.get(id);
      if (cached?.bracket) {
        applyPrediction(cached, loadedTeams, loadedMatches);
        return;
      }

      const full = await predictionsApi.get(id);
      bracketCache.current.set(id, full.prediction);
      applyPrediction(full.prediction, loadedTeams, loadedMatches);
    },
    [isLocal, loadLocalPrediction, applyPrediction]
  );

  useEffect(() => {
    if (authLoading) return undefined;
    let cancelled = false;

    async function init() {
      try {
        const [teamsRes, matchesRes] = await Promise.all([
          teamsApi.all(),
          matchesApi.all().catch(() => ({ matches: [] })),
        ]);
        if (cancelled) return;

        const loadedTeams = teamsRes.teams || [];
        const loadedMatches = matchesRes.matches || [];
        setTeams(loadedTeams);
        setMatches(loadedMatches);

        if (isLocal) {
          const store = ensureDefaultLocalBracket();
          setBrackets(store.brackets);
          const active =
            store.brackets.find((b) => b.id === store.activeId) || store.brackets[0];
          applyPrediction(active, loadedTeams, loadedMatches);
        } else {
          const listRes = await predictionsApi.list();
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
        }

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

    setLoading(true);
    init();
    return () => {
      cancelled = true;
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [authLoading, isLocal, loadPrediction, applyPrediction]);

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

  useEffect(() => {
    if (tab !== "knockout" || !teams.length || isSimpleBracket(bracketRef.current)) return;
    setBracket((prev) => resyncBracketFromGroups(prev, teams, matches));
  }, [tab, teams, matches]);

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

  function setPredictorMode(mode) {
    updateBracket((prev) => {
      let next = setBracketMode(prev, mode);
      if (mode === "simple") {
        next.knockout = syncSimpleKnockoutFromGroups(next.knockout, next);
        setTab("group");
      } else if (teams.length) {
        next = resyncBracketFromGroups(next, teams, matches);
      }
      return next;
    });
  }

  function updateGroupScore(matchId, side, value, groupLetter) {
    setBracket((prev) => {
      if (prev.locked_groups?.includes(groupLetter)) return prev;
      const next = setGroupMatchScore(prev, matchId, side, value, teams, matches);
      queueSave(next);
      return next;
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
    if (String(id) === String(prediction?.id)) return;
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

  function handleLocalCreate() {
    const created = createLocalBracket(`Bracket ${brackets.length + 1}`);
    setBrackets((list) => [created, ...list]);
    applyPrediction(created, teams, matches);
  }

  function handleLocalRename(id, name) {
    const updated = updateLocalBracket(id, { name });
    if (!updated) return;
    if (prediction?.id === id) setPrediction(updated);
    setBrackets((list) => list.map((b) => (b.id === id ? updated : b)));
  }

  function handleLocalDelete(id) {
    const remaining = deleteLocalBracket(id);
    setBrackets(remaining);
    if (remaining.length > 0) {
      loadLocalPrediction(remaining[0].id, teams, matches);
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
    bracketCache.current.delete(deletedId);
    if (list.length > 0) {
      await loadPrediction(list[0].id, teams, matches);
    }
  }

  async function lockStage(stage) {
    if (!prediction?.id) return;
    if (isLocal) {
      const locked = new Set(prediction.locked_stages || []);
      locked.add(stage);
      const isFullyLocked = STAGE_ORDER.every((s) => locked.has(s));
      const updated = updateLocalBracket(prediction.id, {
        locked_stages: [...locked],
        is_fully_locked: isFullyLocked,
      });
      if (updated) {
        setPrediction(updated);
        setBrackets((list) => list.map((b) => (b.id === updated.id ? updated : b)));
      }
      return;
    }
    try {
      const data = await predictionsApi.lockStage(prediction.id, stage);
      setPrediction(data.prediction);
      bracketCache.current.set(data.prediction.id, data.prediction);
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
      if (isLocal) {
        let lockedStages = [...(prediction.locked_stages || [])];
        let nextBracket = { ...bracketRef.current };

        if (body.all) {
          lockedStages = [];
          nextBracket = { ...nextBracket, locked_groups: [] };
        } else {
          if (body.stage) {
            lockedStages = lockedStages.filter((s) => s !== body.stage);
          }
          if (body.group) {
            const letter = `${body.group}`.toUpperCase();
            nextBracket = {
              ...nextBracket,
              locked_groups: (nextBracket.locked_groups || []).filter((g) => g !== letter),
            };
          }
        }

        const isFullyLocked = STAGE_ORDER.every((s) => lockedStages.includes(s));
        const updated = updateLocalBracket(prediction.id, {
          locked_stages: lockedStages,
          is_fully_locked: isFullyLocked,
          bracket: nextBracket,
        });
        if (updated) {
          setPrediction(updated);
          setBracket(normalizeBracket(updated.bracket, { teams, matches }));
          setBrackets((list) => list.map((b) => (b.id === updated.id ? updated : b)));
        }
        setError("");
        return;
      }

      const data = await predictionsApi.unlock(prediction.id, body);
      setPrediction(data.prediction);
      bracketCache.current.set(data.prediction.id, data.prediction);
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

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0a0a0a] flex items-center justify-center">
        <p className="text-zinc-500 dark:text-white">Loading bracket…</p>
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
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#0a0a0a] text-zinc-900 dark:text-white">
      <section className="w-full bg-black text-white py-10 sm:py-12 lg:py-16 px-4">
        <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold uppercase tracking-tight text-center m-0">
          My Predictions
        </h1>
        {prediction?.name && (
          <p className="text-sm text-white/70 mt-2 text-center m-0">{prediction.name}</p>
        )}
        {isLocal && (
          <p className="text-xs text-white/50 mt-3 text-center m-0 max-w-md mx-auto">
            Saved on this device. Sign in when you want to share your bracket on the forum.
          </p>
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
            onCreateRequest={isLocal ? handleLocalCreate : undefined}
            onRenameRequest={isLocal ? handleLocalRename : undefined}
            onDeleteRequest={isLocal ? handleLocalDelete : undefined}
          />
          <div className="flex flex-wrap gap-2 shrink-0 self-start">
            <button
              type="button"
              onClick={openHelp}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wide border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-white hover:border-zinc-900 dark:hover:border-white"
            >
              How it works
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 order-2 sm:order-1">
            {switching && (
              <span className="text-xs text-zinc-500 dark:text-white/70">Loading bracket…</span>
            )}
            {saving && !switching && (
              <span className="text-xs text-zinc-500 dark:text-white/70">
                {isLocal ? "Saved locally" : "Saving…"}
              </span>
            )}
            {error && (
              <span className="text-xs text-red-500 dark:text-red-400">{error}</span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 order-1 sm:order-2">
            <div className="flex border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 p-1">
              <button
                type="button"
                onClick={() => setPredictorMode("full")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  !isSimple
                    ? "bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white"
                    : "text-zinc-600 dark:text-white/80 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Full
              </button>
              <button
                type="button"
                onClick={() => setPredictorMode("simple")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  isSimple
                    ? "bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white"
                    : "text-zinc-600 dark:text-white/80 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Simple
              </button>
            </div>

            <div className="flex border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 p-1">
              <button
                type="button"
                onClick={() => setTab("group")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  tab === "group"
                    ? "bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white"
                    : "text-zinc-600 dark:text-white/80 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                Group stage
              </button>
              <button
                type="button"
                onClick={() => setTab("knockout")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  tab === "knockout"
                    ? "bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white"
                    : "text-zinc-600 dark:text-white/80 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                {isSimple ? "Bracket" : "Knockout"}
              </button>
            </div>
          </div>
        </div>

        {(!isSimple || tab === "knockout") && (
        <div className="flex flex-col gap-3">
          <div
            className="mobile-scroll-x -mx-4 px-4 sm:mx-0 sm:px-0"
            {...helpTargetProps("help-stage-locks", helpHighlight)}
          >
            <div className="flex flex-nowrap sm:flex-wrap gap-2 min-w-min pb-1 sm:pb-0">
            {STAGE_ORDER.filter((stage) => stage !== "group").map((stage) => {
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
                      : "border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-white hover:border-zinc-900 dark:hover:border-white"
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
        )}

        {!isSimple && tab === "group" && (
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

        {!isSimple && tab === "knockout" && (
          <div>
            <PredictionTipBanner tab="knockout" />
            <KnockoutBracketEditor
              teams={teams}
              groups={bracket.groups}
              knockout={bracket.knockout}
              bracketName={prediction?.name}
              helpHighlight={helpHighlight}
              isStageLocked={isStageLocked}
              shareReady={shareStatus.ready}
              shareMessage={shareStatus.message}
              predictionId={prediction?.id}
              predictionName={prediction?.name}
              isAuthenticated={isAuthenticated}
              onSignIn={() => setAuthOpen(true)}
              onScore={(roundKey, matchIndex, side, value) =>
                updateBracket((b) =>
                  setKnockoutMatchScore(b, roundKey, matchIndex, side, value, teams, matches)
                )
              }
              onWinner={(roundKey, matchIndex, teamId) =>
                updateBracket((b) =>
                  setKnockoutWinner(b, roundKey, matchIndex, teamId, teams, matches)
                )
              }
            />
          </div>
        )}

        {isSimple && tab === "group" && (
          <div>
            <PredictionTipBanner tab="simple-group" />
            <SimpleGroupStageEditor
              teams={teams}
              groups={bracket.groups}
              isStageLocked={isStageLocked}
              onGroupRank={(group, teamId) =>
                updateBracket((b) => setSimpleGroupRank(b, group, teamId, teams, matches))
              }
              onContinueToBracket={() => setTab("knockout")}
            />
          </div>
        )}

        {isSimple && tab === "knockout" && (
          <div>
            <PredictionTipBanner tab="simple-knockout" />
            <SimpleKnockoutEditor
              teams={teams}
              groups={bracket.groups}
              knockout={bracket.knockout}
              bracketName={prediction?.name}
              isStageLocked={isStageLocked}
              shareReady={shareStatus.ready}
              shareMessage={shareStatus.message}
              predictionId={prediction?.id}
              predictionName={prediction?.name}
              isAuthenticated={isAuthenticated}
              onSignIn={() => setAuthOpen(true)}
              onWinner={(roundKey, matchIndex, teamId) =>
                updateBracket((b) =>
                  setKnockoutWinner(b, roundKey, matchIndex, teamId, teams, matches)
                )
              }
              onBackToGroups={() => setTab("group")}
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

      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        title="Sign in to share your bracket"
        message="Create a free account to post your predictions to the forum."
        onSuccess={() => {
          setAuthOpen(false);
          navigate("/forum/new", {
            state: {
              postType: "bracket",
              bracketId: prediction?.id,
              bracketName: prediction?.name,
            },
          });
        }}
      />
    </div>
  );
}
