import { Clock3, Play, Square, TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { TimerDisplay } from "./TimerDisplay";

export const TaskCard = ({ task, assignee, ticket, onUpdate, onDelay }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(task.timeSpent);

  useEffect(() => {
    setSeconds(task.timeSpent);
  }, [task.timeSpent]);

  useEffect(() => {
    if (!isRunning) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  const stopTimer = () => {
    setIsRunning(false);
    onUpdate(task.id, { timeSpent: seconds, status: "In Progress" });
  };

  const completeTask = () => {
    setIsRunning(false);
    onUpdate(task.id, { status: "Completed", timeSpent: seconds });
  };

  const submitDelay = () => {
    setIsRunning(false);
    onDelay(task);
  };

  return (
    <Card className="flex h-full flex-col gap-4 transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-secondary">
            {task.taskNumber || task.id}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-brand-text">
            {task.title}
          </h3>
          {ticket ? (
            <div className="mt-3 rounded-2xl bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-muted">
                Ticket context
              </p>
              <p className="mt-1 text-sm font-medium text-brand-text">
                {ticket.title}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-brand-secondary">
                {ticket.ticketNumber || ticket.id}
              </p>
              <div className="mt-2">
                <Badge tone="bg-amber-50 text-amber-700">
                  {ticket.ticketType}
                </Badge>
              </div>
              <p className="mt-1 text-sm leading-6 text-brand-muted">
                {ticket.description}
              </p>
            </div>
          ) : null}
          <p className="mt-1 text-sm text-brand-muted">
            Assigned to {assignee?.name || "Unassigned"} • Due {task.dueDate}
          </p>
        </div>
        <Badge>{task.status}</Badge>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div className="flex items-center gap-2 text-sm text-brand-muted">
          <Clock3 size={16} />
          Time tracked
        </div>
        <TimerDisplay seconds={seconds} />
      </div>

      <div className="mt-auto flex flex-wrap gap-2">
        <Button
          className="gap-2"
          onClick={() => {
            setIsRunning(true);
            onUpdate(task.id, { status: "In Progress" });
          }}
        >
          <Play size={16} />
          Start timer
        </Button>
        <Button className="gap-2" variant="muted" onClick={stopTimer}>
          <Square size={16} />
          Stop timer
        </Button>
        <Button className="gap-2" variant="secondary" onClick={completeTask}>
          Complete
        </Button>
        <Button className="gap-2" variant="accent" onClick={submitDelay}>
          <TriangleAlert size={16} />
          Delay reason
        </Button>
      </div>
    </Card>
  );
};
