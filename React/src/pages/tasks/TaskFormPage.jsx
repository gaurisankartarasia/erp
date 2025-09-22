
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import FormLayout from "@/components/layouts/FormLayout";
import FormInput from "@/components/common/forms/FormInput";
import apiClient from "@/api/axiosConfig";
import { Spinner } from "@/components/ui/spinner";
import { useMessageModal } from "@/hooks/useMessageModal";

const TaskFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const message = useMessageModal()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    durationHours: "",
    durationMinutes: "",
  });
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEditing) {
      const fetchTask = async () => {
        try {
          const response = await apiClient.get(`/tasks/${id}`);
          const { title, description, assigned_duration_minutes } = response.data;
          const hours = assigned_duration_minutes ? Math.floor(assigned_duration_minutes / 60) : "";
          const minutes = assigned_duration_minutes ? assigned_duration_minutes % 60 : "";
          setFormData({
            title,
            description: description || "",
            durationHours: hours.toString(),
            durationMinutes: minutes.toString(),
          });
        } catch (error) {
           message.error( error?.response?.data?.message || "Something went wrong.")
          navigate("/tasks");
        } finally {
          setIsLoading(false);
        }
      };
      fetchTask();
    }
  }, [id, isEditing, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required.";
    }
    const hours = parseInt(formData.durationHours || 0, 10);
    const minutes = parseInt(formData.durationMinutes || 0, 10);
    if (hours * 60 + minutes <= 0) {
      newErrors.duration = "A valid duration must be set.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
 
    if (!validateForm()) return;

    setIsSubmitting(true);
    const totalMinutes = (parseInt(formData.durationHours || 0, 10) * 60) + parseInt(formData.durationMinutes || 0, 10);
    const taskData = {
      title: formData.title,
      description: formData.description,
      assigned_duration_minutes: totalMinutes,
    };

    try {
      if (isEditing) {
        await apiClient.put(`/tasks/${id}`, taskData);
        message.success("Task updated successfully.")
      } else {
        await apiClient.post("/tasks", taskData);
        message.success("Task created successfully.")
      }
      navigate("/tasks");
    } catch (err) {
           showMessage({message: err?.response?.data?.message || "Something went wrong.", variant:"danger" })
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="large" /></div>;
  }

  return (
    <FormLayout
      headerText={isEditing ? "Edit Task" : "Add New Task"}
      descriptionText="Fill in the details below to manage a task."
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitText={isEditing ? "Save Changes" : "Create Task"}
      cancelPath="/tasks"
    >
      <FormInput
        name="title"
        label="Task Title"
        value={formData.title}
        onChange={handleChange}
        placeholder="e.g., Design the new dashboard"
        required
        error={errors.title}
      />
      <FormInput
        name="description"
        label="Description"
        type="textarea"
        value={formData.description}
        onChange={handleChange}
        placeholder="Provide a detailed description of the task..."
        rows="4"
      />
      <div>
        <label className="text-sm font-medium">Estimated Duration</label>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <FormInput
            name="durationHours"
            type="number"
            value={formData.durationHours}
            onChange={handleChange}
            placeholder="Hours"
          />
          <FormInput
            name="durationMinutes"
            type="number"
            value={formData.durationMinutes}
            onChange={handleChange}
            placeholder="Minutes"
          />
        </div>
        {errors.duration && <p className="text-sm text-destructive mt-2">{errors.duration}</p>}
      </div>
    </FormLayout>
  );
};

export default TaskFormPage;