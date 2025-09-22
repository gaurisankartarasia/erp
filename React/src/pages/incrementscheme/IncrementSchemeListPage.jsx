import React, { useMemo } from "react";
import ShadcnDataTable from "@/components/common/DataTable";
import { useServerSideTable } from "../../hooks/useServerSideTable";
import PageLayout from "@/components/layouts/PageLayout";

const IncrementSchemeListPage = () => {
  const { data: incrementSchemes, tableState } = useServerSideTable(
    `${import.meta.env.VITE_API_BASE_URL}/increment-scheme/incrementschemes`
  );

  const columns = useMemo(
    () => [
      {
        header: "Sl. No",
        cell: ({ row }) =>
          (tableState.currentPage - 1) * tableState.entriesPerPage + row.index + 1,
      },
      {
        header: "Rating",
        accessorKey: "rating",
      },
      {
        header: "Level",
        accessorKey: "level",
      },
      {
        header: "Percentage (%)",
        accessorKey: "percentage",
        cell: ({ row }) => `${row.original.percentage}%`,
      },
      {
        header: "Created At",
        accessorKey: "createdAt",
        cell: ({ row }) =>
          row.original.createdAt
            ? new Date(row.original.createdAt).toLocaleDateString()
            : "N/A",
      },
    ],
    [tableState.currentPage, tableState.entriesPerPage]
  );

  return (
    <PageLayout
      title="Increment Schemes"
      rightButton={{ text: "Add Scheme", path: "add" }} // Optional
    >
      <ShadcnDataTable
        Ltext={"Increment Schemes List"}
        Rtext={"Add Scheme"}
        addPath="add" // Optional: if you have a page to add new schemes
        data={incrementSchemes}
        columns={columns}
        tableState={tableState}
      />
    </PageLayout>
  );
};

export default IncrementSchemeListPage;
