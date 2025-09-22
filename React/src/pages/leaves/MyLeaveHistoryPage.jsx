import React, { useState, useMemo } from 'react';
import { useDebounce } from 'use-debounce';
import { format } from 'date-fns';

import PageLayout from '@/components/layouts/PageLayout';
import ShadcnDataTable from '@/components/common/DataTable';
import { useServerSideTable } from '@/hooks/useServerSideTable';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from "@/components/ui/badge";

const LeaveHistoryPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    const queryParams = useMemo(() => {
        const params = new URLSearchParams();
        if (debouncedSearchTerm) {
            params.append('search', debouncedSearchTerm);
        }
        if (statusFilter && statusFilter !== 'all') {
            params.append('status', statusFilter);
        }
        if (typeFilter && typeFilter !== 'all') {
            params.append('is_unpaid', typeFilter);
        }
        return params.toString();
    }, [debouncedSearchTerm, statusFilter, typeFilter]);

    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/leave/my-requests?${queryParams}`;

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
                accessorKey: "id",
                header: "Req ID",
                enableSorting: true,
            },
            {
                accessorKey: "LeaveType.name",
                header: "Leave Type",
                enableSorting: true,
            },
            {
                accessorKey: "start_date",
                header: "Dates",
                enableSorting: true,
                cell: ({ row }) => {
                    const startDate = format(new Date(row.original.start_date), "dd MMM yyyy");
                    const endDate = format(new Date(row.original.end_date), "dd MMM yyyy");
                    return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
                },
            },
            {
                accessorKey: "reason",
                header: "Reason",
                cell: ({ row }) => (
                    <div className="truncate w-40">{row.original.reason || "N/A"}</div>
                ),
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
                accessorKey: "LeaveType.is_unpaid",
                header: "Type",
                cell: ({ row }) => {
                    const isUnpaid = row.original.LeaveType?.is_unpaid;
                    return <Badge variant="outline">{isUnpaid ? "Unpaid" : "Paid"}</Badge>;
                }
            }
        ];
    }, [tableState.currentPage, tableState.entriesPerPage]);

    const FilterControls = (
        <div className="flex flex-wrap items-center gap-4">
            <Input
                placeholder="Search by ID or Reason..."
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
            <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="false">Paid</SelectItem>
                    <SelectItem value="true">Unpaid</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );

    return (
        <PageLayout
            title="My Leave History"
            description="Search and filter your past and present leave requests."
        >
            <ShadcnDataTable
                Ltext="Leave Requests"
                filterComponent={FilterControls}
                data={data}
                columns={columns}
                tableState={tableState}
            />
        </PageLayout>
    );
};

export default LeaveHistoryPage;