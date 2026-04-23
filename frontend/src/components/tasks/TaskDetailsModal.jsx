import {
  CheckCircle2,
  Clock3,
  FileText,
  Pause,
  Play,
  TriangleAlert,
  X,
} from "lucide-react";
import { secondsToClock } from "../../utils/format";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

export const TaskDetailsModal = ({
  task,
  ticket,
  seconds,
  isTimerRunning,
  isSubmitting,
  onClose,
  onStart,
  onStop,
  onComplete,
  onReportDelay,
}) => (
  <Modal
    isOpen={Boolean(task)}
    onClose={onClose}
    className="overflow-hidden border border-white/80 bg-[#eef3ff] p-0 shadow-[0_32px_120px_rgba(15,23,42,0.18)]"
    maxWidth="max-w-4xl"
    hideHeader
  >
    {task ? (
      <div className="bg-[linear-gradient(180deg,#f5f8ff_0%,#edf3ff_100%)]">
        <div className="flex flex-wrap items-center justify-between gap-6 border-b border-brand-border/50 px-7 py-2">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-5">
            <div className="border-r border-brand-border/70 pr-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-muted">
                Reference ID
              </p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                {task.taskNumber || task.id}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm sm:text-base">
              <h3 className="text-xl font-semibold leading-tight text-slate-950">
                {task.title}
              </h3>
              <span className="rounded-2xl bg-emerald-200 p-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-950">
                {task.status === "In Progress" ? "Active Task" : task.status}
              </span>
            </div>
          </div>

          <button
            className="rounded-full p-2 text-slate-500 transition hover:bg-white/70 hover:text-slate-950"
            onClick={onClose}
            type="button"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid gap-8 grid-cols-2 p-6">
          <div className="rounded-[1.75rem] border border-dashed border-brand-border/60 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-3 text-brand-primary">
                  <FileText size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.08em] text-brand-muted">
                    Ticket Context
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Linked brief and delivery reference
                  </p>
                </div>
              </div>
              <Badge
                tone="bg-blue-50 text-brand-secondary"
                className="self-start"
              >
                {ticket?.ticketNumber || task.ticketId}
              </Badge>
            </div>

            <div className="mt-5 rounded-[1.5rem] border border-emerald-100 bg-[linear-gradient(135deg,#f2fff8_0%,#ffffff_100%)] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-primary">
                    Overview
                  </p>
                  <p className="mt-2 text-xl font-semibold leading-tight text-brand-text">
                    {ticket?.title || "Linked ticket"}
                  </p>
                </div>
                {ticket?.ticketType ? (
                  <Badge tone="bg-amber-50 text-amber-700">
                    {ticket.ticketType}
                  </Badge>
                ) : null}
              </div>
              <p className="mt-4 text-sm leading-7 text-brand-muted">
                {ticket?.description ||
                  "No ticket description was added for this task yet."}
              </p>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.35rem] bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                  Ticket ID
                </p>
                <p className="mt-2 text-base font-semibold text-brand-text">
                  {ticket?.ticketNumber || task.ticketId}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Reference used across the workflow
                </p>
              </div>
              <div className="rounded-[1.35rem] bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-muted">
                  Work Type
                </p>
                <p className="mt-2 text-base font-semibold text-brand-text">
                  {ticket?.ticketType || "General"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Category attached to this task
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="rounded-[1.75rem] border border-dashed border-brand-border/60 bg-white p-5 shadow-soft">
              <div className="flex items-center gap-3">
                <Clock3 size={18} className="text-brand-primary" />
                <p className="text-sm font-semibold uppercase tracking-[0.08em] text-brand-muted">
                  Timer Controls
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                <span className="text-sm text-brand-muted">Tracking now</span>
                <span className="font-mono text-base font-semibold text-slate-950">
                  {secondsToClock(seconds)}
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <Button
                  className="w-full justify-center gap-2 rounded-[1.35rem] py-4 text-lg"
                  onClick={onStart}
                  disabled={task.status === "Completed" || isSubmitting}
                >
                  <Play size={18} />
                  {isSubmitting && !isTimerRunning ? "Starting..." : "Start timer"}
                </Button>
                <Button
                  className="w-full justify-center gap-2 rounded-[1.35rem] py-4 text-lg"
                  variant="muted"
                  onClick={onStop}
                  disabled={!isTimerRunning || isSubmitting}
                >
                  <Pause size={18} />
                  {isSubmitting && isTimerRunning ? "Stopping..." : "Stop timer"}
                </Button>
              </div>
            </div>

            <section className="flex flex-col gap-3">
              <Button
                className="justify-center gap-3 rounded-[1.45rem] py-5 font-semibold shadow-[0_12px_30px_rgba(244,63,94,0.16)]"
                variant="warning"
                onClick={onReportDelay}
                disabled={task.status === "Completed" || isSubmitting}
              >
                <TriangleAlert size={22} />
                Report Delay
              </Button>

              <Button
                className="justify-center gap-3 rounded-[1.45rem] py-5 font-semibold shadow-[0_12px_30px_rgba(22,163,74,0.22)]"
                onClick={onComplete}
                disabled={task.status === "Completed" || isSubmitting}
              >
                <CheckCircle2 size={24} />
                {isSubmitting ? "Saving..." : "Mark as Done"}
              </Button>
            </section>
          </div>
        </div>
      </div>
    ) : null}
  </Modal>
);
