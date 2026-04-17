import { useEffect, useMemo, useState } from "react";
import { useAppContext } from "../app/AppContext";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/InputField";
import { Table } from "../components/ui/Table";
import {
  DEFAULT_TICKET_PRIORITY,
  DEFAULT_TICKET_TYPE,
  TICKET_PRIORITIES,
  TICKET_TYPES,
} from "../constants/tickets";
import { getAdminLeaders } from "../services/adminApi";

const normalizeLeader = (leader) => ({
  ...leader,
  id: leader.id || leader._id,
});

export const AdminTicketsPage = () => {
  const { createTicket, tickets, users } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaders, setLeaders] = useState([]);

  const [ticketForm, setTicketForm] = useState({
    title: "",
    description: "",
    ticketType: DEFAULT_TICKET_TYPE,
    priority: DEFAULT_TICKET_PRIORITY,
    department: "Support",
    assignedLeaderId: leaders[0]?.id || "",
  });

  useEffect(() => {
    let isMounted = true;

    getAdminLeaders()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setLeaders((response.leaders || []).map(normalizeLeader));
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setLeaders([]);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!leaders.length) {
      return;
    }

    setTicketForm((current) => {
      if (current.assignedLeaderId) {
        return current;
      }

      return {
        ...current,
        assignedLeaderId: leaders[0].id,
      };
    });
  }, [leaders]);

  const leaderLookup = useMemo(() => {
    const knownUsers = users.map((user) => [user.id, user.name]);
    const fetchedLeaders = leaders.map((leader) => [leader.id, leader.name]);
    return new Map([...knownUsers, ...fetchedLeaders]);
  }, [leaders, users]);

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
      key: "assignedLeaderId",
      label: "Assigned Leader",
      render: (row) => leaderLookup.get(row.assignedLeaderId) || "Unknown",
    },
    {
      key: "priority",
      label: "Priority",
      render: (row) => (
        <Badge tone="bg-blue-50 text-brand-secondary">{row.priority}</Badge>
      ),
    },
  ];

  const handleFormSubmit = (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    Promise.resolve()
      .then(() => createTicket(ticketForm))
      .then(() => {
        setTicketForm({
          title: "",
          description: "",
          ticketType: DEFAULT_TICKET_TYPE,
          priority: DEFAULT_TICKET_PRIORITY,
          department: "Support",
          assignedLeaderId: leaders[0]?.id || "",
        });
      })
      .catch((error) => {
        console.log(error.message || "Unable to create ticket");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

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
              handleFormSubmit(event);
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
                options={TICKET_TYPES.map((type) => ({
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
                options={TICKET_PRIORITIES.map((priority) => ({
                  value: priority,
                  label: priority,
                }))}
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
                isSubmitting ||
                !ticketForm.title.trim() ||
                !ticketForm.description.trim() ||
                !ticketForm.ticketType ||
                !ticketForm.assignedLeaderId
              }
            >
              {isSubmitting ? "Submitting..." : "Submit ticket"}
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
