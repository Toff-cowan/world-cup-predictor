import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 dark:text-zinc-100">
      <Outlet />
    </main>
  );
}
