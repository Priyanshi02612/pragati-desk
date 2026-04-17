import { ArrowRight, Plus, TicketPlus, TrendingUp, Users2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppContext } from "../app/AppContext";
import { StatCard } from "../components/dashboard/StatCard";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { formatNumber, formatPercent } from "../utils/format";

export const AdminDashboardPage = () => {
  const { metrics, tickets, users, currentUser } = useAppContext();
  const recentEmployees = users
    .filter((user) => user.role === "Employee")
    .slice(0, 3);
  const recentTickets = tickets.slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="mb-6 rounded-3xl border border-white/80 bg-gradient-to-r from-brand-primary to-brand-secondary p-6 text-white shadow-soft">
        <p className="text-sm font-medium text-white/80">Welcome back</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{currentUser.name}</h2>
            <p className="mt-1 text-sm text-white/80">
              {currentUser.role} dashboard with live task, performance, and team
              visibility.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-4 py-3 text-sm">
            <span className="block text-white/70">Today</span>
            <span className="font-semibold">
              {new Intl.DateTimeFormat("en-IN", {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
              }).format(new Date())}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users2}
          label="Total Employees"
          value={formatNumber(metrics.totalEmployees)}
          helper="Active employee profiles"
        />
        <StatCard
          icon={TicketPlus}
          label="Active Tickets"
          value={formatNumber(metrics.activeTickets)}
          helper="Tickets currently open"
          tone="secondary"
        />
        <StatCard
          icon={TrendingUp}
          label="Performance Avg."
          value={formatPercent(metrics.averagePerformance)}
          helper="Across all employees"
          tone="accent"
        />
        <StatCard
          icon={Plus}
          label="Delayed Tasks"
          value={formatNumber(metrics.delayedTasks)}
          helper="Tasks needing attention"
          tone="danger"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="section-title">Employee Snapshot</h2>
              <p className="section-copy">
                A quick view of current employee performance before you dive
                into the full list.
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              to="/admin/employees"
            >
              Manage employees
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {recentEmployees.map((employee) => (
              <div key={employee.id} className="rounded-3xl bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-brand-text">
                    {employee.name}
                  </h3>
                  <Badge>
                    {employee.performance < 85 ? "Delayed" : "Completed"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-brand-muted">
                  {employee.department}
                </p>
                <p className="mt-4 text-sm font-medium text-brand-text">
                  Performance: {formatPercent(employee.performance)}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="section-title">Ticket Snapshot</h2>
              <p className="section-copy">
                Review the latest tickets and jump into the full ticket
                management page.
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-secondary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
              to="/admin/tickets"
            >
              Manage tickets
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="space-y-4">
            {recentTickets.map((ticket) => (
              <div key={ticket.id} className="rounded-3xl bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
                      {ticket.ticketNumber || ticket.id}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-brand-text">
                      {ticket.title}
                    </h3>
                    <div className="mt-3">
                      <Badge tone="bg-amber-50 text-amber-700">
                        {ticket.ticketType}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-brand-muted">
                      {ticket.description}
                    </p>
                  </div>
                  <Badge tone="bg-blue-50 text-brand-secondary">
                    {ticket.priority}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
