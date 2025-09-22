import React, { useState, useEffect, useCallback } from "react";
import FormLayout from "@/components/layouts/FormLayout";
import FormSelect from "@/components/common/forms/FormSelect";
import PermissionSelector from "@/components/permissions/PermissionSelector";
import apiClient from "@/api/axiosConfig";
import { useMessageModal } from "@/hooks/useMessageModal";

const AssignPermissionPage = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialPermissions, setInitialPermissions] = useState([]);
  const message = useMessageModal();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await apiClient.get("/page-permissions/employees");
        setEmployees(
          response.data.map((emp) => ({
            value: emp.id.toString(),
            label: `${emp.name} (${emp.email})`,
          }))
        );
      } catch (error) {
        message.error(
          error.response?.data?.message || "Failed to fetch employees."
        );
      }
    };
    fetchEmployees();
  }, []);

  const fetchEmployeePermissions = useCallback(async (employeeId) => {
    if (!employeeId) {
      setSelectedPermissions([]);
      setInitialPermissions([]);
      return;
    }
    try {
      const response = await apiClient.get(
        `/page-permissions/${employeeId}/permissions`
      );
      const permissionIds = response.data.map((p) => p.id);
      setSelectedPermissions(permissionIds);
      setInitialPermissions(permissionIds);
    } catch (error) {
      message.error("Failed to fetch employee permissions.");
      setSelectedPermissions([]);
      setInitialPermissions([]);
    }
  }, []);

  useEffect(() => {
    fetchEmployeePermissions(selectedEmployee);
  }, [selectedEmployee, fetchEmployeePermissions]);

  const handleSubmit = async () => {
    if (!selectedEmployee) {
      message.error("Please select an employee.");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient.put(`/page-permissions/${selectedEmployee}/permissions`, {
        permissionIds: selectedPermissions,
      });
      message.success("Permissions updated successfully!");
      setInitialPermissions(selectedPermissions);
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to update permissions."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedPermissions(initialPermissions);
  };

  return (
    <FormLayout
      headerText="Assign Employee Permissions"
      descriptionText="Select an employee to view and modify their application permissions."
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      submitText="Update"
      onReset={handleReset}
      showReset
    >
      <div  className="flex flex-col gap-6" >
        <FormSelect
          name="employee"
          label="Select Employee"
          placeholder="Choose an employee..."
          value={selectedEmployee}
          onValueChange={setSelectedEmployee}
          options={employees}
          required
        />
        {selectedEmployee && (
          <PermissionSelector
            selectedPermissions={selectedPermissions}
            onSelectionChange={setSelectedPermissions}
          />
        )}
      </div>
    </FormLayout>
  );
};

export default AssignPermissionPage;
