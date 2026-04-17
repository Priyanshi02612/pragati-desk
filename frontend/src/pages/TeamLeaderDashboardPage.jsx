import {
  CheckCircle2,
  ClipboardList,
  Clock9,
  Layers3,
  Ticket,
} from "lucide-react";
import { useMemo } from "react";
import { useAppContext } from "../app/AppContext";
import { StatCard } from "../components/dashboard/StatCard";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { Table } from "../components/ui/Table";
import { formatNumber } from "../utils/format";

export const TeamLeaderDashboardPage = () => {
  const { currentUser, delayRequests, tasks, tickets, users } = useAppContext();

  const assignedTickets = useMemo(
    () =>
      tickets.filter((ticket) => ticket.assignedLeaderId === currentUser.id),
    [currentUser.id, tickets],
  );

  const teamTasks = tasks.filter((task) =>
    assignedTickets.some((ticket) => ticket.id === task.ticketId),
  );

  const today = new Date().toISOString().split("T")[0];

  const pendingApprovals = delayRequests.filter(
    (request) =>
      request.status === "Pending" &&
      teamTasks.some((task) => task.id === request.taskId),
  );

  const activeTasks = teamTasks.filter((task) => task.status !== "Completed");

  const completedTasks = teamTasks.filter(
    (task) => task.status === "Completed",
  );

  const overdueTasks = teamTasks.filter(
    (task) =>
      task.status !== "Completed" && task.dueDate && task.dueDate < today,
  );

  const unassignedTicketWork = assignedTickets.filter(
    (ticket) => !teamTasks.some((task) => task.ticketId === ticket.id),
  );

  const teamMemberProgress = users
    .filter(
      (user) =>
        user.role === "Employee" &&
        teamTasks.some((task) => task.assigneeId === user.id),
    )
    .map((user) => {
      const memberTasks = teamTasks.filter(
        (task) => task.assigneeId === user.id,
      );
      const completedCount = memberTasks.filter(
        (task) => task.status === "Completed",
      ).length;
      const delayedCount = memberTasks.filter(
        (task) => task.status === "Delayed",
      ).length;

      return {
        id: user.id,
        name: user.name,
        totalTasks: memberTasks.length,
        completedCount,
        delayedCount,
        activeCount: memberTasks.length - completedCount,
        progressValue: memberTasks.length
          ? Math.round((completedCount / memberTasks.length) * 100)
          : 0,
      };
    })
    .sort((left, right) => right.progressValue - left.progressValue);

  const assignedTicketRows = assignedTickets.map((ticket) => ({
    ...ticket,
    taskCount: teamTasks.filter((task) => task.ticketId === ticket.id).length,
  }));

  const ticketColumns = [
    {
      key: "ticketNumber",
      label: "Ticket Number",
      render: (row) => row.ticketNumber || row.id,
    },
    { key: "title", label: "Title" },
    {
      key: "ticketType",
      label: "Type",
      render: (row) => (
        <Badge tone="bg-amber-50 text-amber-700">{row.ticketType}</Badge>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <span className="max-w-md text-brand-muted">{row.description}</span>
      ),
    },
    { key: "department", label: "Department" },
    {
      key: "taskCount",
      label: "Tasks",
      render: (row) => (
        <span className="font-medium text-brand-text">{row.taskCount}</span>
      ),
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
          icon={ClipboardList}
          label="Ticket Ownership"
          value={formatNumber(assignedTickets.length)}
          helper="Tickets owned by your squad"
        />
        <StatCard
          icon={Layers3}
          label="Task Status"
          value={formatNumber(activeTasks.length)}
          helper="Tasks still moving across employees"
          tone="secondary"
        />
        <StatCard
          icon={Clock9}
          label="Delivery Progress"
          value={formatNumber(completedTasks.length)}
          helper="Finished work delivered by your team"
          tone="accent"
        />
        <StatCard
          icon={CheckCircle2}
          label="Pending Delays"
          value={formatNumber(pendingApprovals.length)}
          helper="Requests waiting for your review"
          tone="primary"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <div className="mb-5">
            <h2 className="section-title">Assigned Tickets</h2>
            <p className="section-copy">
              Track the tickets currently owned by your team.
            </p>
          </div>
          <Table columns={ticketColumns} rows={assignedTicketRows} />
        </Card>

        <Card>
          <div className="mb-5 flex items-start gap-3">
            <div className="rounded-2xl bg-blue-50 p-3 text-brand-secondary">
              <Ticket size={20} />
            </div>
            <div>
              <h2 className="section-title">Team Overview</h2>
              <p className="section-copy">
                Review ownership, execution, and blockers from one leadership
                snapshot. Use this space to spot delivery risks early and keep
                work balanced across the team.
              </p>
            </div>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">
                    Overdue Tasks
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-brand-text">
                    {formatNumber(overdueTasks.length)}
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">
                    Tickets Without Tasks
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-brand-text">
                    {formatNumber(unassignedTicketWork.length)}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-muted">
                      Team Member Progress
                    </p>
                    <p className="mt-1 text-sm text-brand-muted">
                      Completed tasks versus current task load for each
                      employee.
                    </p>
                  </div>
                  <Badge tone="bg-blue-50 text-brand-secondary">
                    {formatNumber(teamMemberProgress.length)} Members
                  </Badge>
                </div>
                <div className="mt-4 space-y-3">
                  {teamMemberProgress.length ? (
                    teamMemberProgress.map((member) => (
                      <div
                        key={member.id}
                        className="rounded-2xl border border-brand-border/60 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-brand-text">
                              {member.name}
                            </p>
                            <p className="mt-1 text-sm text-brand-muted">
                              {member.completedCount}/{member.totalTasks}{" "}
                              completed
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-brand-secondary">
                            {member.progressValue}%
                          </span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-brand-secondary transition-all"
                            style={{ width: `${member.progressValue}%` }}
                          />
                        </div>
                        <p className="mt-2 text-xs text-brand-muted">
                          {member.activeCount} active tasks
                          {member.delayedCount
                            ? ` • ${member.delayedCount} delayed`
                            : ""}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-brand-border/60 p-4 text-sm text-brand-muted">
                      Team member progress will appear once tasks are assigned.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="mb-5">
          <h2 className="section-title">Pending Delay Requests</h2>
          <p className="section-copy">
            Quick overview of pending blockers across your team.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {pendingApprovals.length ? (
            pendingApprovals.map((request) => {
              const task = tasks.find((item) => item.id === request.taskId);
              const employee = users.find(
                (user) => user.id === request.employeeId,
              );

              return (
                <div
                  key={request.id}
                  className="rounded-3xl border border-brand-border/70 bg-slate-50 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-brand-text">
                        {task?.title}
                      </h3>
                      <p className="mt-1 text-sm text-brand-muted">
                        Requested by {employee?.name} • {task?.ticketId}
                      </p>
                    </div>
                    <Badge>{request.status}</Badge>
                  </div>
                  <p className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-brand-muted">
                    {request.reason}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="rounded-3xl bg-slate-50 p-6 text-sm text-brand-muted">
              No pending delay approvals right now.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
