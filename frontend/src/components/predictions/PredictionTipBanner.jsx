import { useState } from "react";

const TIPS = {
  group: {
    key: "wc-tip-group",
    text: "Enter scores for each match, then Save group to lock your picks. Use Unlock group or Unlock entire bracket to edit again. Locked stages can be toggled off the same way.",
  },
  knockout: {
    key: "wc-tip-knockout",
    text: "Knockout teams are set from your group-stage predictions (winners, runners-up, and best third-place teams). Enter scores round by round — no manual team picking.",
  },
  simple: {
    key: "wc-tip-simple",
    text: "Rank each group 1st to 4th by clicking teams in order. The Round of 32 fills automatically from the official FIFA bracket (top 2 + 8 best third-place teams). Tap winners through the tree and download your bracket as a PNG.",
  },
  "simple-group": {
    key: "wc-tip-simple-group",
    text: "Click teams in each group to rank them 1st through 4th. Tap a ranked team again to remove it. When all 12 groups are done, continue to the bracket.",
  },
  "simple-knockout": {
    key: "wc-tip-simple-knockout",
    text: "Tap the team you think wins each match — no scores needed. The bracket follows the official FIFA tree from your group rankings. Download a PNG when you're done.",
  },
};

export default function PredictionTipBanner({ tab }) {
  const tip = TIPS[tab];
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined" || !tip) return false;
    return localStorage.getItem(tip.key) !== "true";
  });

  if (!tip || !visible) return null;

  function dismiss() {
    localStorage.setItem(tip.key, "true");
    setVisible(false);
  }

  return (
    <div className="flex items-start gap-3 p-4 bg-zinc-900 text-white text-sm leading-relaxed">
      <p className="flex-1 m-0">{tip.text}</p>
      <button
        type="button"
        onClick={dismiss}
        className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-white/70 hover:text-white"
      >
        Dismiss
      </button>
    </div>
  );
}
