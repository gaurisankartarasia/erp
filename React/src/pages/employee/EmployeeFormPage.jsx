import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormLayout from "@/components/layouts/FormLayout";
import FormInput from "@/components/common/forms/FormInput";
import apiClient from "@/api/axiosConfig";
import { toast } from "sonner";

const EmployeeFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    picture: null,
    is_master: false,
    joined_at: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);

  useEffect(() => {
    if (!id) return;

    const fetchEmployee = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get(`/employee/employees/${id}`);
        const emp = res.data;

        setFormData({
          name: emp.name || "",
          email: emp.email || "",
          phone: emp.phone || "",
          address: emp.address || "",
          picture: null,
          is_master: emp.is_master || false,
          joined_at: emp.joined_at ? emp.joined_at.split("T")[0] : "",
        });
      } catch (err) {
        toast.error("Failed to load employee data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      picture: file,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) newErrors.email = "Email is required.";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required.";
    if (!formData.address.trim()) newErrors.address = "Address is required.";
    if (!formData.joined_at.trim())
      newErrors.joined_at = "Joining date is required.";

    if (!id && !formData.picture) newErrors.picture = "Picture is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.name);
      payload.append("email", formData.email);
      payload.append("phone", formData.phone);
      payload.append("address", formData.address);
      payload.append("joined_at", formData.joined_at);
      payload.append("is_master", formData.is_master);

      if (formData.picture) {
        payload.append("picture", formData.picture);
      }

      let res;
      if (id) {
        res = await apiClient.put(`/employee/edit/${id}`, payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Employee updated successfully!");
      } else {
        res = await apiClient.post("/employee/register", payload, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Employee registered successfully!");
        toast.info(`Generated Password: ${res.data.generatedPassword}`);
      }

      navigate("/employees");
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/employees");
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <p>Loading employee data...</p>
      </div>
    );
  }

  return (
    <FormLayout
      headerText={id ? "Edit Employee" : "Register Employee"}
      descriptionText={
        id
          ? "Update the details of the employee."
          : "Fill in the details to create a new employee record."
      }
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitText={id ? "Update Employee" : "Create Employee"}
      showCancel={true}
      onCancel={handleCancel}
    >
      <FormInput
        name="name"
        label="Full Name"
        value={formData.name}
        onChange={handleChange}
        required
        error={errors.name}
      />

      <FormInput
        name="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        error={errors.email}
      />

      <FormInput
        name="phone"
        label="Phone Number"
        type="text"
        value={formData.phone}
        onChange={handleChange}
        required
        error={errors.phone}
      />

      <div className="mb-4">
        <label
          htmlFor="picture"
          className="block text-sm font-medium text-gray-700"
        >
          Upload Picture {!id && <span className="text-red-500">*</span>}
          {id && (
            <span className="text-gray-500 text-xs block">
              (Leave blank to keep current picture)
            </span>
          )}
        </label>
        <input
          type="file"
          id="picture"
          accept="image/*"
          onChange={handleImageUpload}
          className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        />
        {errors.picture && (
          <p className="text-sm text-red-600 mt-1">{errors.picture}</p>
        )}
      </div>

      <FormInput
        name="address"
        label="Address"
        type="textarea"
        rows="3"
        value={formData.address}
        onChange={handleChange}
        required
        error={errors.address}
      />

      <FormInput
        name="joined_at"
        label="Joining Date"
        type="date"
        value={formData.joined_at}
        onChange={handleChange}
        required
        error={errors.joined_at}
      />

      <div className="flex items-center space-x-2 mt-4 col-span-2">
        <input
          id="is_master"
          name="is_master"
          type="checkbox"
          checked={formData.is_master}
          onChange={handleChange}
        />
        <label htmlFor="is_master" className="text-sm">
          Mark as Master Admin
        </label>
      </div>
    </FormLayout>
  );
};

export default EmployeeFormPage;
