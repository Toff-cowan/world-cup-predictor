import { useEffect, useState } from "react";
import { authApi } from "../../api/authApi.js";
import { predictionsApi } from "../../api/predictionsApi.js";
import { forumApi } from "../../api/forumApi.js";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    authApi.me().then((d) => setUser(d.user));
    predictionsApi.list().then((d) => setPredictions(d.predictions || []));
    forumApi.list().then((d) => setPosts((d.posts || []).slice(0, 5)));
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Profile</h1>
      {user && (
        <p className="text-slate-300">
          Signed in as <span className="text-emerald-400">{user.username}</span>
        </p>
      )}
      <section>
        <h2 className="text-xl font-semibold mb-2">Your predictions</h2>
        <ul className="space-y-2 text-sm">
          {predictions.map((p) => (
            <li key={p.id}>{p.name}</li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Recent forum posts</h2>
        <ul className="space-y-2 text-sm text-slate-400">
          {posts.map((p) => (
            <li key={p.id}>{p.title}</li>
          ))}
        </ul>
        <p className="text-xs text-slate-500 mt-2">Forum create UI — empty file for you to build.</p>
      </section>
    </div>
  );
}
