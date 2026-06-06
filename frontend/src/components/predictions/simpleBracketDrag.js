export const SIMPLE_DRAG_TYPE = "application/x-wc-team-id";

export function readDragTeamId(dataTransfer) {
  const raw = dataTransfer.getData(SIMPLE_DRAG_TYPE);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isNaN(id) ? null : id;
}
