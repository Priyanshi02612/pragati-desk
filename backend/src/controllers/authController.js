const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { normalizeRole, serializeRole } = require("../utils/roles");
const bcrypt = require("bcryptjs");
const {
  ensureFixedAdminUser,
  getFixedAdminConfig,
} = require("../utils/adminAccount");
const { sendUserCredentialsEmail } = require("../utils/mailer");
const { DEPARTMENT_OPTIONS } = require("../constants/departments");

const buildAuthResponse = (user) => {
  const token = jwt.sign(
    {
      id: user._id,
      role: serializeRole(user.role),
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: serializeRole(user.role),
      department: user.department,
      performance: user.performance,
      avatar: user.avatar,
    },
  };
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, department, performance, avatar } =
      req.body;

    if (!name || !email || !password || !department) {
      return res
        .status(400)
        .json({
          message: "Name, email, password, and department are required",
        });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const normalizedRole = normalizeRole(role) || "Employee";

    if (normalizedRole === "Admin") {
      return res.status(403).json({
        message:
          "Admin account uses fixed credentials and cannot be created here",
      });
    }

    if (!DEPARTMENT_OPTIONS.includes(department.trim())) {
      return res.status(400).json({ message: "Invalid department" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: normalizedRole,
      department: department.trim(),
      performance,
      avatar,
    });

    try {
      await sendUserCredentialsEmail({
        name: user.name,
        email: user.email,
        role: user.role,
        password,
      });
    } catch (mailError) {
      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        message:
          mailError.message ||
          "Credentials email could not be delivered, so the account was rolled back",
      });
    }

    return res.status(201).json({
      message: "User registered successfully",
      ...buildAuthResponse(user),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error.message || "Registration failed" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const normalizedEmail = email.toLowerCase();
    const fixedAdmin = getFixedAdminConfig();

    if (normalizedEmail === fixedAdmin.email) {
      const adminUser = await ensureFixedAdminUser();
      const isMatch = await bcrypt.compare(password, adminUser.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      return res.status(200).json({
        message: "Login successful",
        ...buildAuthResponse(adminUser),
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.status(200).json({
      message: "Login successful",
      ...buildAuthResponse(user),
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Login failed" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, department, avatar, currentPassword, newPassword } = req.body;

    if (!name?.trim() || !department?.trim()) {
      return res.status(400).json({
        message: "Name and department are required",
      });
    }

    if (!DEPARTMENT_OPTIONS.includes(department.trim())) {
      return res.status(400).json({ message: "Invalid department" });
    }

    user.name = name.trim();
    user.department = department.trim();
    user.avatar = avatar?.trim() || "";

    if (newPassword?.trim()) {
      if (!currentPassword?.trim()) {
        return res.status(400).json({
          message: "Current password is required to set a new password",
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword.trim(), salt);
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: serializeRole(user.role),
        department: user.department,
        performance: user.performance,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message || "Unable to update profile",
    });
  }
};

module.exports = {
  register,
  login,
  updateProfile,
};
