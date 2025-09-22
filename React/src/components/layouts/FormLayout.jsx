import React from "react";
import { Button } from "@/components/ui/button";

export default function FormLayout({
  headerText,
  children,
  onSubmit,
  onReset,
  onCancel,
  submitText = "Submit",
  showSubmit = true,
  showReset = false,
  showCancel = false,
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">{headerText}</h2>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit && onSubmit();
        }}
        className="shadow p-6"
      >
        <div className="grid grid-cols-2 gap-6">{children}</div>

        <div className="mt-6 flex gap-3 justify-start">
          {showSubmit && (
            <Button type="submit" variant="default">
              {submitText}
            </Button>
          )}
          {showReset && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onReset && onReset()}
            >
              Reset
            </Button>
          )}
          {showCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onCancel && onCancel()}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
