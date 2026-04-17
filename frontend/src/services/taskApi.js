import { apiRequest } from "./api";

export const getTasks = () =>
  apiRequest("/tickets/tasks", {
    method: "GET",
  });

export const createLeaderTask = (payload) =>
  apiRequest("/leader/create-task", {
    method: "POST",
    body: {
      ticketId: payload.ticketId,
      title: payload.title,
      assigneeId: payload.assigneeId,
      dueDate: payload.dueDate,
    },
  });
