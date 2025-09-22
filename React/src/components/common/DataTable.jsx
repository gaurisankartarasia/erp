import React, { useEffect, useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  X
} from "lucide-react";
import { Spinner } from "../ui/spinner";

const DataTableColumnHeader = ({ column, title, className }) => {
  if (!column.getCanSort()) {
    return <div className={className}>{title}</div>;
  }
  return (
    <Button
      variant="ghost"
      onClick={column.getToggleSortingHandler()}
      className="-ml-4 h-8 data-[state=open]:bg-accent"
    >
      <span>{title}</span>
      {column.getIsSorted() === "desc" ? (
        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
      ) : column.getIsSorted() === "asc" ? (
        <ChevronUp className="ml-2 h-4 w-4 opacity-50" />
      ) : (
        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  );
};

const DataTableToolbar = ({ tableState }) => {
  const [searchValue, setSearchValue] = useState(tableState.searchTerm);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchValue !== tableState.searchTerm) {
        tableState.setSearchTerm(searchValue);
        tableState.setCurrentPage(1);
      }
    }, 200);
    return () => clearTimeout(handler);
  }, [searchValue, tableState]);

  useEffect(() => {
    setSearchValue(tableState.searchTerm);
  }, [tableState.searchTerm]);


  return (
    <div className="flex items-center justify-between mb-2 gap-4">
      <div className="flex-shrink-0 flex items-center gap-2 relative">
        <Input
          placeholder="Search..."
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          className="w-lg pr-8" 
        />

        {searchValue && (
          <button
            type="button"
            onClick={() => {
              setSearchValue("");
              tableState.setSearchTerm("");
              tableState.setCurrentPage(1);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export const DataTablePagination = ({ table, totalItems }) => (
  <div className="flex items-center justify-between gap-6 mb-2">
    <div className="flex-1 text-sm font-semibold ">
      {totalItems} total rows
    </div>
    <div className="flex items-center space-x-6 lg:space-x-8">
      <div className="flex items-center space-x-2">
        <p className="text-sm">Rows per page</p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="h-8 w-fit">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem key={pageSize} value={`${pageSize}`}>
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex w-[100px] items-center justify-center text-sm font-medium">
        Page {table.getState().pagination.pageIndex + 1} of{" "}
        {table.getPageCount()}
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
);

const ShadcnDataTable = ({ columns, data, tableState }) => {
  const {
    loading,
    totalItems,
    currentPage,
    setCurrentPage,
    entriesPerPage,
    setEntriesPerPage,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  } = tableState;

  const processedColumns = useMemo(
    () =>
      columns.map((col) => ({
        ...col,

        header: col.enableSorting
          ? ({ column }) => (
              <DataTableColumnHeader column={column} title={col.header} />
            )
          : col.header,
      })),
    [columns]
  );

  const table = useReactTable({
    data,
    columns: processedColumns,
    getCoreRowModel: getCoreRowModel(),
    pageCount: Math.ceil(totalItems / entriesPerPage) || 0,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    state: {
      pagination: { pageIndex: currentPage - 1, pageSize: entriesPerPage },
      sorting: sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : [],
      globalFilter: searchTerm,
    },
    onPaginationChange: (updater) => {
      const newPaginationState =
        typeof updater === "function"
          ? updater({ pageIndex: currentPage - 1, pageSize: entriesPerPage })
          : updater;
      setCurrentPage(newPaginationState.pageIndex + 1);
      setEntriesPerPage(newPaginationState.pageSize);
    },
    onSortingChange: (updater) => {
      const newSortState =
        typeof updater === "function"
          ? updater(sortBy ? [{ id: sortBy, desc: sortOrder === "desc" }] : [])
          : updater;
      if (newSortState && newSortState.length > 0) {
        setSortBy(newSortState[0].id);
        setSortOrder(newSortState[0].desc ? "desc" : "asc");
      } else {
        setSortBy(null);
        setSortOrder("asc");
      }
    },
    onGlobalFilterChange: setSearchTerm,
  });

  return (
    <div className="p-4 bg-white shadow rounded-xl">
     <div className="flex iems-center gap-6 justify-between" >
        <DataTableToolbar tableState={tableState} />   <DataTablePagination table={table} totalItems={totalItems} />
     </div>
    
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={processedColumns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <Spinner/>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={processedColumns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ShadcnDataTable;
