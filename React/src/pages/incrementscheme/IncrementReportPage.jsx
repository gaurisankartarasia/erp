import React from "react";

import { useServerSideTable } from "@/hooks/useServerSideTable";
import ShadcnDataTable from "@/components/common/DataTable";
import { formatDate } from "@/utils/date-format";
import PageLayout from "@/components/layouts/PageLayout";


const IncrementReportPage = () => {
  const { data: reportData, tableState } = useServerSideTable(
    `${import.meta.env.VITE_API_BASE_URL}/increment-scheme/increment-reports`
  );

  const columns = [
    {
      header: "SL NO",
      cell: ({ row }) =>
        (tableState.currentPage - 1) * tableState.entriesPerPage + row.index + 1,
    },

    {
      header: "Emp ID",
      accessorKey: "id",
       enableSorting: true
    },
    {
      header: "Name",
      accessorKey: "name",
      enableSorting: true,
    },

        {
      header: "Eligible",
      accessorKey: "is_eligible",
      enableSorting: true,
      cell: ({ row }) => row.original.is_eligible ? "Yes" : "No" ,
    },
    {
      header: "Service Days",
      accessorKey: "days_of_service",
      enableSorting: true,
    },
       {
      header: "Rating",
      accessorKey: "average_rating",
      enableSorting: true,
      cell : ({row}) => row.original.average_rating ? row.original.average_rating : "N/A"
    },
      {
      header: "Current Salary",
      accessorKey: "current_salary",
      enableSorting: true,
          cell: ({row}) => row.original.current_salary === "0.00" ? "N/A" : row.original.current_salary
    },
      {
      header: "New Salary",
      accessorKey: "new_salary",
      enableSorting: true,
      cell: ({row}) => row.original.new_salary === "0.00" ? "N/A" : row.original.new_salary
    },
   
    {
      header: "Joined",
      accessorKey: "joined_at",
      enableSorting: true,
      cell: ({ row }) => formatDate(row.original.joined_at),
    },

  ];

  return (
    <PageLayout
    title={"Increment Reports"}
    >
     
          <ShadcnDataTable
            Ltext=""
            data={reportData}
            columns={columns}
            tableState={tableState}
          />
       
    </PageLayout>
  );
};

export default IncrementReportPage;