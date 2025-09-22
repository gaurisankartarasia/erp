import React, { useEffect, useState } from "react"; // 1. Import useState
import { useForm, Controller } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import FormLayout from "@/components/layouts/FormLayout";
import axios from 'axios';
import MessageModal from "@/components/common/modals/MessageModal"; // 2. Import your new modal

const SalaryComponentFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: "",
      type: "",
      is_days_based: true,
      is_base_component: false,
    },
  });

  const [loading, setLoading] = useState(false);
  
  // --- State for the Success Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  // ---

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      axios.get(`${import.meta.env.VITE_API_BASE_URL}/salary/components/${id}`)
        .then((response) => reset(response.data))
        .catch(() => toast.error("Failed to load component data."))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, reset]);

  // 3. This function now shows the modal instead of a toast on success
  const onFormSubmit = async (data) => {
    setLoading(true);
    try {
      if (isEdit) {
        await axios.put(`${import.meta.env.VITE_API_BASE_URL}/salary/components/${id}`, data);
        setModalMessage("Component updated successfully!");
      } else {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/salary/components`, data);
        setModalMessage("Component created successfully!");
      }
      // Show the modal instead of navigating
      setIsModalOpen(true);
    } catch (error) {
      // Still use toast for errors as it's less disruptive
      toast.error(error.response?.data?.message || "Failed to save component.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 4. This function is called when the modal's "Ok" button is clicked
  const handleModalCloseAndNavigate = () => {
    setIsModalOpen(false); // Close the modal
    navigate("/salary-components"); // THEN navigate to the list page
  };

  const handleCancel = () => navigate("/salary-components");
  const handleReset = () => reset();

  return (
    <div>
      {loading ? <p>Loading...</p> : (
        <FormLayout
          headerText={isEdit ? "Edit Salary Component" : "Create Salary Component"}
          onSubmit={handleSubmit(onFormSubmit)}
          onCancel={handleCancel}
          onReset={handleReset}
          submitText={isEdit ? "Update" : "Save"}
          showSubmit={true}
          showCancel={true}
          showReset={true}
        >
          {/* --- Your Form Fields (No Changes Needed Here) --- */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Component Name</Label>
              <Input id="name" {...register("name", { required: "Component name is required" })}/>
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label>Component Type</Label>
              <Controller
                name="type"
                control={control}
                rules={{ required: "Component type is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <SelectTrigger><SelectValue placeholder="-- Select Component Type --" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Earning">Earning</SelectItem>
                      <SelectItem value="Deduction">Deduction</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>}
            </div>
            <div>
              <Label>Days Based</Label>
              <Controller name="is_days_based" control={control} render={({ field }) => (
                  <Select onValueChange={(val) => field.onChange(val === "true")} value={String(field.value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
              )}/>
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Controller name="is_base_component" control={control} render={({ field }) => (
                  <Checkbox id="is_base_component" checked={field.value} onCheckedChange={field.onChange}/>
              )}/>
              <Label htmlFor="is_base_component">Is Base for Percentage?</Label>
            </div>
          </div>
        </FormLayout>
      )}

      {/* 5. Render the MessageModal and wire it up */}
      <MessageModal
        isOpen={isModalOpen}
        onClose={handleModalCloseAndNavigate}
        message={modalMessage}
        variant="success"
      />
    </div>
  );
};

export default SalaryComponentFormPage;