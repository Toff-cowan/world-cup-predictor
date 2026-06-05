export const HELP_SECTIONS = [
  {
    title: "Your brackets",
    targetId: "help-brackets",
    body: "Create multiple named brackets to compare scenarios — e.g. “Optimistic”, “Realistic”, or “Chaos”. Use the dropdown to switch between them.",
  },
  {
    title: "Group stage",
    targetId: "help-group-stage",
    body: "Pick a group (A–L), enter Home and Away scores for each match, then Save group to lock your picks. Use Unlock group if you need to change them later.",
  },
  {
    title: "Knockout — Edit mode",
    targetId: "help-knockout-edit",
    body: "Knockout teams fill automatically from group-stage results. Enter scores for each round — winners advance through the official FIFA bracket.",
  },
  {
    title: "Knockout — Bracket view",
    targetId: "help-knockout-view",
    body: "Switch to Bracket view for a full tournament tree on a white background. Use Download image to save a PNG screenshot.",
  },
  {
    title: "Lock stages",
    targetId: "help-stage-locks",
    body: "Lock a stage when the real tournament reaches it. Locked stages show a green checkmark — click again to unlock and edit.",
  },
];

export const HELP_TARGETS = {
  BRACKETS: "help-brackets",
  STAGE_TABS: "help-stage-tabs",
  GROUP_STAGE: "help-group-stage",
  KNOCKOUT_EDIT: "help-knockout-edit",
  KNOCKOUT_VIEW: "help-knockout-view",
  STAGE_LOCKS: "help-stage-locks",
};

/** Ring highlight for in-page help targets (above overlay at z-100). */
export function helpTargetProps(targetId, activeId) {
  const active = activeId === targetId;
  return {
    "data-help-id": targetId,
    className: active
      ? "relative z-[101] ring-2 ring-[#0047FF] ring-offset-2 ring-offset-[#f3f3f3] dark:ring-offset-[#0a0a0a] transition-shadow duration-200"
      : undefined,
  };
}

/** Switch tab / mode so the highlighted target is visible. */
export function resolveHelpNavigation(targetId) {
  if (targetId === HELP_TARGETS.GROUP_STAGE) {
    return { tab: "group" };
  }
  if (
    targetId === HELP_TARGETS.KNOCKOUT_EDIT ||
    targetId === HELP_TARGETS.KNOCKOUT_VIEW
  ) {
    return {
      tab: "knockout",
      knockoutMode: targetId === HELP_TARGETS.KNOCKOUT_EDIT ? "edit" : "view",
    };
  }
  return {};
}

export function getHelpTargetId(stepIndex) {
  return HELP_SECTIONS[stepIndex]?.targetId ?? null;
}
