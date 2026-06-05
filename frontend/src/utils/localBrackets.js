import { createEmptyBracket } from "./bracketHelpers.js";

const STORAGE_KEY = "wc_local_brackets";

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { brackets: [], activeId: null };
    const parsed = JSON.parse(raw);
    return {
      brackets: Array.isArray(parsed.brackets) ? parsed.brackets : [],
      activeId: parsed.activeId ?? null,
    };
  } catch {
    return { brackets: [], activeId: null };
  }
}

function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function newLocalId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function listLocalBrackets() {
  return readStore().brackets;
}

export function getLocalBracket(id) {
  return readStore().brackets.find((b) => b.id === id) || null;
}

export function ensureDefaultLocalBracket() {
  const store = readStore();
  if (store.brackets.length === 0) {
    const bracket = {
      id: newLocalId(),
      name: "My Bracket",
      bracket: createEmptyBracket(),
      locked_stages: [],
      is_fully_locked: false,
      share_token: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.brackets = [bracket];
    store.activeId = bracket.id;
    writeStore(store);
  }
  return store;
}

export function setActiveLocalBracket(id) {
  const store = readStore();
  store.activeId = id;
  writeStore(store);
}

export function createLocalBracket(name = "My Bracket", bracketData = null) {
  const store = readStore();
  const bracket = {
    id: newLocalId(),
    name,
    bracket: bracketData || createEmptyBracket(),
    locked_stages: [],
    is_fully_locked: false,
    share_token: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  store.brackets.unshift(bracket);
  store.activeId = bracket.id;
  writeStore(store);
  return bracket;
}

export function copySharedToLocal(sharedPrediction, name) {
  let bracketData = sharedPrediction.bracket;
  if (typeof bracketData === "string") {
    try {
      bracketData = JSON.parse(bracketData);
    } catch {
      bracketData = createEmptyBracket();
    }
  }
  if (bracketData && typeof bracketData === "object") {
    bracketData = { ...bracketData, locked_groups: [] };
  }
  const copyName = name || `${sharedPrediction.name} (copy)`;
  return createLocalBracket(copyName, bracketData || createEmptyBracket());
}

export function updateLocalBracket(id, patch) {
  const store = readStore();
  const idx = store.brackets.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  const next = {
    ...store.brackets[idx],
    ...patch,
    updated_at: new Date().toISOString(),
  };
  store.brackets[idx] = next;
  writeStore(store);
  return next;
}

export function deleteLocalBracket(id) {
  const store = readStore();
  store.brackets = store.brackets.filter((b) => b.id !== id);
  if (store.activeId === id) {
    store.activeId = store.brackets[0]?.id ?? null;
  }
  writeStore(store);
  return store.brackets;
}

export function clearLocalBrackets() {
  localStorage.removeItem(STORAGE_KEY);
}

export async function syncLocalBracketsToServer(predictionsApi) {
  const store = readStore();
  if (store.brackets.length === 0) return [];

  const synced = [];
  for (const local of store.brackets) {
    const data = await predictionsApi.create({
      name: local.name,
      bracket: local.bracket,
    });
    synced.push(data.prediction);
  }
  clearLocalBrackets();
  return synced;
}
