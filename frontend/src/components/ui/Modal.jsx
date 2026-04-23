import {
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { X } from "lucide-react";

export const Modal = ({
  title,
  description,
  isOpen,
  onClose,
  children,
  className = "",
  maxWidth="max-w-lg",
  hideHeader = false,
}) => {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div
        className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm"
        aria-hidden="true"
      />
      <div className="fixed inset-0 overflow-y-auto p-4">
        <div className="flex min-h-full items-center justify-center">
          <DialogPanel className={`panel w-full p-6 ${className} ${maxWidth}`}>
            {!hideHeader ? (
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <DialogTitle className="text-xl font-semibold text-brand-text">
                    {title}
                  </DialogTitle>
                  {description ? (
                    <Description className="mt-1 text-sm text-brand-muted">
                      {description}
                    </Description>
                  ) : null}
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
            ) : null}
            {children}
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};
