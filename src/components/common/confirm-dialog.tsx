"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Accessible confirm dialog using the native <dialog> element.
 * Renders its trigger inline; opens via showModal().
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = "নিশ্চিত করুন",
  cancelLabel = "বাতিল",
  onConfirm,
  tone = "danger",
  children,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  tone?: "danger" | "primary";
  children?: React.ReactNode;
}): React.ReactNode {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => undefined;
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, []);

  function open(): void {
    ref.current?.showModal();
  }

  function close(): void {
    ref.current?.close();
  }

  function confirm(): void {
    close();
    onConfirm();
  }

  return (
    <>
      {children ? (
        <span onClick={open} role="presentation">
          {children}
        </span>
      ) : (
        <button type="button" className="btn-secondary" onClick={open}>
          {confirmLabel}
        </button>
      )}
      <dialog
        ref={ref}
        className="m-auto w-[min(92vw,26rem)] rounded-card border border-line bg-white p-0 shadow-card-hover backdrop:bg-black/40"
        aria-labelledby="confirm-dialog-title"
      >
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h2 id="confirm-dialog-title" className="text-base font-semibold text-ink">
              {title}
            </h2>
            <button
              type="button"
              onClick={close}
              className="btn-ghost -m-1.5 p-1.5"
              aria-label="বন্ধ করুন"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
          <p className="text-sm text-ink-muted">{message}</p>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={close}>
              {cancelLabel}
            </button>
            <button
              type="button"
              className={tone === "danger" ? "btn-danger" : "btn-primary"}
              onClick={confirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
