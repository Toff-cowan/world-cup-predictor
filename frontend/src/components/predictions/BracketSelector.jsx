import { useEffect, useRef, useState } from "react";
import { predictionsApi } from "../../api/predictionsApi.js";
import { createEmptyBracket } from "../../utils/bracketHelpers.js";

export default function BracketSelector({
  brackets,
  activeId,
  activeName,
  onSelect,
  onCreated,
  onRenamed,
  onDeleted,
  disabled,
}) {
  const [nameDraft, setNameDraft] = useState(activeName || "");
  const [creating, setCreating] = useState(false);
  const renameTimer = useRef(null);

  useEffect(() => {
    setNameDraft(activeName || "");
  }, [activeName, activeId]);

  function queueRename(value) {
    if (!activeId || !value.trim()) return;
    if (renameTimer.current) clearTimeout(renameTimer.current);
    renameTimer.current = setTimeout(async () => {
      try {
        const data = await predictionsApi.update(activeId, { name: value.trim() });
        onRenamed?.(data.prediction);
      } catch {
        /* parent shows errors */
      }
    }, 500);
  }

  async function handleCreate() {
    setCreating(true);
    try {
      const data = await predictionsApi.create({
        name: `Bracket ${brackets.length + 1}`,
        bracket: createEmptyBracket(),
      });
      onCreated?.(data.prediction);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!activeId || brackets.length <= 1) return;
    if (!window.confirm("Delete this bracket? This cannot be undone.")) return;
    await predictionsApi.remove(activeId);
    onDeleted?.(activeId);
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-end gap-4 p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700">
      <div className="flex-1 min-w-0 space-y-3">
        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Bracket name
          </span>
          <input
            type="text"
            value={nameDraft}
            disabled={disabled || !activeId}
            onChange={(e) => {
              setNameDraft(e.target.value);
              queueRename(e.target.value);
            }}
            placeholder="Name your bracket"
            className="mt-1 w-full text-sm font-medium bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 px-3 py-2 disabled:opacity-50"
          />
        </label>

        <label className="block">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Select bracket
          </span>
          <select
            value={activeId ?? ""}
            disabled={disabled}
            onChange={(e) => onSelect(Number(e.target.value))}
            className="mt-1 w-full text-sm font-medium bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 px-3 py-2 disabled:opacity-50"
          >
            {brackets.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 shrink-0">
        <button
          type="button"
          disabled={disabled || creating}
          onClick={handleCreate}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wide bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 disabled:opacity-50"
        >
          {creating ? "Creating…" : "New bracket"}
        </button>
        <button
          type="button"
          disabled={disabled || brackets.length <= 1}
          onClick={handleDelete}
          className="px-4 py-2 text-xs font-bold uppercase tracking-wide border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-red-500 hover:text-red-500 disabled:opacity-40"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
