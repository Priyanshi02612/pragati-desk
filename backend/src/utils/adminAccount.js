const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {
  DEFAULT_DEPARTMENT,
  DEPARTMENT_OPTIONS,
} = require("../constants/departments");

const getFixedAdminConfig = () => ({
  name: (process.env.ADMIN_NAME || "Asha Verma").trim(),
  email: (process.env.ADMIN_EMAIL || "").trim().toLowerCase(),
  password: process.env.ADMIN_PASSWORD || "",
  department: (process.env.ADMIN_DEPARTMENT || DEFAULT_DEPARTMENT).trim(),
  avatar: (process.env.ADMIN_AVATAR || "AV").trim(),
});

const ensureFixedAdminUser = async () => {
  const config = getFixedAdminConfig();

  if (!config.email || !config.password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be configured");
  }

  if (!DEPARTMENT_OPTIONS.includes(config.department)) {
    throw new Error("ADMIN_DEPARTMENT must match a supported department");
  }

  const existingAdmin = await User.findOne({ email: config.email });
  const passwordMatches =
    existingAdmin &&
    existingAdmin.password &&
    (await bcrypt.compare(config.password, existingAdmin.password));

  const updates = {
    name: config.name,
    email: config.email,
    role: "Admin",
    department: config.department,
    avatar: config.avatar,
  };

  if (!passwordMatches) {
    const salt = await bcrypt.genSalt(10);
    updates.password = await bcrypt.hash(config.password, salt);
  }

  const adminUser = await User.findOneAndUpdate(
    { email: config.email },
    { $set: updates },
    {
      returnDocument: "after",
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    },
  );

  // Keep exactly one admin account active in the system.
  await User.updateMany(
    { _id: { $ne: adminUser._id }, role: "Admin" },
    { $set: { role: "Employee" } },
  );

  return adminUser;
};

module.exports = {
  ensureFixedAdminUser,
  getFixedAdminConfig,
};
