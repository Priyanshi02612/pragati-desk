import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppContext } from '../app/AppContext';
import { Sidebar } from '../components/layout/Sidebar';
import { Topbar } from '../components/layout/Topbar';

export const DashboardLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser } = useAppContext();

  return (
    <div className="min-h-screen bg-glow px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] gap-6 lg:grid-cols-[280px_1fr]">
        <div className={`${menuOpen ? 'block' : 'hidden'} lg:block`}>
          <Sidebar />
        </div>

        <main className="min-w-0">
          <Topbar onMenuToggle={() => setMenuOpen((current) => !current)} />
          <div className="mb-6 rounded-3xl border border-white/80 bg-gradient-to-r from-brand-primary to-brand-secondary p-6 text-white shadow-soft">
            <p className="text-sm font-medium text-white/80">Welcome back</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">{currentUser.name}</h2>
                <p className="mt-1 text-sm text-white/80">
                  {currentUser.role} dashboard with live task, performance, and team visibility.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
                <span className="block text-white/70">Today</span>
                <span className="font-semibold">
                  {new Intl.DateTimeFormat('en-IN', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }).format(new Date())}
                </span>
              </div>
            </div>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
