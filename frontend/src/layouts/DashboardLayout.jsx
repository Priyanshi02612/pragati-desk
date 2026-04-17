import { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAppContext } from "../app/AppContext";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";

export const DashboardLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-glow px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] gap-6 lg:grid-cols-[280px_1fr]">
        <div className={`${menuOpen ? "block" : "hidden"} lg:block`}>
          <Sidebar />
        </div>

        <main className="min-w-0">
          <Topbar onMenuToggle={() => setMenuOpen((current) => !current)} />

          <Outlet />
        </main>
      </div>
    </div>
  );
};
