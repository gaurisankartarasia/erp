

import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ShadcnDataTable from "@/components/common/DataTable";
import PageLayout from "@/components/layouts/PageLayout" // Import PageLayout
import axios from "axios";
import { useServerSideTable } from "@/hooks/useServerSideTable";
import ConfirmModal from "@/components/common/modals/ConfirmationModal";
import MessageModal from "@/components/common/modals/MessageModal";

const RulesPage = () => {
  const navigate = useNavigate();
  const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/rules/leave-types`;

  // Modal State
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageModalContent, setMessageModalContent] = useState({
    message: "",
    variant: "info"
  });
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState(null);

  const { data: tableData, refreshData, tableState } = useServerSideTable(apiUrl);

  // Delete Flow
  const handleDeleteClick = (id) => {
    setSelectedLeaveTypeId(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedLeaveTypeId) return;
    try {
      await axios.delete(`${apiUrl}/${selectedLeaveTypeId}`);
      
      // Show success message in MessageModal
      setMessageModalContent({
        message: "Leave type deleted successfully",
        variant: "success"
      });
      setIsMessageModalOpen(true);
      
      refreshData();
    } catch (error) {
      console.error("Error deleting leave type:", error);
      
      // Show error message in MessageModal
      setMessageModalContent({
        message: error.response?.data?.message || "Failed to delete leave type.",
        variant: "danger"
      });
      setIsMessageModalOpen(true);
    } finally {
      setIsConfirmModalOpen(false);
      setSelectedLeaveTypeId(null);
    }
  };

  // Table Columns
  const columns = useMemo(() => [
    {
      id: "sl_no",
      header: "SL NO",
      cell: ({ row }) =>
        (tableState.currentPage - 1) * tableState.entriesPerPage + row.index + 1,
    },
    { accessorKey: "name", header: "Rule Name", enableSorting:true },
    { accessorKey: "monthly_allowance_days", header: "Monthly Allowance (days)",enableSorting:true },
    { accessorKey: "max_days_per_request", header: "Max Days Per Request (days)",enableSorting:true },
    {
      accessorKey: "is_unpaid",
      header: "Is Unpaid?",
      enableSorting:true,
      cell: ({ row }) => (row.original.is_unpaid ? "Yes" : "No"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/leave-types/edit/${row.original.id}`)}
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
  ], [navigate, tableState.currentPage, tableState.entriesPerPage]);

  return (
    <PageLayout
      title="Leave Types"
      rightButton={{
        text: "Add New Leave Type",
        path: "add"
      }}
    >
      <div className="p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Leave Types</h1>
          <p className="text-muted-foreground">
            Manage company leave types and policies.
          </p>
        </header>

        <ShadcnDataTable
          Ltext="Leave Types"
          Rtext="Add New Leave Type"
          addPath="/leave-types"
          columns={columns}
          data={tableData}
          tableState={tableState}
        />

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Confirm Deletion"
          description="Are you sure you want to delete this leave type?"
        />

        {/* Message Modal for displaying success/error messages */}
        <MessageModal
          isOpen={isMessageModalOpen}
          onClose={() => setIsMessageModalOpen(false)}
          message={messageModalContent.message}
          variant={messageModalContent.variant}
        />
      </div>
    </PageLayout>
  );
};

export default RulesPage;