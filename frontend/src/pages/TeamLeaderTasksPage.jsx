import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../app/AppContext";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/InputField";
import { Table } from "../components/ui/Table";
import { Modal } from "../components/ui/Modal";

const getTodayDate = () => {
  const today = new Date();
  const timezoneAdjusted = new Date(
    today.getTime() - today.getTimezoneOffset() * 60 * 1000,
  );
  return timezoneAdjusted.toISOString().split("T")[0];
};

export const TeamLeaderTasksPage = () => {
  const {
    createTask,
    currentUser,
    delayRequests,
    reviewDelayRequest,
    tasks,
    tickets,
    users,
  } = useAppContext();

  const todayDate = getTodayDate();
  const [taskForm, setTaskForm] = useState({
    ticketId: "",
    title: "",
    assigneeId: "",
    dueDate: todayDate,
  });
  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const assignedTickets = useMemo(
    () =>
      tickets.filter((ticket) => ticket.assignedLeaderId === currentUser.id),
    [currentUser.id, tickets],
  );
  const employeeOptions = users.filter((user) => user.role === "Employee");
  const teamTasks = tasks.filter((task) =>
    assignedTickets.some((ticket) => ticket.id === task.ticketId),
  );
  const teamDelayRequests = delayRequests.filter((request) =>
    teamTasks.some((task) => task.id === request.taskId),
  );

  useEffect(() => {
    if (!taskForm.ticketId && assignedTickets[0]?.id) {
      setTaskForm((current) => ({
        ...current,
        ticketId: assignedTickets[0].id,
      }));
    }

    if (!taskForm.assigneeId && employeeOptions[0]?.id) {
      setTaskForm((current) => ({
        ...current,
        assigneeId: employeeOptions[0].id,
      }));
    }
  }, [
    assignedTickets,
    employeeOptions,
    taskForm.assigneeId,
    taskForm.ticketId,
  ]);

  const taskColumns = [
    {
      key: "taskNumber",
      label: "Task",
      render: (row) => `${row.taskNumber} • ${row.title}` || "Pending",
    },
    {
      key: "ticketType",
      label: "Type",
      render: (row) => {
        const ticket = tickets.find((item) => item.id === row.ticketId);
        return (
          <Badge tone="bg-amber-50 text-amber-700">
            {ticket?.ticketType || "Task"}
          </Badge>
        );
      },
    },
    {
      key: "assigneeId",
      label: "Assigned To",
      render: (row) =>
        users.find((user) => user.id === row.assigneeId)?.name || "Unknown",
    },
    { key: "dueDate", label: "Due Date" },
    {
      key: "status",
      label: "Status",
      render: (row) => <Badge>{row.status}</Badge>,
    },
  ];
  const delayColumns = [
    {
      key: "taskId",
      label: "Task",
      render: (row) =>
        tasks.find((task) => task.id === row.taskId)?.title || row.taskId,
    },
    {
      key: "employeeId",
      label: "Employee",
      render: (row) =>
        users.find((user) => user.id === row.employeeId)?.name || "Unknown",
    },
    {
      key: "reason",
      label: "Reason",
      render: (row) => (
        <span className="max-w-md text-brand-muted">{row.reason}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <Badge>{row.status}</Badge>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) =>
        row.status === "Pending" ? (
          <div className="flex gap-2">
            <Button onClick={() => reviewDelayRequest(row.id, "Approved")}>
              Approve
            </Button>
            <Button
              variant="danger"
              onClick={() => reviewDelayRequest(row.id, "Rejected")}
            >
              Reject
            </Button>
          </div>
        ) : (
          <span className="text-sm text-brand-muted">Reviewed</span>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="section-title">Tasks Overview</h2>
            <p className="section-copy">
              Track progress across all tasks in your queue.
            </p>
          </div>

          <Button onClick={() => setTaskModalOpen(true)}>
            Create Task
          </Button>
        </div>
        <Table columns={taskColumns} rows={teamTasks} />
      </Card>

      <Card>
        <div className="mb-5">
          <h2 className="section-title">Delay Approval Panel</h2>
          <p className="section-copy">
            Review the full delay approval list for your team.
          </p>
        </div>
        {teamDelayRequests.length ? (
          <Table columns={delayColumns} rows={teamDelayRequests} />
        ) : (
          <div className="rounded-3xl bg-slate-50 p-6 text-sm text-brand-muted">
            No delay approval requests for your team right now.
          </div>
        )}
      </Card>

      <Modal
        title="Create and Assign Tasks"
        description="Break tickets into actionable tasks for employees."
        isOpen={taskModalOpen}
        onClose={() => setTaskModalOpen(false)}
      >
        <form
          className="space-y-4"
          onSubmit={async (event) => {
            event.preventDefault();
            await createTask(taskForm);
            setTaskForm({
              ticketId: assignedTickets[0]?.id || "",
              title: "",
              assigneeId: employeeOptions[0]?.id || "",
              dueDate: "",
            });
          }}
        >
          <InputField
            label="Ticket"
            as="select"
            value={taskForm.ticketId}
            options={assignedTickets.map((ticket) => ({
              value: ticket.id,
              label: `${ticket.ticketNumber || ticket.id} • ${ticket.title}`,
            }))}
            onChange={(event) =>
              setTaskForm((current) => ({
                ...current,
                ticketId: event.target.value,
              }))
            }
          />
          <InputField
            label="Task title"
            value={taskForm.title}
            placeholder="Describe the next action"
            onChange={(event) =>
              setTaskForm((current) => ({
                ...current,
                title: event.target.value,
              }))
            }
          />
          <InputField
            label="Assign to employee"
            as="select"
            value={taskForm.assigneeId}
            options={employeeOptions.map((employee) => ({
              value: employee.id,
              label: employee.name,
            }))}
            onChange={(event) =>
              setTaskForm((current) => ({
                ...current,
                assigneeId: event.target.value,
              }))
            }
          />
          <InputField
            label="Due date"
            type="date"
            value={taskForm.dueDate}
            min={todayDate}
            onChange={(event) =>
              setTaskForm((current) => ({
                ...current,
                dueDate: event.target.value,
              }))
            }
          />
          <Button
            className="w-full disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={
              !taskForm.ticketId ||
              !taskForm.title.trim() ||
              !taskForm.assigneeId ||
              !taskForm.dueDate
            }
          >
            Assign task
          </Button>
        </form>
      </Modal>
    </div>
  );
};
