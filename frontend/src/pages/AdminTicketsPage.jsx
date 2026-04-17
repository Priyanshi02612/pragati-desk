import { useMemo, useState } from "react";
import { useAppContext } from "../app/AppContext";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/InputField";
import { Table } from "../components/ui/Table";
import { ticketTypes } from "../data/mockData";

export const AdminTicketsPage = () => {
  const { createTicket, tickets, users } = useAppContext();
  const [ticketForm, setTicketForm] = useState({
    title: "",
    description: "",
    ticketType: "Task",
    priority: "Medium",
    department: "Support",
    assignedLeaderId: "leader-1",
  });

  const leaders = useMemo(
    () => users.filter((user) => user.role === "Team Leader"),
    [users],
  );

  const ticketColumns = [
    { key: "id", label: "Ticket ID" },
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
      key: "assignedLeaderId",
      label: "Assigned Leader",
      render: (row) =>
        users.find((user) => user.id === row.assignedLeaderId)?.name ||
        "Unknown",
    },
    {
      key: "priority",
      label: "Priority",
      render: (row) => (
        <Badge tone="bg-blue-50 text-brand-secondary">{row.priority}</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <div className="mb-5">
            <h2 className="section-title">Create Ticket</h2>
            <p className="section-copy">
              Add a title and clear description so team leaders and employees
              understand the work.
            </p>
          </div>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              createTicket(ticketForm);
              setTicketForm({
                title: "",
                description: "",
                ticketType: "Task",
                priority: "Medium",
                department: "Support",
                assignedLeaderId: leaders[0]?.id || "",
              });
            }}
          >
            <InputField
              label="Ticket title"
              value={ticketForm.title}
              placeholder="Enter ticket summary"
              onChange={(event) =>
                setTicketForm((current) => ({
                  ...current,
                  title: event.target.value,
                }))
              }
            />
            <InputField
              label="Ticket description"
              as="textarea"
              rows="5"
              value={ticketForm.description}
              placeholder="Explain the goal, expected output, and any important context."
              onChange={(event) =>
                setTicketForm((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Ticket type"
                as="select"
                value={ticketForm.ticketType}
                options={ticketTypes.map((type) => ({
                  value: type,
                  label: type,
                }))}
                onChange={(event) =>
                  setTicketForm((current) => ({
                    ...current,
                    ticketType: event.target.value,
                  }))
                }
              />
              <InputField
                label="Priority"
                as="select"
                value={ticketForm.priority}
                options={[
                  { value: "High", label: "High" },
                  { value: "Medium", label: "Medium" },
                  { value: "Low", label: "Low" },
                ]}
                onChange={(event) =>
                  setTicketForm((current) => ({
                    ...current,
                    priority: event.target.value,
                  }))
                }
              />
            </div>
            <InputField
              label="Department"
              value={ticketForm.department}
              onChange={(event) =>
                setTicketForm((current) => ({
                  ...current,
                  department: event.target.value,
                }))
              }
            />
            <InputField
              label="Assign to Team Leader"
              as="select"
              value={ticketForm.assignedLeaderId}
              options={leaders.map((leader) => ({
                value: leader.id,
                label: leader.name,
              }))}
              onChange={(event) =>
                setTicketForm((current) => ({
                  ...current,
                  assignedLeaderId: event.target.value,
                }))
              }
            />
            <Button
              className="w-full disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              variant="secondary"
              disabled={
                !ticketForm.title.trim() ||
                !ticketForm.description.trim() ||
                !ticketForm.ticketType ||
                !ticketForm.assignedLeaderId
              }
            >
              Submit ticket
            </Button>
          </form>
        </Card>

        <Card>
          <div className="mb-5">
            <h2 className="section-title">Tickets</h2>
            <p className="section-copy">
              Manage ticket details separately from employee records for better
              focus.
            </p>
          </div>
          <Table columns={ticketColumns} rows={tickets} />
        </Card>
      </div>
    </div>
  );
};
