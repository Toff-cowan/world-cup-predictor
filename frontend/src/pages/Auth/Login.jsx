import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "../../api/authApi.js";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const { token } = await authApi.login({ email, password });
      localStorage.setItem("token", token);
      navigate("/predictions");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-2 rounded bg-slate-800 border border-white/10"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-2 rounded bg-slate-800 border border-white/10"
        required
      />
      <button type="submit" className="w-full py-2 rounded bg-emerald-500 text-slate-950 font-semibold">
        Sign in
      </button>
      <p className="text-sm text-slate-400">
        No account? <Link to="/register" className="text-emerald-400">Register</Link>
      </p>
    </form>
  );
}
