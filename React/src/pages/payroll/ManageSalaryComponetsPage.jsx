import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ShadcnDataTable from "../../components/common/DataTable";
import axios from "axios";
import { useServerSideTable } from "@/hooks/useServerSideTable";
import ConfirmModal from "@/components/common/modals/ConfirmationModal";
import PageLayout from "@/components/layouts/PageLayout"; 

const ManageSalaryComponentsPage = () => {
  const navigate = useNavigate();
  const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/salary/components`;

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState(null);

  const { data: tableData, refreshData, tableState } =
    useServerSideTable(apiUrl);

  const handleDeleteClick = (id) => {
    setSelectedComponentId(id);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedComponentId) return;

    try {
      await axios.delete(`${apiUrl}/${selectedComponentId}`);
      toast.success("Component deleted successfully");
      refreshData();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to delete component."
      );
      console.error(error);
    } finally {
      setIsModalOpen(false);
      setSelectedComponentId(null);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "sl_no",
        header: "SL NO",
        cell: ({ row }) =>
          (tableState.currentPage - 1) * tableState.entriesPerPage +
          row.index +
          1,
      },
      { accessorKey: "id", header: "ID", enableSorting: true },
      { accessorKey: "name", header: "Name", enableSorting: true },
      { accessorKey: "type", header: "Type" },
      {
        accessorKey: "is_days_based",
        header: "Days Based",
        cell: ({ row }) => (row.original.is_days_based ? "Yes" : "No"),
      },
      {
        accessorKey: "is_base_component",
        header: "Is Base",
        cell: ({ row }) => (row.original.is_base_component ? "Yes" : "No"),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate(`/salary-components/${row.original.id}/edit`)
              }
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteClick(row.original.id)}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [navigate, tableState.currentPage, tableState.entriesPerPage]
  );

  return (
    <PageLayout
      title="Salary Components"
      rightButton={{ text: "Add New Component", path: "/salary-components/create" }}
    >
      <div className="p-6">
        <ShadcnDataTable
          columns={columns}
          data={tableData}
          tableState={tableState}
        />

        <ConfirmModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirm Deletion"
          description="Are you sure you want to delete this salary component?"
        />
      </div>
    </PageLayout>
  );
};

export default ManageSalaryComponentsPage;
