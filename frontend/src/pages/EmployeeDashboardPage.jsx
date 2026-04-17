import {
  Activity,
  AlarmClockCheck,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAppContext } from "../app/AppContext";
import { TaskCard } from "../components/dashboard/TaskCard";
import { StatCard } from "../components/dashboard/StatCard";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/InputField";
import { Modal } from "../components/ui/Modal";
import { ProgressBar } from "../components/ui/ProgressBar";
import { formatNumber, formatPercent } from "../utils/format";

export const EmployeeDashboardPage = () => {
  const { currentUser, submitDelayRequest, tasks, tickets, updateTask, users } =
    useAppContext();
  const [selectedTask, setSelectedTask] = useState(null);
  const [delayReason, setDelayReason] = useState("");

  const myTasks = useMemo(
    () => tasks.filter((task) => task.assigneeId === currentUser.id),
    [currentUser.id, tasks],
  );
  const completedTasks = myTasks.filter(
    (task) => task.status === "Completed",
  ).length;
  const totalHours =
    myTasks.reduce((sum, task) => sum + task.timeSpent, 0) / 3600;

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
          helper="Tasks currently assigned to you"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed Tasks"
          value={formatNumber(completedTasks)}
          helper="Closed successfully this cycle"
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
        <div className="grid gap-4 md:grid-cols-3">
          {users
            .filter((user) => user.id === currentUser.id)
            .map((user) => (
              <div key={user.id} className="rounded-3xl bg-slate-50 p-5">
                <p className="text-sm text-brand-muted">Improvement area</p>
                <h3 className="mt-2 text-lg font-semibold text-brand-text">
                  {user.performance < 85
                    ? "Reduce delay ratio"
                    : "Maintain delivery rhythm"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-brand-muted">
                  Focus on updating task status quickly and logging blocker
                  context early.
                </p>
              </div>
            ))}
        </div>
      </Card>

      <div>
        <div className="mb-5">
          <h2 className="section-title">Assigned Tasks</h2>
          <p className="section-copy">
            Track time, complete work, or raise a delay request with context.
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {myTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              assignee={currentUser}
              ticket={tickets.find((ticket) => ticket.id === task.ticketId)}
              onUpdate={updateTask}
              onDelay={(item) => setSelectedTask(item)}
            />
          ))}
        </div>
      </div>

      <Modal
        title="Submit Delay Reason"
        description="Share the blocker so your team leader can review the request."
        isOpen={Boolean(selectedTask)}
        onClose={() => {
          setSelectedTask(null);
          setDelayReason("");
        }}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            submitDelayRequest(selectedTask.id, delayReason);
            setSelectedTask(null);
            setDelayReason("");
          }}
        >
          <InputField
            label="Reason"
            as="textarea"
            rows="4"
            value={delayReason}
            placeholder="Describe the issue causing the delay"
            onChange={(event) => setDelayReason(event.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="muted"
              onClick={() => {
                setSelectedTask(null);
                setDelayReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!delayReason.trim()}
              className="disabled:cursor-not-allowed disabled:opacity-60"
            >
              Submit request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
