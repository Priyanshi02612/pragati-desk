import { X } from "lucide-react";
import { Button } from "../ui/Button";
import { InputField } from "../ui/InputField";

const priorityOptions = [
  { label: "All Priorities", value: "" },
  { label: "Low", value: "Low" },
  { label: "Medium", value: "Medium" },
  { label: "High", value: "High" },
  { label: "Urgent", value: "Urgent" },
];

const statusOptions = [
  { label: "All Statuses", value: "" },
  { label: "Planning", value: "Planning" },
  { label: "Active", value: "Active" },
  { label: "On Hold", value: "On Hold" },
  { label: "Completed", value: "Completed" },
  { label: "Delayed", value: "Delayed" },
];

export const FilterDrawer = ({
  isOpen,
  onClose,
  filters,
  onChange,
  leaderOptions = [],
  onReset,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
        type="button"
        onClick={onClose}
        aria-label="Close filters"
      />
      <div className="panel absolute right-0 top-0 h-full w-full max-w-sm rounded-none rounded-l-3xl p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-brand-text">Filters</h3>
            <p className="text-sm text-brand-muted">
              Narrow projects by status, owner, priority, and deadline.
            </p>
          </div>
          <button
            className="rounded-full p-2 text-brand-muted transition hover:bg-slate-100 hover:text-brand-text"
            onClick={onClose}
            type="button"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <InputField
            label="Status"
            as="select"
            value={filters.status}
            options={statusOptions}
            onChange={(event) => onChange("status", event.target.value)}
          />
          <InputField
            label="Priority"
            as="select"
            value={filters.priority}
            options={priorityOptions}
            onChange={(event) => onChange("priority", event.target.value)}
          />
          <InputField
            label="Team Leader"
            as="select"
            value={filters.teamLeader}
            options={[
              { label: "All Leaders", value: "" },
              ...leaderOptions.map((leader) => ({
                label: leader,
                value: leader,
              })),
            ]}
            onChange={(event) => onChange("teamLeader", event.target.value)}
          />
          <InputField
            label="Deadline Before"
            type="date"
            value={filters.deadline}
            onChange={(event) => onChange("deadline", event.target.value)}
          />
        </div>

        <div className="mt-6 flex gap-3">
          <Button className="flex-1" onClick={onClose}>
            Apply
          </Button>
          <Button className="flex-1" variant="muted" onClick={onReset}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};
