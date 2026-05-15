import { useEffect, useState } from "react";
import { predictionsApi } from "../../api/predictionsApi.js";

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    predictionsApi
      .list()
      .then((data) => setPredictions(data.predictions || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function createBracket() {
    const data = await predictionsApi.create({
      name: `Bracket ${predictions.length + 1}`,
      bracket: { groups: {}, knockout: {} },
    });
    setPredictions((prev) => [data.prediction, ...prev]);
  }

  if (loading) return <p>Loading predictions…</p>;
  if (error) return <p className="text-red-400">{error}</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Predictions</h1>
        <button
          type="button"
          onClick={createBracket}
          className="px-4 py-2 rounded bg-emerald-500 text-slate-950 font-semibold"
        >
          New prediction
        </button>
      </div>
      <p className="text-slate-400 text-sm">
        Multiple brackets, stage locking, odds/history blend — build the editor UI here.
      </p>
      <ul className="space-y-3">
        {predictions.map((p) => (
          <li
            key={p.id}
            className="p-4 rounded-lg border border-white/10 bg-slate-900/50"
          >
            <p className="font-semibold">{p.name}</p>
            <p className="text-xs text-slate-500">
              Locked stages: {(p.locked_stages || []).join(", ") || "none"}
            </p>
            {p.share_token && (
              <p className="text-xs text-emerald-400 mt-1">
                Share: /predictions/shared/{p.share_token}
              </p>
            )}
          </li>
        ))}
        {predictions.length === 0 && (
          <p className="text-slate-500">No predictions yet. Create one to start.</p>
        )}
      </ul>
    </div>
  );
}
