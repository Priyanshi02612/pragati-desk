const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { normalizeRole, serializeRole } = require("../utils/roles");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token is required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: serializeRole(user.role),
      department: user.department,
      performance: user.performance,
      avatar: user.avatar,
    };

    next();
  } catch (_error) {
    return res.status(401).json({ message: "Unauthorized access" });
  }
};

const authorizeRoles = (...allowedRoles) => {
  const normalizedAllowedRoles = allowedRoles
    .map((role) => normalizeRole(role))
    .filter(Boolean)
    .map((role) => serializeRole(role));

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    if (!normalizedAllowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  authorizeRoles,
};
