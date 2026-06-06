import { Link } from "react-router-dom";

export default function ShareBracketPrompt({
  ready,
  message,
  predictionId,
  predictionName,
  isAuthenticated,
  onSignIn,
  className = "",
}) {
  if (isAuthenticated) {
    return (
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border ${
          ready
            ? "border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30"
            : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950"
        } ${className}`}
      >
        <p
          className={`text-sm m-0 ${
            ready
              ? "text-emerald-900 dark:text-emerald-100"
              : "text-zinc-600 dark:text-white/70"
          }`}
        >
          {message}
        </p>
        <Link
          to="/forum/new"
          state={{
            postType: "bracket",
            bracketId: predictionId,
            bracketName: predictionName,
          }}
          className={`shrink-0 text-center min-h-[2.75rem] px-5 py-2 text-xs font-bold uppercase tracking-wide ${
            ready
              ? "bg-emerald-600 text-white hover:bg-emerald-500"
              : "bg-zinc-300 dark:bg-zinc-700 text-zinc-500 dark:text-white/50 pointer-events-none"
          }`}
          aria-disabled={!ready}
          onClick={(e) => {
            if (!ready) e.preventDefault();
          }}
        >
          Share to forum
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 ${className}`}
    >
      <p className="text-sm text-zinc-600 dark:text-white/70 m-0">
        {ready
          ? "Sign in to share your completed bracket on the forum."
          : message}
      </p>
      <button
        type="button"
        onClick={onSignIn}
        disabled={!ready}
        className="shrink-0 min-h-[2.75rem] px-5 py-2 text-xs font-bold uppercase tracking-wide bg-emerald-600 text-white hover:bg-emerald-500 disabled:opacity-40"
      >
        Sign in to share
      </button>
    </div>
  );
}
