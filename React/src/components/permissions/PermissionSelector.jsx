import React, { useState, useEffect } from "react";
import apiClient from "@/api/axiosConfig";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const PermissionSelector = ({ selectedPermissions, onSelectionChange }) => {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await apiClient.get("/page-permissions/permissions");
        const grouped = response.data.reduce((acc, permission) => {
          const page = permission.page_name || "General";
          if (!acc[page]) {
            acc[page] = [];
          }
          acc[page].push(permission);
          return acc;
        }, {});
        setPermissions(grouped);
      } catch (err) {
        setError("Failed to load permissions.");
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, []);

  const handleCheckboxChange = (permissionId) => {
    const newSelection = new Set(selectedPermissions);
    if (newSelection.has(permissionId)) {
      newSelection.delete(permissionId);
    } else {
      newSelection.add(permissionId);
    }
    onSelectionChange(Array.from(newSelection));
  };

  if (loading) return <div className="flex justify-center p-4"><Spinner /></div>;
  if (error) return <Alert variant="destructive"><Terminal className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>;

  return (
    <div className="space-y-6">
      {Object.entries(permissions).map(([pageName, perms]) => (
        <div key={pageName} >
          {/* <h4 className="mb-4 text-lg font-medium capitalize">{pageName.replace(/_/g, ' ')}</h4> */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {perms.map((permission) => (
              <div key={permission.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`perm-${permission.id}`}
                  checked={selectedPermissions.includes(permission.id)}
                  onCheckedChange={() => handleCheckboxChange(permission.id)}
                />
                <Label htmlFor={`perm-${permission.id}`} className="font-normal cursor-pointer">
                  {permission.page_name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PermissionSelector;