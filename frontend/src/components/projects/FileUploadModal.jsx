import { useState } from "react";
import { Paperclip, UploadCloud } from "lucide-react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

export const FileUploadModal = ({ isOpen, onClose, onSubmit }) => {
  const [files, setFiles] = useState([]);

  const handleSubmit = () => {
    onSubmit(files);
    setFiles([]);
    onClose();
  };

  return (
    <Modal
      title="Upload project files"
      description="Add shared docs, specifications, or delivery assets to this project."
      isOpen={isOpen}
      onClose={() => {
        setFiles([]);
        onClose();
      }}
    >
      <div className="rounded-3xl border border-dashed border-brand-border bg-slate-50 p-6 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-brand-secondary">
          <UploadCloud size={22} />
        </div>
        <p className="mt-4 text-sm font-medium text-brand-text">
          Drag and drop is ready for backend integration later.
        </p>
        <p className="mt-1 text-sm text-brand-muted">
          For now, choose files and we will add them to the mock shared documents list.
        </p>
        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-brand-secondary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800">
          <Paperclip size={16} />
          Choose files
          <input
            type="file"
            className="hidden"
            multiple
            onChange={(event) =>
              setFiles(
                Array.from(event.target.files || []).map((file) => ({
                  id: `FILE-${Date.now()}-${file.name}`,
                  name: file.name,
                  size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
                  uploadedBy: "You",
                  uploadedAt: new Date().toISOString().split("T")[0],
                })),
              )
            }
          />
        </label>
      </div>

      <div className="mt-5 space-y-2">
        {files.length ? (
          files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm"
            >
              <span className="font-medium text-brand-text">{file.name}</span>
              <span className="text-brand-muted">{file.size}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-brand-muted">No files selected yet.</p>
        )}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="muted" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!files.length}>
          Upload files
        </Button>
      </div>
    </Modal>
  );
};
