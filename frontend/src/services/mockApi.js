import {
  delayRequests,
  leaderboard,
  notifications,
  performanceSeries,
  tasks,
  tickets,
  users,
} from "../data/mockData";

export const getInitialState = () => ({
  users,
  tickets,
  tasks,
  notifications,
  delayRequests,
  performanceSeries,
  leaderboard,
});

export const loginAsRole = (role) => {
  const userByRole = {
    Admin: users.find((user) => user.role === "Admin"),
    "Team Leader": users.find((user) => user.role === "Team Leader"),
    Employee: users.find((user) => user.role === "Employee"),
  };

  return userByRole[role];
};
