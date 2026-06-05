import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";

export default function AuthModal({ open, onClose, onSuccess, title, message }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login({ email, password });
      } else {
        await register({ email, username, password });
      }
      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1 w-full min-h-[2.75rem] px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full sm:max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-2">
          <div>
            <h2 id="auth-modal-title" className="text-xl font-bold m-0 text-zinc-900 dark:text-zinc-100">
              {title || (mode === "login" ? "Sign in to continue" : "Create an account")}
            </h2>
            {message && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2 m-0">{message}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {error && <p className="text-red-600 dark:text-red-400 text-sm m-0">{error}</p>}

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Email</span>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              required
            />
          </label>

          {mode === "register" && (
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Username
              </span>
              <input
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
                required
              />
            </label>
          )}

          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Password
            </span>
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              required
            />
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[2.75rem] py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold disabled:opacity-50"
          >
            {submitting ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>

          <p className="text-sm text-zinc-500 m-0 text-center">
            {mode === "login" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="font-semibold underline text-zinc-900 dark:text-zinc-100"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="font-semibold underline text-zinc-900 dark:text-zinc-100"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
