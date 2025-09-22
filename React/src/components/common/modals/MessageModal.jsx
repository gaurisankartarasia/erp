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
import { cn } from "@/lib/utils"; // assuming cn helper available

/**
 * Reusable MessageModal with variants
 * Props:
 * - isOpen: boolean (controlled visibility)
 * - onClose: () => void (close handler)
 * - title: string or ReactNode (modal title)
 * - description: string or ReactNode (modal body)
 * - variant: "info" | "success" | "warning" | "danger" (affects styling)
 * - actionText: string (text for action button) - default: "OK"
 *
 * Variants apply color styling for emphasis.
 */

export default function MessageModal({
  isOpen,
  onClose,
  message,
  variant = "info",
}) {
  const variantStyles = {
    info: "text-blue-600",
    success: "text-green-600",
    warning: "text-yellow-600",
    danger: "text-red-600",
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => !open && onClose && onClose()}
    >
      <DialogContent className="[&>button]:hidden">
        <DialogHeader>
          <DialogTitle
            className={cn("font-semibold text-center", variantStyles[variant])}
          >
            {message}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 flex justify-center">
          <Button onClick={onClose} aria-label="Close">
            Ok
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
