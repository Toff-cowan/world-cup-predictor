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

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Register</h1>
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
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
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
        Create account
      </button>
      <p className="text-sm text-slate-400">
        Already have an account? <Link to="/login" className="text-emerald-400">Login</Link>
      </p>
    </form>
  );
}
