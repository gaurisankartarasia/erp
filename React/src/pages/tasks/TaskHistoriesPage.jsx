import React, { useMemo } from "react";
import PageLayout from "@/components/layouts/PageLayout";
import ShadcnDataTable from "@/components/common/DataTable";
import { useServerSideTable } from "@/hooks/useServerSideTable";
import { formatDate } from "@/utils/date-format";
import { Star } from "lucide-react";

const TaskHistoriesPage = () => {
  const { data: tasks, tableState } = useServerSideTable(
    `${import.meta.env.VITE_API_BASE_URL}/tasks/histories`
  );

  const formatDuration = (seconds) => {
    if (seconds === null || seconds === undefined) return "N/A";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const getRatingDisplay = (rating) => {
    if (!rating || rating === 0) return <span className="text-muted-foreground">Not Rated</span>;
    return <div className="flex items-center gap-1"><span className="font-medium">{rating}</span><Star className="h-4 w-4 text-amber-500 fill-amber-500" /></div>;
  };

  const historyColumns = useMemo(
    () => [
      {
        header: "Sl. No",
        cell: ({ row }) => (tableState.currentPage - 1) * tableState.entriesPerPage + row.index + 1,
      },
      { header: "Task Title", accessorKey: "title", enableSorting: true },
      {
        header: "Time Taken",
        accessorKey: "accumulated_duration_seconds",
        cell: ({ row }) => formatDuration(row.original.accumulated_duration_seconds),
      },
      {
        header: "Rating",
        accessorKey: "completion_rating",
        cell: ({ row }) => getRatingDisplay(row.original.completion_rating),
      },
      {
        header: "Completed On",
        accessorKey: "actual_end_time",
        cell: ({ row }) => formatDate(row.original.actual_end_time),
        enableSorting: true,
      },
    ],
    [tableState.currentPage, tableState.entriesPerPage]
  );

  return (
    <PageLayout title="My Task History">
      <ShadcnDataTable
        Ltext={"Completed Tasks"}
        data={tasks}
        columns={historyColumns}
        tableState={tableState}
      />
    </PageLayout>
  );
};

export default TaskHistoriesPage;