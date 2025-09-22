import React, { useState, useEffect, useRef } from "react";
import FormLayout from "@/components/layouts/FormLayout";
import FormInput from "@/components/common/forms/FormInput";
import apiClient from "@/api/axiosConfig";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera } from "lucide-react";

const AccountPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    image: "",
    pictureFile: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const res = await apiClient.get("/employee/employee/account");
        const emp = res.data;

        setFormData({
          name: emp.name || "",
          email: emp.email || "",
          phone: emp.phone || "",
          image: emp.picture || emp.image || "",
          pictureFile: null,
        });
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Failed to load account data."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        image: reader.result,
        pictureFile: file,
      }));
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
    ) {
      newErrors.email = "Invalid email address.";
    }
    if (formData.phone && !/^\+?[\d\s\-()]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.apCamerad("name", formData.name);
      payload.apCamerad("email", formData.email);
      payload.apCamerad("phone", formData.phone);

      if (formData.pictureFile) {
        payload.apCamerad("picture", formData.pictureFile);
      }

      await apiClient.put("/employee/employee/account/edit", payload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Account updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormLayout
      headerText="Update Account"
      descriptionText="Update your personal information below."
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitText="Save Changes"
      cancelPath="/"
    >
      <div className="flex justify-center mb-8 relative">
        {isLoading ? (
          <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse" />
        ) : (
          <>
            {/* <img
              src={formData.image || "/default-profile.png"}
              alt="Profile Preview"
              className="w-32 h-32 rounded-full object-cover border border-gray-300 shadow-md"
              onError={(e) => (e.target.src = "/default-profile.png")}
            /> */}
            <Avatar  className={"w-32 h-32 rounded-full"} >
              <AvatarImage
                src={formData.image}
                alt="Profile Preview"
                className=" object-cover border border-gray-300 shadow-md"
              />
              <AvatarFallback>{formData.name.slice(0,2)}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Change Profile Picture"
              className="text-gray-500 h-fit w-fit"
            >
            <Camera  size={"15"} />
            </button>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </>
        )}
      </div>

      {!isLoading && (
        <>
          <FormInput
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            required
            error={errors.name}
          />
          <FormInput
            name="email"
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
            error={errors.email}
          />
          <FormInput
            name="phone"
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
            error={errors.phone}
          />
        </>
      )}
    </FormLayout>
  );
};

export default AccountPage;
