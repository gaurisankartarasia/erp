import React, { useMemo } from "react";
import ShadcnDataTable from "@/components/common/DataTable";
import { useServerSideTable } from "../../hooks/useServerSideTable";
import PageLayout from "@/components/layouts/PageLayout";
import { useConfirmModal } from "@/hooks/useConfirmModal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { X, Edit, Check } from "lucide-react";
import apiClient from "@/api/axiosConfig";

const StatusBadge = ({ active }) => {
  const status = active ? "active" : "inactive";
  const config = {
    active: { text: "Active", classes: "bg-green-100 text-green-800" },
    inactive: { text: "Inactive", classes: "bg-red-100 text-red-800" },
  };


  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${config[status].classes}`}
    >
      {config[status].text}
    </span>
  );
};

const EmployeeListPage = () => {
  const {
    data: employees,
    tableState,
    refreshData,
  } = useServerSideTable(
    `${import.meta.env.VITE_API_BASE_URL}/employee/employees`
  );
    const confirm = useConfirmModal();

  const handleToggleStatus = async (employee) => {
    const ok = await confirm({
      title: "Change Status",
      description: `Are you sure you want to ${
        employee.is_active ? "deactivate" : "activate"
      } this employee?`,
    });

    if (!ok) return;

    try {
      await apiClient.patch(`/employee/${employee.id}/status`);
      refreshData();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const employeeColumns = useMemo(
    () => [
      {
        header: "Sl. No",
        cell: ({ row }) =>
          (tableState.currentPage - 1) * tableState.entriesPerPage +
          row.index +
          1,
      },
      {
        header: "Name",
        accessorKey: "name",
        enableSorting: true,
      },
      {
        header: "Email",
        accessorKey: "email",
        enableSorting: true,
      },
      {
        header: "Phone",
        accessorKey: "phone",
        enableSorting: false,
      },
      {
        header: "Joined At",
        accessorKey: "joined_at",
        enableSorting: true,
        cell: ({ row }) =>
          row.original.joined_at
            ? new Date(row.original.joined_at).toLocaleDateString()
            : "N/A",
      },
      {
        header: "Status",
        accessorKey: "is_active",
        enableSorting: true,
        cell: ({ row }) => <StatusBadge active={row.original.is_active} />,
      },
      {
        header: "Actions",
        cell: ({ row }) => {
          const employee = row.original;
          return (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleToggleStatus(employee)}
              >
                {employee.is_active ? <X  className="text-red-500" /> : <Check className="text-green-500"  />}
              </Button>

              <Button asChild size="sm"  variant="ghost">
                <Link to={`/employees/${employee.id}/edit`}><Edit/></Link>
              </Button>
            </div>
          );
        },
      },
    ],
    [tableState.currentPage, tableState.entriesPerPage]
  );

  return (
    <PageLayout
      title="Employee List"
      rightButton={{ text: "Add Employee", path: "add" }}
    >
      <ShadcnDataTable
        Ltext="Employee List"
        Rtext="Add Employee"
        addPath="add"
        data={employees}
        columns={employeeColumns}
        tableState={tableState}
      />
    </PageLayout>
  );
};

export default EmployeeListPage;
