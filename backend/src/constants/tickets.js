const TicketType = {
  UI: "UI",
  FE: "FE",
  BE: "BE",
  API: "API",
  BUG: "BUG",
  FEATURE: "FEATURE",
  IMPROVEMENT: "IMPROVEMENT",
  TESTING: "TESTING",
  DEVOPS: "DEVOPS",
  DOCS: "DOCS",
};

const TICKET_TYPES = Object.values(TicketType);

const TICKET_PRIORITIES = ["Low", "Medium", "High"];
const TICKET_STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

const DEFAULT_TICKET_PRIORITY = "Medium";
const DEFAULT_TICKET_STATUS = "Open";
const DEFAULT_TICKET_TYPE = "UI";

module.exports = {
  TicketType,
  TICKET_TYPES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  DEFAULT_TICKET_PRIORITY,
  DEFAULT_TICKET_STATUS,
  DEFAULT_TICKET_TYPE,
};
