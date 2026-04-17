import { useMemo, useState } from "react";
import { useAppContext } from "../app/AppContext";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { InputField } from "../components/ui/InputField";
import { Modal } from "../components/ui/Modal";
import { Table } from "../components/ui/Table";
import { Avatar } from "../components/ui/Avatar";
import { uploadImageToCloudinary } from "../services/cloudinaryApi";
import { formatPercent } from "../utils/format";

export const AdminEmployeesPage = () => {
  const { createEmployee, users } = useAppContext();
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Employee",
    department: "",
    avatarFile: null,
    avatar: "",
  });

  const employeeColumns = [
    {
      key: "name",
      label: "Members",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.avatar} name={row.name} size="sm" />
          <div>
            <p className="font-medium text-brand-text">{row.name}</p>
            <p className="text-xs text-brand-muted">{row.role}</p>
          </div>
        </div>
      ),
    },
    { key: "department", label: "Department" },
    { key: "email", label: "Email" },
    {
      key: "performance",
      label: "Performance",
      render: (row) => (
        <span
          className={
            row.performance < 85 ? "font-semibold text-brand-danger" : ""
          }
        >
          {formatPercent(row.performance)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="section-title">Team members</h2>
            <p className="section-copy">
              Create employee and team leader accounts separately from ticket
              management for a cleaner admin workflow.
            </p>
          </div>
          <Button onClick={() => setEmployeeModalOpen(true)}>
            Create team member
          </Button>
        </div>
        <Table columns={employeeColumns} rows={users} />
      </Card>

      <Modal
        title="Create Team Member"
        description="Add an employee or team leader profile. Login credentials will be emailed automatically after creation, and the admin account is fixed separately."
        isOpen={employeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitError("");
            setIsSubmitting(true);
            Promise.resolve()
              .then(async () => {
                let avatar = employeeForm.avatar;

                if (employeeForm.avatarFile) {
                  setIsUploadingImage(true);
                  avatar = await uploadImageToCloudinary(
                    employeeForm.avatarFile,
                  );
                }

                return createEmployee({
                  ...employeeForm,
                  avatar,
                });
              })
              .then(() => {
                setEmployeeForm({
                  name: "",
                  email: "",
                  password: "",
                  role: "Employee",
                  department: "",
                  avatarFile: null,
                  avatar: "",
                });
                setEmployeeModalOpen(false);
              })
              .catch((error) => {
                setSubmitError(error.message || "Unable to create team member");
              })
              .finally(() => {
                setIsUploadingImage(false);
                setIsSubmitting(false);
              });
          }}
        >
          <InputField
            label="Full name"
            value={employeeForm.name}
            onChange={(event) =>
              setEmployeeForm((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
          />
          <InputField
            label="Email"
            value={employeeForm.email}
            onChange={(event) =>
              setEmployeeForm((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
          />
          <InputField
            label="Password"
            type="password"
            value={employeeForm.password}
            onChange={(event) =>
              setEmployeeForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
          />
          <InputField
            label="Role"
            as="select"
            value={employeeForm.role}
            options={[
              { value: "Employee", label: "Employee" },
              { value: "Team Leader", label: "Team Leader" },
            ]}
            onChange={(event) =>
              setEmployeeForm((current) => ({
                ...current,
                role: event.target.value,
              }))
            }
          />
          <InputField
            label="Department"
            value={employeeForm.department}
            onChange={(event) =>
              setEmployeeForm((current) => ({
                ...current,
                department: event.target.value,
              }))
            }
          />
          <InputField
            label="Avatar"
            type="file"
            accept="image/*"
            onChange={(event) =>
              setEmployeeForm((current) => ({
                ...current,
                avatarFile: event.target.files?.[0] || null,
              }))
            }
          />
          {employeeForm.avatarFile ? (
            <p className="text-sm text-brand-muted">
              Selected image: {employeeForm.avatarFile.name}
            </p>
          ) : null}
          {submitError ? (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-brand-danger">
              {submitError}
            </div>
          ) : null}
          <div className="flex justify-end gap-3">
            <Button variant="muted" onClick={() => setEmployeeModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                isUploadingImage ||
                !employeeForm.name.trim() ||
                !employeeForm.email.trim() ||
                !employeeForm.password.trim() ||
                !employeeForm.department.trim()
              }
              className="disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploadingImage
                ? "Uploading image..."
                : isSubmitting
                  ? "Saving..."
                  : "Save team member"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
