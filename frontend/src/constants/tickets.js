export const TicketType = {
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

export const TICKET_TYPES = Object.values(TicketType);

export const TICKET_PRIORITIES = ["Low", "Medium", "High"];
export const TICKET_STATUSES = ["Open", "In Progress", "Resolved", "Closed"];

export const DEFAULT_TICKET_PRIORITY = "Medium";
export const DEFAULT_TICKET_STATUS = "Open";
export const DEFAULT_TICKET_TYPE = "UI";
