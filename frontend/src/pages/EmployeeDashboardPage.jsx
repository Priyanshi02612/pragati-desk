import {
  Activity,
  AlarmClockCheck,
  CheckCircle2,
  CircleAlert,
  ListTodo,
  TrendingUp,
} from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAppContext } from "../app/AppContext";
import { Badge } from "../components/ui/Badge";
import { StatCard } from "../components/dashboard/StatCard";
import { Card } from "../components/ui/Card";
import { ProgressBar } from "../components/ui/ProgressBar";
import { formatNumber, formatPercent } from "../utils/format";

export const EmployeeDashboardPage = () => {
  const { currentUser, tasks, tickets } = useAppContext();

  const myTasks = useMemo(
    () => tasks.filter((task) => task.assigneeId === currentUser.id),
    [currentUser.id, tasks],
  );
  const ticketLookup = useMemo(
    () => new Map(tickets.map((ticket) => [ticket.id, ticket])),
    [tickets],
  );
  const completedTasks = myTasks.filter((task) => task.status === "Completed");
  const inProgressTasks = myTasks.filter((task) => task.status === "In Progress");
  const delayedTasks = myTasks.filter((task) => task.status === "Delayed");
  const today = new Date().toISOString().split("T")[0];
  const overdueTasks = myTasks.filter(
    (task) => task.status !== "Completed" && task.dueDate && task.dueDate < today,
  );
  const totalHours = myTasks.reduce((sum, task) => sum + task.timeSpent, 0) / 3600;
  const completionRate = myTasks.length
    ? Math.round((completedTasks.length / myTasks.length) * 100)
    : 0;
  const nextPriorityTask = [...myTasks]
    .filter((task) => task.status !== "Completed")
    .sort((left, right) => {
      if (!left.dueDate) {
        return 1;
      }

      if (!right.dueDate) {
        return -1;
      }

      return left.dueDate.localeCompare(right.dueDate);
    })[0];
  const taskStatusSummary = [
    {
      label: "In Progress",
      value: inProgressTasks.length,
      tone: "bg-blue-50 text-brand-secondary",
    },
    {
      label: "Completed",
      value: completedTasks.length,
      tone: "bg-emerald-50 text-brand-primary",
    },
    {
      label: "Delayed",
      value: delayedTasks.length,
      tone: "bg-rose-50 text-brand-danger",
    },
  ];

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
          icon={Activity}
          label="Assigned Tasks"
          value={formatNumber(myTasks.length)}
          helper="Tasks currently in your personal queue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completion Rate"
          value={`${completionRate}%`}
          helper="Share of assigned work already completed"
          tone="secondary"
        />
        <StatCard
          icon={AlarmClockCheck}
          label="Tracked Hours"
          value={totalHours.toFixed(1)}
          helper="Hours tracked using the timer"
          tone="accent"
        />
        <StatCard
          icon={TrendingUp}
          label="Personal Score"
          value={formatPercent(currentUser.performance)}
          helper="Performance score this month"
          tone={currentUser.performance < 85 ? "danger" : "primary"}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="section-title">Work Snapshot</h2>
              <p className="section-copy">
                Keep today focused by reviewing your next task, current status,
                and any delivery risks.
              </p>
            </div>
            <Badge tone="bg-blue-50 text-brand-secondary">
              {formatNumber(overdueTasks.length)} Overdue
            </Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-brand-muted">Next priority</p>
                  <h3 className="mt-2 text-lg font-semibold text-brand-text">
                    {nextPriorityTask?.title || "No active task right now"}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">
                    {nextPriorityTask
                      ? `${nextPriorityTask.taskNumber || "Task"} • Due ${nextPriorityTask.dueDate || "No due date"}`
                      : "Your assigned work is up to date. New tasks will appear here as soon as they are assigned."}
                  </p>
                </div>
                <span className="rounded-2xl bg-white p-3 text-brand-secondary">
                  <ListTodo size={20} />
                </span>
              </div>
              {nextPriorityTask ? (
                <div className="mt-4 rounded-2xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">
                    Ticket Context
                  </p>
                  <p className="mt-2 font-medium text-brand-text">
                    {ticketLookup.get(nextPriorityTask.ticketId)?.title || "Linked ticket"}
                  </p>
                  <p className="mt-1 text-sm text-brand-muted">
                    {ticketLookup.get(nextPriorityTask.ticketId)?.ticketNumber || nextPriorityTask.ticketId}
                  </p>
                </div>
              ) : null}
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-brand-muted">Status breakdown</p>
              <div className="mt-4 space-y-3">
                {taskStatusSummary.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl bg-white px-4 py-3"
                  >
                    <span className="text-sm font-medium text-brand-text">{item.label}</span>
                    <Badge tone={item.tone}>{formatNumber(item.value)}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="section-title">Personal Performance</h2>
              <p className="section-copy">
                Stay above the 85% benchmark with consistent progress.
              </p>
            </div>
            <div className="w-full max-w-xs">
              <div className="mb-2 flex justify-between text-sm font-medium text-brand-muted">
                <span>Current score</span>
                <span>{formatPercent(currentUser.performance)}</span>
              </div>
              <ProgressBar value={currentUser.performance} />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm text-brand-muted">Improvement area</p>
              <h3 className="mt-2 text-lg font-semibold text-brand-text">
                {currentUser.performance < 85
                  ? "Reduce delay ratio"
                  : "Maintain delivery rhythm"}
              </h3>
              <p className="mt-2 text-sm leading-6 text-brand-muted">
                Focus on updating task status quickly, logging blockers early,
                and closing out work as soon as it is ready.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <span className="rounded-2xl bg-amber-50 p-3 text-brand-accent">
                  <CircleAlert size={20} />
                </span>
                <div>
                  <p className="text-sm text-brand-muted">Daily focus</p>
                  <h3 className="mt-2 text-lg font-semibold text-brand-text">
                    {overdueTasks.length
                      ? "Clear overdue work first"
                      : delayedTasks.length
                        ? "Resolve active blockers"
                        : "Keep current tasks moving"}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-brand-muted">
                    {overdueTasks.length
                      ? `${formatNumber(overdueTasks.length)} task${overdueTasks.length > 1 ? "s are" : " is"} past due and needs attention.`
                      : delayedTasks.length
                        ? `${formatNumber(delayedTasks.length)} task${delayedTasks.length > 1 ? "s are" : " is"} currently marked delayed.`
                        : "You do not have any overdue or delayed tasks right now."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="section-title">Assigned Tasks</h2>
            <p className="section-copy">
              Open your dedicated task page to work through assignments, track
              time, and send delay requests when needed.
            </p>
          </div>
          <Link
            to="/employee/tasks"
            className="inline-flex items-center justify-center rounded-2xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:bg-emerald-700 focus-visible:ring-2 focus-visible:ring-brand-secondary/30"
          >
            Open My Tasks
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-brand-muted">Total assigned</p>
            <p className="mt-2 text-3xl font-semibold text-brand-text">
              {formatNumber(myTasks.length)}
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-brand-muted">Completed</p>
            <p className="mt-2 text-3xl font-semibold text-brand-text">
              {formatNumber(completedTasks.length)}
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-sm text-brand-muted">Next due</p>
            <p className="mt-2 text-lg font-semibold text-brand-text">
              {nextPriorityTask?.dueDate || "No active due date"}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
