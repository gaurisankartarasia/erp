import React from "react";

// Shadcn/ui components assumed available in the project
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Reusable confirmation modal
 * Props:
 * - isOpen: boolean (controlled visibility)
 * - onClose: () => void (close handler)
 * - onConfirm: () => void (confirm action)
 * - title: string or ReactNode (modal title)
 * - description: string or ReactNode (modal body)
 * - confirmText: string (text for confirm button) - default: "Confirm"
 * - cancelText: string (text for cancel button) - default: "Cancel"
 * - confirmIntent: "danger" | "primary" | "default" (affects styling) - default: "primary"
 *
 * This component uses shadcn-style Dialog and Button components. If your project exposes
 * different paths for these components, update the import paths accordingly.
 */

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
}) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose && onClose()}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="mt-2">{description}</DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} aria-label="Cancel">
            Cancel
          </Button>

          <Button onClick={onConfirm} aria-label="Confirm">
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
