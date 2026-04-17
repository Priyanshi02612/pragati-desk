const roleLabelByValue = {
  admin: "Admin",
  team_leader: "Team Leader",
  employee: "Employee",
};

export const toRoleLabel = (role) => {
  if (!role) {
    return "Employee";
  }

  return roleLabelByValue[role] || role;
};

export const toRoleValue = (role) => {
  if (!role) {
    return "employee";
  }

  return role.toLowerCase().replace(/\s+/g, "_");
};
