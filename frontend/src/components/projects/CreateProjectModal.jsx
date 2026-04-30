import { useEffect, useMemo, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { InputField } from "../ui/InputField";

const emptyForm = {
  name: "",
  description: "",
  clientName: "",
  startDate: "",
  deadline: "",
  priority: "Medium",
  budget: "",
  teamLeaderId: "",
  teamMembers: "",
  tags: "",
  documents: "",
  status: "Planning",
};

export const CreateProjectModal = ({
  isOpen,
  onClose,
  onSubmit,
  leaders = [],
  members = [],
  project = null,
}) => {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!project) {
      setForm(emptyForm);
      return;
    }

    setForm({
      name: project.name,
      description: project.description,
      clientName: project.clientName,
      startDate: project.startDate,
      deadline: project.deadline,
      priority: project.priority,
      budget: project.budget || "",
      teamLeaderId: project.teamLeader.id,
      teamMembers: project.teamMembers.map((member) => member.id).join(","),
      tags: project.tags.join(", "),
      documents: project.documents?.join(", ") || "",
      status: project.status,
    });
  }, [project]);

  const leaderOptions = useMemo(
    () => [
      { label: "Select team leader", value: "" },
      ...leaders.map((leader) => ({ label: leader.name, value: leader.id })),
    ],
    [leaders],
  );

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const teamLeader = leaders.find((leader) => leader.id === form.teamLeaderId) || leaders[0];
    const selectedMembers = form.teamMembers
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => members.find((member) => member.id === value))
      .filter(Boolean);

    const documents = form.documents
      .split(",")
      .map((document) => document.trim())
      .filter(Boolean);

    onSubmit({
      ...project,
      name: form.name,
      description: form.description,
      clientName: form.clientName,
      startDate: form.startDate,
      deadline: form.deadline,
      priority: form.priority,
      budget: Number(form.budget) || 0,
      budgetSpent: project?.budgetSpent || 0,
      teamLeader,
      teamMembers: selectedMembers,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      documents,
      files:
        project?.files ||
        documents.map((document, index) => ({
          id: `FILE-${Date.now()}-${index}`,
          name: document,
          size: "Mock file",
          uploadedBy: "Admin",
          uploadedAt: new Date().toISOString().split("T")[0],
        })),
      status: form.status,
    });
    onClose();
  };

  return (
    <Modal
      title={project ? "Edit project" : "Create project"}
      description="Mock-data form now, backend integration later."
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-4xl"
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="Project Name"
            value={form.name}
            onChange={(event) => handleChange("name", event.target.value)}
            required
          />
          <InputField
            label="Client Name"
            value={form.clientName}
            onChange={(event) => handleChange("clientName", event.target.value)}
            required
          />
        </div>

        <InputField
          label="Project Description"
          as="textarea"
          rows={4}
          value={form.description}
          onChange={(event) => handleChange("description", event.target.value)}
          required
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InputField
            label="Start Date"
            type="date"
            value={form.startDate}
            onChange={(event) => handleChange("startDate", event.target.value)}
            required
          />
          <InputField
            label="Deadline"
            type="date"
            value={form.deadline}
            onChange={(event) => handleChange("deadline", event.target.value)}
            required
          />
          <InputField
            label="Priority"
            as="select"
            value={form.priority}
            options={[
              { label: "Low", value: "Low" },
              { label: "Medium", value: "Medium" },
              { label: "High", value: "High" },
              { label: "Urgent", value: "Urgent" },
            ]}
            onChange={(event) => handleChange("priority", event.target.value)}
          />
          <InputField
            label="Status"
            as="select"
            value={form.status}
            options={[
              { label: "Planning", value: "Planning" },
              { label: "Active", value: "Active" },
              { label: "On Hold", value: "On Hold" },
              { label: "Completed", value: "Completed" },
              { label: "Delayed", value: "Delayed" },
            ]}
            onChange={(event) => handleChange("status", event.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InputField
            label="Budget (optional)"
            type="number"
            value={form.budget}
            onChange={(event) => handleChange("budget", event.target.value)}
          />
          <InputField
            label="Assign Team Leader"
            as="select"
            value={form.teamLeaderId}
            options={leaderOptions}
            onChange={(event) => handleChange("teamLeaderId", event.target.value)}
            required
          />
          <InputField
            label="Team Members"
            placeholder="emp-1, emp-2"
            value={form.teamMembers}
            onChange={(event) => handleChange("teamMembers", event.target.value)}
          />
          <InputField
            label="Tags"
            placeholder="Dashboard, API, Analytics"
            value={form.tags}
            onChange={(event) => handleChange("tags", event.target.value)}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <InputField
            label="Upload documents/files"
            placeholder="PRD.pdf, Scope.docx"
            value={form.documents}
            onChange={(event) => handleChange("documents", event.target.value)}
          />
          <div className="rounded-3xl bg-slate-50 p-4 text-sm text-brand-muted">
            <p className="font-medium text-brand-text">Available member ids</p>
            <p className="mt-2 leading-6">
              {members.map((member) => `${member.id} (${member.name})`).join(", ")}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="muted" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit">{project ? "Save changes" : "Create project"}</Button>
        </div>
      </form>
    </Modal>
  );
};
