import React, { useMemo } from "react";
import PageLayout from "@/components/layouts/PageLayout";
import ShadcnDataTable from "@/components/common/DataTable";
import { useServerSideTable } from "@/hooks/useServerSideTable";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StatusBadge = ({ status }) => {
  const statusClasses = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    paused: "bg-gray-100 text-gray-800",
    completed: "bg-green-100 text-green-800",
  };
  const text = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusClasses[status] || 'bg-gray-200'}`}>{text}</span>;
};

const AllEmployeesTasksPage = () => {
  const { data: tasks, tableState } = useServerSideTable(
    `${import.meta.env.VITE_API_BASE_URL}/tasks/all-employees`
  );
  const navigate = useNavigate();

  const taskColumns = useMemo(
    () => [
      {
        header: "Sl. No",
        cell: ({ row }) => (tableState.currentPage - 1) * tableState.entriesPerPage + row.index + 1,
      },
      { header: "Employee", accessorKey: "Employee.name", enableSorting: true },
      { header: "Task Title", accessorKey: "title", enableSorting: true },
      {
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      { header: "Est. (Mins)", accessorKey: "assigned_duration_minutes" },
      {
        header: "Start Time",
        accessorKey: "actual_start_time",
        cell: ({ row }) => row.original.actual_start_time ? new Date(row.original.actual_start_time).toLocaleString() : "N/A",
      },
      {
        header: "End Time",
        accessorKey: "actual_end_time",
        cell: ({ row }) => row.original.actual_end_time ? new Date(row.original.actual_end_time).toLocaleString() : "N/A",
      },
      {
        header: "Actions",
        cell: ({ row }) => (
            <Button variant="ghost" size="icon" onClick={() => navigate(`/tasks/edit/${row.original.id}`)} disabled={row.original.status !== 'pending'}>
              <Edit className="h-4 w-4" />
            </Button>
        ),
      },
    ],
    [tableState.currentPage, tableState.entriesPerPage, navigate]
  );

  return (
    <PageLayout title="All Employee Tasks">
      <ShadcnDataTable
        Ltext={"All Tasks"}
        data={tasks}
        columns={taskColumns}
        tableState={tableState}
      />
    </PageLayout>
  );
};

export default AllEmployeesTasksPage;