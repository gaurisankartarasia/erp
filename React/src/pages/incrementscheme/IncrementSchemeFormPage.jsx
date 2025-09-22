import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FormLayout from "@/components/layouts/FormLayout";
import FormInput from "@/components/common/forms/FormInput";
import apiClient from "@/api/axiosConfig";

const IncrementSchemeFormPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    rating: "",
    level: "",
    percentage: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.rating.trim()) newErrors.rating = "Rating is required.";
    else if (!/^[1-5]$/.test(formData.rating.trim()))
      newErrors.rating = "Rating must be an integer between 1 and 5.";

    if (!formData.level.trim()) newErrors.level = "Level is required.";

    if (!formData.percentage.trim())
      newErrors.percentage = "Percentage is required.";
    else if (isNaN(formData.percentage) || Number(formData.percentage) < 0)
      newErrors.percentage = "Percentage must be a positive number.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitError("");

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await apiClient.post("/increment-scheme/register", formData);
      navigate("/incrementschemes");
    } catch (err) {
      setSubmitError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/incrementschemes");
  };

  return (
    <FormLayout
      headerText="Create Increment Scheme"
      descriptionText="Fill in the details to add a new increment scheme."
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitText="Create Scheme"
      showCancel={true}
      onCancel={handleCancel}
    >
      {submitError && (
        <div className="text-red-600 mb-4 font-semibold">{submitError}</div>
      )}

      <FormInput
        name="rating"
        label="Rating (1 to 5)"
        type="number"
        min="1"
        max="5"
        value={formData.rating}
        onChange={handleChange}
        required
        error={errors.rating}
      />

      <FormInput
        name="level"
        label="Level"
        type="text"
        value={formData.level}
        onChange={handleChange}
        required
        error={errors.level}
      />

      <FormInput
        name="percentage"
        label="Percentage"
        type="number"
        step="0.01"
        min="0"
        value={formData.percentage}
        onChange={handleChange}
        required
        error={errors.percentage}
      />
    </FormLayout>
  );
};

export default IncrementSchemeFormPage;
