
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import FormLayout from "@/components/layouts/FormLayout";
import MessageModal from "@/components/common/modals/MessageModal";
import { createLeaveType, updateLeaveType, getLeaveTypeById } from "@/services/rule-services"

const LeaveTypesManager = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalVariant, setModalVariant] = useState("info");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();

  // Fetch leave type data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchLeaveType = async () => {
        try {
          const leaveType = await getLeaveTypeById(id);
          setValue("name", leaveType.name);
          setValue("monthly_allowance_days", leaveType.monthly_allowance_days);
          setValue("max_days_per_request", leaveType.max_days_per_request);
          setValue("is_unpaid", leaveType.is_unpaid);
        } catch (error) {
          console.error("Error fetching leave type:", error);
          showModal("Error loading leave type data", "danger");
        }
      };
      fetchLeaveType();
    }
  }, [id, isEditMode, setValue]);

  const showModal = (message, variant = "info") => {
    setModalMessage(message);
    setModalVariant(variant);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleFormSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const formData = {
        ...data,
        monthly_allowance_days: data.monthly_allowance_days ? parseInt(data.monthly_allowance_days) : null,
        max_days_per_request: data.max_days_per_request ? parseInt(data.max_days_per_request) : null,
        is_unpaid: data.is_unpaid || false
      };

      if (isEditMode) {
        await updateLeaveType(id, formData);
        showModal("Leave type updated successfully!", "success");

        // Navigate after short delay
        setTimeout(() => {
          navigate("/rules");
        }, 1500);

      } else {
        await createLeaveType(formData);
        showModal("Leave type created successfully!", "success");

        // Navigate after short delay
        setTimeout(() => {
          navigate("/rules");
        }, 1500);
      }

      reset();

    } catch (error) {
      console.error("Error saving leave type:", error);
      showModal(`Error ${isEditMode ? "updating" : "creating"} leave type. Please try again.`, "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/leave-types");
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div>
      <FormLayout
        headerText={isEditMode ? "Edit Leave Type" : "Create Leave Type"}
        onSubmit={handleSubmit(handleFormSubmit)}
        onReset={handleReset}
        onCancel={handleCancel}
        showSubmit={true}
        showReset={true}
        showCancel={true}
        submitText={isEditMode ? "Update" : "Submit"}
        isSubmitting={isSubmitting}
      >
        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            {...register("name", { required: "Name is required" })}
            className="w-full px-4 py-3 border-none rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        {/* Monthly Allowance Days Input */}
        <div>
          <label htmlFor="monthly_allowance_days" className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Allowance Days
          </label>
          <input
            type="number"
            id="monthly_allowance_days"
            min="0"
            {...register("monthly_allowance_days")}
            className="w-full px-4 py-3 border-none rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Max Days Per Request Input */}
        <div>
          <label htmlFor="max_days_per_request" className="block text-sm font-medium text-gray-700 mb-2">
            Max Days Per Request
          </label>
          <input
            type="number"
            id="max_days_per_request"
            min="0"
            {...register("max_days_per_request")}
            className="w-full px-4 py-3 border-none rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Is Unpaid? Checkbox */}
        <div className="flex items-center pt-2">
          <input
            id="is_unpaid"
            type="checkbox"
            {...register("is_unpaid")}
            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled={isSubmitting}
          />
          <label htmlFor="is_unpaid" className="ml-3 block text-sm text-gray-800">
            Is Unpaid? (Deducts from salary)
          </label>
        </div>
      </FormLayout>

      {/* Message Modal */}
      <MessageModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        message={modalMessage}
        variant={modalVariant}
      />
    </div>
  );
};

export default LeaveTypesManager;
