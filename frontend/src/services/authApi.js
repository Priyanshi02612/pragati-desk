import { apiRequest } from "./api";

export const loginUser = (credentials) =>
  apiRequest("/auth/login", {
    method: "POST",
    body: credentials,
  });

export const getCurrentUser = () =>
  apiRequest("/auth/me", {
    method: "GET",
  });

export const registerUser = (payload) => {
  return apiRequest("/auth/register", {
    method: "POST",
    body: {
      name: payload.name,
      email: payload.email,
      password: payload.password,
      role: payload.role,
      department: payload.department,
      performance: payload.performance,
      avatar: payload.avatar,
    },
  });
};
