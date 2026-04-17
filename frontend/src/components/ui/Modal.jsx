import { X } from 'lucide-react';

export const Modal = ({ title, description, isOpen, onClose, children }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="panel w-full max-w-lg p-6"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-brand-text">{title}</h3>
            {description ? <p className="mt-1 text-sm text-brand-muted">{description}</p> : null}
          </div>
          <button
            className="rounded-full p-2 text-brand-muted transition hover:bg-slate-100 hover:text-brand-text"
            onClick={onClose}
            type="button"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
