import { Button } from "../ui/Button";
import { InputField } from "../ui/InputField";
import { Modal } from "../ui/Modal";

export const DelayReasonModal = ({
  task,
  delayReason,
  onDelayReasonChange,
  onClose,
  onSubmit,
}) => (
  <Modal
    title="Submit Delay Reason"
    description="Share the blocker so your team leader can review the request."
    isOpen={Boolean(task)}
    onClose={onClose}
  >
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <InputField
        label="Reason"
        as="textarea"
        rows="4"
        value={delayReason}
        placeholder="Describe the issue causing the delay"
        onChange={(event) => onDelayReasonChange(event.target.value)}
      />
      <div className="flex justify-end gap-3">
        <Button variant="muted" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!delayReason.trim()}
          className="disabled:cursor-not-allowed disabled:opacity-60"
        >
          Submit request
        </Button>
      </div>
    </form>
  </Modal>
);
