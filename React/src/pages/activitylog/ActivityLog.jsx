import React, { useMemo } from "react";
import ShadcnDataTable from "@/components/common/DataTable";
import PageLayout from "@/components/layouts/PageLayout";
import { useServerSideTable } from "../../hooks/useServerSideTable";

// Badge for action types like READ, WRITE, etc.
const ActionBadge = ({ action }) => {
  const config = {
     CREATE: "bg-green-100 text-green-800",
     UPDATE: "bg-blue-100 text-blue-800",
     DELETE: "bg-red-100 text-red-800",
     READ: "bg-gray-100 text-gray-800",
  };

  const classes = config[action] || "bg-gray-100 text-gray-800";
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${classes}`}>
      {action}
    </span>
  );
};

const ActivityLog = () => {
  const { data: logs, tableState } = useServerSideTable(
    `http://localhost:8000/logs`
  );

  const logColumns = useMemo(
    () => [
      {
        header: "Sl. No",
        cell: ({ row }) =>
          (tableState.currentPage - 1) * tableState.entriesPerPage +
          row.index +
          1,
      },
      {
        header: "Employee Name",
        accessorKey: "employee_name",
        enableSorting: true,
      },
      {
        header: "Action",
        accessorKey: "action",
        enableSorting: true,
        cell: ({ row }) => <ActionBadge action={row.original.action} />,
      },
      {
        header: "Page",
        accessorKey: "page_name",
        enableSorting: true,
      },
      {
        header: "Target",
        accessorKey: "target",
        enableSorting: false,
      },
      {
        header: "IP",
        accessorKey: "ip",
        enableSorting: false,
      },
      {
        header: "Browser",
        accessorKey: "browser",
        enableSorting: false,
      },
      {
        header: "OS",
        accessorKey: "os",
        enableSorting: false,
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        enableSorting: true,
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleString("en-IN"),
      },
    ],
    [tableState.currentPage, tableState.entriesPerPage]
  );

  return (
    <PageLayout title="Activity Logs">
      <ShadcnDataTable
        Ltext="Activity Logs"
        data={logs}
        columns={logColumns}
        tableState={tableState}
      />
    </PageLayout>
  );
};

export default ActivityLog;
