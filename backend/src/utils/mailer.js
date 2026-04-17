const nodemailer = require("nodemailer");

const getMailerConfig = () => ({
  host: process.env.SMTP_HOST || "",
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  user: process.env.SMTP_USER || "",
  pass: process.env.SMTP_PASS || "",
  from: process.env.MAIL_FROM || process.env.SMTP_USER || "",
});

const createTransporter = () => {
  const config = getMailerConfig();

  if (!config.host || !config.user || !config.pass || !config.from) {
    throw new Error(
      "SMTP_HOST, SMTP_USER, SMTP_PASS, and MAIL_FROM must be configured",
    );
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
};

const sendUserCredentialsEmail = async ({ name, email, role, password }) => {
  const transporter = createTransporter();
  const loginUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const from = getMailerConfig().from;

  await transporter.sendMail({
    from,
    to: email,
    subject: `Your PragatiDesk ${role} account credentials`,
    text: [
      `Hi ${name},`,
      "",
      `Your PragatiDesk ${role} account has been created by the administrator.`,
      `Login URL: ${loginUrl}`,
      `Email: ${email}`,
      `Password: ${password}`,
      "",
      "Please sign in and change your password after your first login.",
    ].join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <p>Hi ${name},</p>
        <p>Your PragatiDesk <strong>${role}</strong> account has been created by the administrator.</p>
        <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
        <p><strong>Email:</strong> ${email}<br /><strong>Password:</strong> ${password}</p>
        <p>Please sign in and change your password after your first login.</p>
      </div>
    `,
  });
};

module.exports = {
  sendUserCredentialsEmail,
};
