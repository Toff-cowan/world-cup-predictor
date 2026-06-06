import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/forum/new";
  const { register, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isAuthenticated) {
    return <Navigate to={redirect} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await register({ email, username, password });
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  const inputClass =
    "mt-1 w-full min-h-[2.75rem] px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-white";

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto space-y-4 p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
    >
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white m-0">Create account</h1>
      <p className="text-sm text-zinc-500 m-0">
        Register to share your bracket on the forum. You can build predictions without signing up.
      </p>
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
      <label className="block">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Password
        </span>
        <input
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          required
        />
      </label>
      <button
        type="submit"
        className="w-full min-h-[2.75rem] py-2 bg-zinc-900 dark:bg-zinc-800 text-white dark:text-white font-bold"
      >
        Create account
      </button>
      <p className="text-sm text-zinc-500 m-0">
        Already have an account?{" "}
        <Link
          to={`/login?redirect=${encodeURIComponent(redirect)}`}
          className="text-zinc-900 dark:text-white font-semibold underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
