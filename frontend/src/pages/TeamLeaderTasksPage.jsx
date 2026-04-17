import { useEffect, useMemo, useState } from 'react';
import { useAppContext } from '../app/AppContext';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { InputField } from '../components/ui/InputField';
import { Table } from '../components/ui/Table';

export const TeamLeaderTasksPage = () => {
  const { createTask, currentUser, delayRequests, reviewDelayRequest, tasks, tickets, users } =
    useAppContext();
  const [taskForm, setTaskForm] = useState({
    ticketId: '',
    title: '',
    assigneeId: '',
    dueDate: '2026-04-18',
  });

  const assignedTickets = useMemo(
    () => tickets.filter((ticket) => ticket.assignedLeaderId === currentUser.id),
    [currentUser.id, tickets],
  );
  const employeeOptions = users.filter((user) => user.role === 'Employee');
  const teamTasks = tasks.filter((task) =>
    assignedTickets.some((ticket) => ticket.id === task.ticketId),
  );
  const pendingApprovals = delayRequests.filter((request) => request.status === 'Pending');

  useEffect(() => {
    if (!taskForm.ticketId && assignedTickets[0]?.id) {
      setTaskForm((current) => ({ ...current, ticketId: assignedTickets[0].id }));
    }

    if (!taskForm.assigneeId && employeeOptions[0]?.id) {
      setTaskForm((current) => ({ ...current, assigneeId: employeeOptions[0].id }));
    }
  }, [assignedTickets, employeeOptions, taskForm.assigneeId, taskForm.ticketId]);

  const taskColumns = [
    { key: 'title', label: 'Task' },
    { key: 'ticketId', label: 'Ticket' },
    {
      key: 'ticketType',
      label: 'Type',
      render: (row) => {
        const ticket = tickets.find((item) => item.id === row.ticketId);
        return <Badge tone="bg-amber-50 text-amber-700">{ticket?.ticketType || 'Task'}</Badge>;
      },
    },
    {
      key: 'assigneeId',
      label: 'Assigned To',
      render: (row) => users.find((user) => user.id === row.assigneeId)?.name || 'Unknown',
    },
    { key: 'dueDate', label: 'Due Date' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <Badge>{row.status}</Badge>,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <div className="mb-5">
            <h2 className="section-title">Create and Assign Tasks</h2>
            <p className="section-copy">Break tickets into actionable tasks for employees.</p>
          </div>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              createTask(taskForm);
              setTaskForm({
                ticketId: assignedTickets[0]?.id || '',
                title: '',
                assigneeId: employeeOptions[0]?.id || '',
                dueDate: '2026-04-18',
              });
            }}
          >
            <InputField
              label="Ticket"
              as="select"
              value={taskForm.ticketId}
              options={assignedTickets.map((ticket) => ({
                value: ticket.id,
                label: `${ticket.ticketType} • ${ticket.title}`,
              }))}
              onChange={(event) =>
                setTaskForm((current) => ({ ...current, ticketId: event.target.value }))
              }
            />
            <InputField
              label="Task title"
              value={taskForm.title}
              placeholder="Describe the next action"
              onChange={(event) =>
                setTaskForm((current) => ({ ...current, title: event.target.value }))
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
                setTaskForm((current) => ({ ...current, assigneeId: event.target.value }))
              }
            />
            <InputField
              label="Due date"
              type="date"
              value={taskForm.dueDate}
              onChange={(event) =>
                setTaskForm((current) => ({ ...current, dueDate: event.target.value }))
              }
            />
            <Button
              className="w-full disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              disabled={!taskForm.ticketId || !taskForm.title.trim() || !taskForm.assigneeId}
            >
              Assign task
            </Button>
          </form>
        </Card>

        <Card>
          <div className="mb-5">
            <h2 className="section-title">Tasks Overview</h2>
            <p className="section-copy">Track progress across all tasks in your queue.</p>
          </div>
          <Table columns={taskColumns} rows={teamTasks} />
        </Card>
      </div>

      <Card>
        <div className="mb-5">
          <h2 className="section-title">Delay Approval Panel</h2>
          <p className="section-copy">Approve or reject requests that block delivery dates.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {pendingApprovals.length ? (
            pendingApprovals.map((request) => {
              const task = tasks.find((item) => item.id === request.taskId);
              const employee = users.find((user) => user.id === request.employeeId);

              return (
                <div key={request.id} className="rounded-3xl border border-brand-border/70 bg-slate-50 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-brand-text">{task?.title}</h3>
                      <p className="mt-1 text-sm text-brand-muted">
                        Requested by {employee?.name} • {task?.ticketId}
                      </p>
                    </div>
                    <Badge>{request.status}</Badge>
                  </div>
                  <p className="mt-4 rounded-2xl bg-white p-4 text-sm leading-6 text-brand-muted">
                    {request.reason}
                  </p>
                  <div className="mt-4 flex gap-3">
                    <Button onClick={() => reviewDelayRequest(request.id, 'Approved')}>
                      Approve
                    </Button>
                    <Button variant="danger" onClick={() => reviewDelayRequest(request.id, 'Rejected')}>
                      Reject
                    </Button>
                  </div>
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
