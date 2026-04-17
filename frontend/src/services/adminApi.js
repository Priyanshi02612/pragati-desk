import { apiRequest } from "./api";

export const getAdminUsers = () =>
  apiRequest("/admin/users", {
    method: "GET",
  });

export const getAdminLeaders = () =>
  apiRequest("/admin/leaders", {
    method: "GET",
  });

export const createAdminTicket = (payload) =>
  apiRequest("/admin/create-ticket", {
    method: "POST",
    body: {
      title: payload.title,
      description: payload.description,
      ticketType: payload.ticketType,
      priority: payload.priority,
      assignedLeaderId: payload.assignedLeaderId,
      department: payload.department,
    },
  });
