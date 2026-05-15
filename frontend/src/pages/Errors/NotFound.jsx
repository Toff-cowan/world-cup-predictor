import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-slate-400 mt-2">Page not found</p>
      <Link to="/" className="inline-block mt-6 text-emerald-400">
        Back home
      </Link>
    </div>
  );
}
