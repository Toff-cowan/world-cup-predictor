import { useState } from "react";

const TIPS = {
  group: {
    key: "wc-tip-group",
    text: "Enter scores for each match, then Save group to lock your picks. Use Unlock group or Unlock entire bracket to edit again. Locked stages can be toggled off the same way.",
  },
  knockout: {
    key: "wc-tip-knockout",
    text: "Use Bracket view to see your full tournament tree and download a PNG image. Switch to Edit scores to update knockout results.",
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
