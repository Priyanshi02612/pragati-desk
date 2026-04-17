const Department = {
  ENGINEERING: "Engineering",
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  DESIGN: "Design",
  QA: "QA",
  DEVOPS: "DevOps",
  SUPPORT: "Support",
  OPERATIONS: "Operations",
  PRODUCT: "Product",
  DOCUMENTATION: "Documentation",
};

const DEPARTMENT_OPTIONS = Object.values(Department);
const DEFAULT_DEPARTMENT = Department.SUPPORT;

module.exports = {
  Department,
  DEPARTMENT_OPTIONS,
  DEFAULT_DEPARTMENT,
};
