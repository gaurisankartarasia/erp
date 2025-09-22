// import React, { useState, useEffect, useCallback } from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { toast } from "sonner";
// import { RefreshCw } from "lucide-react";

// import { getManagedLeaveRequests } from "@/services/leave-service";

// import LeaveRequestTable from "@/components/leave/LeaveRequestTable";

// import UpdateRequestDialog from "@/components/leave/UpdateRequestDialog";

// const LeaveManagementAdminPage = () => {
//   const [requests, setRequests] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [selectedRequest, setSelectedRequest] = useState(null);

//   const fetchData = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       const reqData = await getManagedLeaveRequests();
//       setRequests(reqData);
//     } catch (error) {
//       toast.error("Error fetching data", error);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const handleActionClick = (request) => {
//     setSelectedRequest(request);
//   };

//   const handleDialogClose = () => {
//     setSelectedRequest(null);
//   };

//   const renderActionSlot = (request) => (
//     <Button
//       variant="outline"
//       size="sm"
//       onClick={() => handleActionClick(request)}
//       disabled={request.status !== "pending"}
//     >
//       Manage
//     </Button>
//   );

//   return (
//     <>
//       <Card className="m-4">
//         <CardHeader>
//           <CardTitle>Leave Management</CardTitle>
//           <CardDescription>
//             View and manage all employee leave requests.
//           </CardDescription>
//         </CardHeader>

//         <CardContent>
//           <Button onClick={fetchData} className="m-3 float-end">
//             <RefreshCw /> Refresh
//           </Button>
//           {isLoading ? (
//             <p className="text-center">Loading requests...</p>
//           ) : (
//             <LeaveRequestTable
//               requests={requests}
//               showEmployeeColumn={true}
//               actionSlot={renderActionSlot}
//             />
//           )}
//         </CardContent>
//       </Card>

//       {selectedRequest && (
//         <UpdateRequestDialog
//           request={selectedRequest}
//           open={!!selectedRequest}
//           onOpenChange={handleDialogClose}
//           onUpdateSuccess={fetchData}
//         />
//       )}
//     </>
//   );
// };

// export default LeaveManagementAdminPage;



import React, { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { format, differenceInCalendarDays } from 'date-fns';

import PageLayout from '@/components/layouts/PageLayout';
import ShadcnDataTable from '@/components/common/DataTable';
import { useServerSideTable } from '@/hooks/useServerSideTable';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import UpdateRequestDialog from "@/components/leave/UpdateRequestDialog";

const LeaveManagementAdminPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedRequest, setSelectedRequest] = useState(null);

    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        if (debouncedSearchTerm) {
            params.append('search', debouncedSearchTerm);
        }
        if (statusFilter && statusFilter !== 'all') {
            params.append('status', statusFilter);
        }
        return params.toString();
    }, [debouncedSearchTerm, statusFilter]);

    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/leave/manage?${queryParams}`;

    const { data, tableState } = useServerSideTable(apiUrl);

    const columns = useMemo(() => {
        const getStatusVariant = (status) => {
            switch (status) {
                case 'approved': return 'success';
                case 'rejected': return 'destructive';
                default: return 'secondary';
            }
        };

        return [
            {
                header: "Sl. No",
                cell: ({ row }) => 
                    (tableState.currentPage - 1) * tableState.entriesPerPage + row.index + 1,
            },
            {
                accessorKey: "Employee.name",
                header: "Employee",
                enableSorting: true,
            },
            {
                accessorKey: "LeaveType.name",
                header: "Leave Type",
            },
            {
                accessorKey: "start_date",
                header: "Dates",
                enableSorting: true,
                cell: ({ row }) => {
                    const startDate = format(new Date(row.original.start_date), "dd MMM yyyy");
                    const endDate = format(new Date(row.original.end_date), "dd MMM yyyy");
                    return `${startDate} - ${endDate}`;
                },
            },
            {
                header: "Days",
                cell: ({ row }) => 
                    differenceInCalendarDays(new Date(row.original.end_date), new Date(row.original.start_date)) + 1,
            },
            {
                accessorKey: "status",
                header: "Status",
                enableSorting: true,
                cell: ({ row }) => {
                    const status = row.getValue("status");
                    return <Badge variant={getStatusVariant(status)} className="capitalize">{status}</Badge>;
                },
            },
            {
                accessorKey: "reason",
                header: "Reason",
                cell: ({ row }) => <div className="truncate w-40">{row.original.reason || "N/A"}</div>,
            },
            {
                header: "Actions",
                cell: ({ row }) => (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedRequest(row.original)}
                        disabled={row.original.status !== "pending"}
                    >
                        Manage
                    </Button>
                ),
            },
        ];
    }, [tableState.currentPage, tableState.entriesPerPage]);

    const FilterControls = (
        <div className="flex flex-wrap items-center gap-4">
            <Input
                placeholder="Search by Employee, ID, or Reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <>
            <PageLayout
                title="Leave Management"
                description="View and manage all employee leave requests."
            >
                <ShadcnDataTable
                    Ltext="All Leave Requests"
                    filterComponent={FilterControls}
                    data={data}
                    columns={columns}
                    tableState={tableState}
                />
            </PageLayout>

            {selectedRequest && (
                <UpdateRequestDialog
                    request={selectedRequest}
                    open={!!selectedRequest}
                    onOpenChange={() => setSelectedRequest(null)}
                    onUpdateSuccess={() => {
                        setSelectedRequest(null);
                        tableState.refetch(); // Refetch data on successful update
                    }}
                />
            )}
        </>
    );
};

export default LeaveManagementAdminPage;