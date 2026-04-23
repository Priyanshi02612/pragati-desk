import { CalendarDays, Clock3, GripVertical } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../app/AppContext";
import { DelayReasonModal } from "../components/tasks/DelayReasonModal";
import { TaskDetailsModal } from "../components/tasks/TaskDetailsModal";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { formatNumber } from "../utils/format";

const BOARD_COLUMNS = [
  {
    key: "Pending",
    title: "To Do",
    copy: "New assignments waiting to be picked up.",
    tone: "bg-slate-100 text-slate-600",
  },
  {
    key: "In Progress",
    title: "In Progress",
    copy: "Active work currently moving forward.",
    tone: "bg-blue-50 text-brand-secondary",
  },
  {
    key: "Completed",
    title: "Done",
    copy: "Finished tasks that are ready to report.",
    tone: "bg-emerald-50 text-brand-primary",
  },
  {
    key: "Delayed",
    title: "Blocked",
    copy: "Tasks delayed and waiting on follow-up.",
    tone: "bg-rose-50 text-brand-danger",
  },
];

export const EmployeeTasksPage = () => {
  const {
    completeTask,
    currentUser,
    startTaskTimer,
    stopTaskTimer,
    submitDelayRequest,
    tasks,
    tickets,
  } = useAppContext();
  const [selectedTask, setSelectedTask] = useState(null);
  const [delayTask, setDelayTask] = useState(null);
  const [delayReason, setDelayReason] = useState("");
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dropTargetStatus, setDropTargetStatus] = useState(null);
  const [tickNow, setTickNow] = useState(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");

  const myTasks = useMemo(
    () => tasks.filter((task) => task.assigneeId === currentUser.id),
    [currentUser.id, tasks],
  );
  const taskLookup = useMemo(
    () => new Map(myTasks.map((task) => [task.id, task])),
    [myTasks],
  );
  const ticketLookup = useMemo(
    () => new Map(tickets.map((ticket) => [ticket.id, ticket])),
    [tickets],
  );
  const completedTasks = myTasks.filter((task) => task.status === "Completed");
  const overdueTasks = myTasks.filter((task) => {
    const today = new Date().toISOString().split("T")[0];
    return task.status !== "Completed" && task.dueDate && task.dueDate < today;
  });
  const activeSelectedTask = selectedTask
    ? taskLookup.get(selectedTask.id) || selectedTask
    : null;
  const groupedTasks = BOARD_COLUMNS.reduce((groups, column) => {
    groups[column.key] = myTasks.filter((task) => task.status === column.key);
    return groups;
  }, {});

  useEffect(() => {
    const hasRunningTask = myTasks.some((task) => Boolean(task.timerStartedAt));

    if (!hasRunningTask) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setTickNow(Date.now());
    }, 1000);

    return () => window.clearInterval(interval);
  }, [myTasks]);

  const getTrackedSeconds = (task) => {
    if (!task) {
      return 0;
    }

    const baseSeconds = Number(task.timeSpent) || 0;

    if (!task.timerStartedAt) {
      return baseSeconds;
    }

    const elapsedSeconds = Math.max(
      0,
      Math.floor((tickNow - new Date(task.timerStartedAt).getTime()) / 1000),
    );

    return baseSeconds + elapsedSeconds;
  };

  const withTaskMutation = async (taskId, action, options = {}) => {
    setActionError("");
    setIsSubmitting(true);

    try {
      await action(taskId);

      if (options.closeDetails) {
        setSelectedTask(null);
      }
    } catch (error) {
      setActionError(error.message || "Unable to update the task right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDelayModal = (task) => {
    setDelayTask(task);
  };

  const openTaskDetails = (task) => {
    setSelectedTask(task);
  };

  const moveTaskToStatus = (taskId, nextStatus) => {
    const task = taskLookup.get(taskId);

    if (!task || task.status === nextStatus) {
      return;
    }

    if (nextStatus === "Delayed") {
      openDelayModal(task);
      return;
    }

    if (nextStatus === "Completed") {
      withTaskMutation(taskId, completeTask);
      return;
    }

    if (nextStatus === "In Progress") {
      withTaskMutation(taskId, startTaskTimer);
    }
  };

  const handleDrop = (status) => {
    if (draggedTaskId) {
      moveTaskToStatus(draggedTaskId, status);
    }

    setDraggedTaskId(null);
    setDropTargetStatus(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="section-title">Assigned Tasks Board</h2>
            <p className="section-copy">
              Drag cards across the board to update status quickly, then use the
              task actions for timing, completion, and blocker reporting.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="bg-blue-50 text-brand-secondary">
              {formatNumber(myTasks.length)} Total
            </Badge>
            <Badge tone="bg-emerald-50 text-brand-primary">
              {formatNumber(completedTasks.length)} Done
            </Badge>
            <Badge tone="bg-rose-50 text-brand-danger">
              {formatNumber(overdueTasks.length)} Overdue
            </Badge>
          </div>
        </div>
      </Card>

      {actionError ? (
        <Card>
          <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
            {actionError}
          </div>
        </Card>
      ) : null}

      {myTasks.length ? (
        <div className="overflow-x-auto rounded-3xl">
          <div className="grid min-w-[1240px] grid-cols-4 gap-5">
            {BOARD_COLUMNS.map((column) => (
              <section
                key={column.key}
                className={`panel-muted min-h-[38rem] border p-4 transition ${
                  draggedTaskId && dropTargetStatus === column.key
                    ? "border-brand-secondary bg-blue-50/30 shadow-[inset_0_0_0_1px_rgba(29,78,216,0.2)]"
                    : "border-brand-border/60"
                }`}
                onDragOver={(event) => {
                  if (!draggedTaskId) {
                    return;
                  }

                  event.preventDefault();
                  setDropTargetStatus(column.key);
                }}
                onDragLeave={() => {
                  if (draggedTaskId && dropTargetStatus === column.key) {
                    setDropTargetStatus(null);
                  }
                }}
                onDrop={() => handleDrop(column.key)}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-brand-text">
                      {column.title}
                    </h3>
                    <p className="mt-1 text-sm text-brand-muted">
                      {column.copy}
                    </p>
                  </div>
                  <Badge tone={column.tone}>
                    {formatNumber(groupedTasks[column.key]?.length || 0)}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {groupedTasks[column.key]?.length ? (
                    groupedTasks[column.key].map((task) => {
                      const trackedSeconds = getTrackedSeconds(task);

                      return (
                        <article
                          key={task.id}
                          className="rounded-3xl border border-brand-border/60 bg-white p-4 shadow-soft transition hover:-translate-y-0.5 hover:shadow-card"
                          draggable
                          onDragStart={() => setDraggedTaskId(task.id)}
                          onDragEnd={() => {
                            setDraggedTaskId(null);
                            setDropTargetStatus(null);
                          }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <GripVertical
                                  size={16}
                                  className="text-brand-muted cursor-grab"
                                />
                                <p className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-brand-secondary">
                                  {task.taskNumber || task.id}
                                </p>
                              </div>
                              <h4 className="mt-2 text-base font-semibold text-brand-text">
                                {task.title}
                              </h4>
                            </div>
                            <Badge>{task.status}</Badge>
                          </div>

                          <div className="mt-4 flex items-center justify-between gap-3 text-sm text-brand-muted">
                            <div className="flex items-center gap-2">
                              <Clock3 size={15} />
                              <span>
                                {Math.floor(trackedSeconds / 3600)}h tracked
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarDays size={15} />
                              <span>{task.dueDate || "No date"}</span>
                            </div>
                          </div>

                          <div className="mt-4">
                            <button
                              type="button"
                              className="w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-sm font-semibold text-brand-text transition hover:bg-slate-100"
                              onClick={() => openTaskDetails(task)}
                            >
                              View Task Details
                            </button>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <div className="rounded-3xl border border-dashed border-brand-border/60 bg-white/80 p-5 text-sm text-brand-muted">
                      Drop a task here or use the card actions to move work into
                      this stage.
                    </div>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <div className="rounded-3xl bg-slate-50 p-6 text-sm text-brand-muted">
            No tasks have been assigned yet. When your team leader assigns work,
            it will appear here as a board with drag-and-drop controls.
          </div>
        </Card>
      )}

      <TaskDetailsModal
        task={activeSelectedTask}
        ticket={
          activeSelectedTask
            ? ticketLookup.get(activeSelectedTask.ticketId)
            : null
        }
        seconds={
          activeSelectedTask
            ? getTrackedSeconds(activeSelectedTask)
            : 0
        }
        isTimerRunning={Boolean(activeSelectedTask?.timerStartedAt)}
        isSubmitting={isSubmitting}
        onClose={() => setSelectedTask(null)}
        onStart={() => withTaskMutation(activeSelectedTask.id, startTaskTimer)}
        onStop={() => withTaskMutation(activeSelectedTask.id, stopTaskTimer)}
        onComplete={() => {
          withTaskMutation(activeSelectedTask.id, completeTask, {
            closeDetails: true,
          });
        }}
        onReportDelay={() => {
          openDelayModal(activeSelectedTask);
        }}
      />

      <DelayReasonModal
        task={delayTask}
        delayReason={delayReason}
        isSubmitting={isSubmitting}
        onDelayReasonChange={setDelayReason}
        onClose={() => {
          if (isSubmitting) {
            return;
          }

          setDelayTask(null);
          setDelayReason("");
        }}
        onSubmit={async () => {
          setActionError("");
          setIsSubmitting(true);

          try {
            await submitDelayRequest(delayTask.id, delayReason);
            setDelayTask(null);
            setDelayReason("");
            setSelectedTask(null);
          } catch (error) {
            setActionError(
              error.message || "Unable to submit the delay request right now.",
            );
          } finally {
            setIsSubmitting(false);
          }
        }}
      />
    </div>
  );
};
