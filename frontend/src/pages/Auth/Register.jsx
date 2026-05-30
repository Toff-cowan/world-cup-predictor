import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi.js";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { token } = await authApi.register({ email, username, password });
      localStorage.setItem("token", token);
      navigate("/predictions");
    } catch (err) {
      setError(err.message);
    }
  }

  const inputClass =
    "mt-1 w-full min-h-[2.75rem] px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 text-zinc-900 dark:text-zinc-100";

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto space-y-4 p-6 sm:p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700"
    >
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 m-0">Register</h1>
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
        className="w-full min-h-[2.75rem] py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold"
      >
        Create account
      </button>
      <p className="text-sm text-zinc-500 m-0">
        Already have an account?{" "}
        <Link to="/login" className="text-zinc-900 dark:text-zinc-100 font-semibold underline">
          Login
        </Link>
      </p>
    </form>
  );
}
