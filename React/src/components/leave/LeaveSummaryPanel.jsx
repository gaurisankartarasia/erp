import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useMessageModal } from "@/hooks/useMessageModal";
import { format } from "date-fns";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { calculateCalendarDays } from "@/utils/calculate-calender-days";

import {
  validateLeaveRequest,
  createSingleLeaveRequest,
  createSplitLeaveRequest,
} from "@/services/leave-service";
import SplitProposalDialog from "./SplitProposalDialog";

const summaryFormSchema = z.object({
  leave_type_id: z.string().min(1, { message: "Please select a leave type." }),
  reason: z.string().optional(),
});

const LeaveSummaryPanel = ({
  selectedDates,
  leaveTypes,
  onFormSubmit,
  onError,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [splitInfo, setSplitInfo] = useState(null);
  const [secondaryLeaveTypeId, setSecondaryLeaveTypeId] = useState(null);

  const message = useMessageModal()

  const form = useForm({
    resolver: zodResolver(summaryFormSchema),
    defaultValues: { reason: "", leave_type_id: "" },
  });

  const calendarDays = calculateCalendarDays(
    selectedDates?.from,
    selectedDates?.to
  );

  useEffect(() => {
    if (!selectedDates?.from || !selectedDates?.to) {
      form.reset();
    }
  }, [selectedDates, form]);

  const resetAll = () => {
    setIsSubmitting(false);
    setSplitInfo(null);
    setSecondaryLeaveTypeId(null);
    form.reset();
  };

  const handleValidation = async (formData) => {
    setIsSubmitting(true);
    const submissionData = {
      leave_type_id: formData.leave_type_id,
      reason: formData.reason,
      start_date: format(selectedDates.from, "yyyy-MM-dd"),
      end_date: format(selectedDates.to, "yyyy-MM-dd"),
    };

    try {
      const validationResponse = await validateLeaveRequest(submissionData);

      if (validationResponse.status === "ok") {
        await createSingleLeaveRequest(submissionData);
        message.success("Leave request submitted successfully." )
        resetAll();
        onFormSubmit();
      } else if (validationResponse.status === "split_proposal") {
        setSplitInfo(validationResponse);
        setIsSubmitting(false);
      } else if (validationResponse.status === "insufficient_balance") {
      
        setIsSubmitting(false);
       message.error(validationResponse.message || "Something went wrong" )
      }
    } catch (error) {
      
      if (onError) onError(error.message);
      setIsSubmitting(false);
message.error(error.response?.data?.message || "Something went wrong")

    }
  };

  const handleConfirmSplit = async () => {
    if (!secondaryLeaveTypeId) {
      toast.warning("Please select a leave type for the remaining days.");
      return;
    }
    setIsSubmitting(true);

    const payload = {
      primary: splitInfo.proposal.primary,
      secondary: {
        ...splitInfo.proposal.secondary,
        leave_type_id: secondaryLeaveTypeId,
      },
      reason: form.getValues("reason") || "",
    };

    try {
      await createSplitLeaveRequest(payload);
      toast.success("Split leave request submitted successfully.");
      resetAll();
      onFormSubmit();
    } catch (error) {
      toast.error("Submission Failed", { description: error.message });
      setIsSubmitting(false);
    }
  };

  if (!selectedDates?.from || !selectedDates?.to) {
    return (
      <Card className="h-fit flex items-center justify-center">
        <p className="text-muted-foreground">
          Select a date range on the calendar.
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Request Summary</CardTitle>
          <CardDescription>
            {format(selectedDates.from, "PPP")} to{" "}
            {format(selectedDates.to, "PPP")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg mb-6 text-center">
            <p className="text-sm text-muted-foreground">Total Calendar Days</p>
            <p className="text-3xl font-bold">{calendarDays}</p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleValidation)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="leave_type_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Leave Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a leave type..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {leaveTypes.map((lt) => (
                          <SelectItem key={lt.id} value={String(lt.id)}>
                            {lt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a brief reason for your leave..."
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || calendarDays <= 0}
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <SplitProposalDialog
        isOpen={!!splitInfo}
        isSubmitting={isSubmitting}
        message={splitInfo?.message}
        proposal={splitInfo?.proposal}
        leaveTypes={leaveTypes}
        onCancel={() => setSplitInfo(null)}
        onSecondaryTypeChange={setSecondaryLeaveTypeId}
        onSubmit={handleConfirmSplit}
        limitingFactor={splitInfo?.limitingFactor}
      />
    </>
  );
};

export default LeaveSummaryPanel;
