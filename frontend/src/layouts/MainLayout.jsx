import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
      <Outlet />
    </main>
  );
}
