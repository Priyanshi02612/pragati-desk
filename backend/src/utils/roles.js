const ROLE_MAP = {
  admin: "Admin",
  team_leader: "Team Leader",
  employee: "Employee",
};

const normalizeRole = (role) => {
  if (!role) {
    return null;
  }

  const formattedRole = role.toString().trim().toLowerCase().replace(/\s+/g, "_");
  return ROLE_MAP[formattedRole] || null;
};

const serializeRole = (role) => {
  if (!role) {
    return null;
  }

  return role.toString().trim().toLowerCase().replace(/\s+/g, "_");
};

module.exports = {
  normalizeRole,
  serializeRole,
};
