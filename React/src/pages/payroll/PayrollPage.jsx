// src/pages/payroll/PayrollPage.js
// (Corrected to use the hook for state management with client-side data processing)

import React, { useState, useMemo, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';

// Import Custom Hooks
import { useServerSideTable } from "@/hooks/useServerSideTable";

// Component Imports
import ShadcnDataTable from "../../components/common/DataTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { ArrowRight, ReceiptText } from 'lucide-react';
import SalarySlipDetailsDialog from "@/pages/payroll/montly_salary/SalarySlipDetailsDialog";
import { PayrollGeneratorForm } from '@/pages/payroll/montly_salary/PayrollGeneratorForm';
import { PayrollPreview } from '@/pages/payroll/montly_salary/PayrollPreview';

// --- API Helper Functions ---
const getRecentReports = async () => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/payroll/recent`, { withCredentials: true });
  return data;
};
const getPayrollPreview = async (previewPayload) => {
  try {
    const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/payroll/preview`, previewPayload, { withCredentials: true });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch payroll preview');
  }
};
const initiatePayrollGeneration = async (reportData) => {
  const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/payroll/initiate`, reportData, { withCredentials: true });
  return data;
};
const getReportStatus = async (reportId) => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/payroll/status/${reportId}`, { withCredentials: true });
  return data;
};
const getPayrollReport = async (reportId) => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/payroll/report/${reportId}`, { withCredentials: true });
  return data;
};


// --- PAYROLL PAGE COMPONENT ---
const PayrollPage = () => {
    // --- State for overall page flow ---
    const [previewData, setPreviewData] = useState(null);
    const [payPeriod, setPayPeriod] = useState(null);
    const [recentReports, setRecentReports] = useState([]);
    const [activeReport, setActiveReport] = useState(null);
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [selectedSlip, setSelectedSlip] = useState(null);
    const [isReportLoading, setIsReportLoading] = useState(false);

    // --- State to hold the full, unprocessed data from the API ---
    const [allSalarySlips, setAllSalarySlips] = useState([]);

    // --- FIX #1: USE THE HOOK AS A STATE CONTAINER ---
    // We pass `null` as the URL because we will fetch data manually.
    const { tableState } = useServerSideTable(null);

    // Destructure state and setters from the hook's tableState for easier use
    const {
        currentPage, setCurrentPage, entriesPerPage, setEntriesPerPage,
        searchTerm, sortBy, sortOrder
    } = tableState;

    // --- DATA FETCHING & EVENT HANDLERS ---
    const fetchRecent = async () => {
        try {
            const reports = await getRecentReports();
            setRecentReports(reports);
        } catch (error) {
            toast.error("Failed to load recent reports.", { description: error.message });
        }
    };

    useEffect(() => { fetchRecent(); }, []);
    
    // Polling logic is fine.
    useEffect(() => {
        if (!isPolling || !activeReport?.id) return;
        const intervalId = setInterval(async () => {
             // ... polling logic ...
        }, 5000);
        return () => clearInterval(intervalId);
    }, [isPolling, activeReport]);


    const handlePreview = async (formData) => {
        setIsPreviewLoading(true);
        try {
            const result = await getPayrollPreview(formData);
            setPreviewData(result);
            setPayPeriod(formData);
            setActiveReport(null);
        } catch(e) { toast.error(e.message) } 
        finally { setIsPreviewLoading(false) }
    };
    
    const handleConfirmGeneration = async () => {
        if (!payPeriod) return;
        setIsGenerating(true);
        setPreviewData(null);
        try {
            const result = await initiatePayrollGeneration(payPeriod);
            toast.info("Payroll generation started.");
            setActiveReport({ id: result.reportId, status: 'processing', ...payPeriod });
            setIsPolling(true);
        } catch (error) {
            toast.error("Failed to initiate generation.", { description: error.message });
        } finally {
            setIsGenerating(false);
        }
    };
    
    // --- FIX #2: FETCH DATA MANUALLY WHEN A REPORT IS VIEWED ---
    const handleViewReport = async (report) => {
        setPreviewData(null);
        setIsReportLoading(true);
        setActiveReport(report);
        setAllSalarySlips([]); // Clear previous data
        
        try {
            const reportData = await getPayrollReport(report.id);
            // We get ALL salary slips and store them locally.
            setAllSalarySlips(reportData.SalarySlips || []);
        } catch (error) {
            toast.error("Failed to load report data.", { description: error.message });
            setActiveReport(null);
        } finally {
            setIsReportLoading(false);
        }
    };

    // --- FIX #3: PROCESS DATA ON THE CLIENT-SIDE using useMemo ---
    // This block will filter, sort, and then paginate the data.
    const { paginatedSlips, totalItems } = useMemo(() => {
        let filtered = [...allSalarySlips];

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filtered = filtered.filter(slip =>
                slip.employee_name.toLowerCase().includes(lowercasedFilter) ||
                String(slip.employee_id).includes(lowercasedFilter)
            );
        }

        if (sortBy) {
            filtered.sort((a, b) => {
                const valA = a[sortBy];
                const valB = b[sortBy];
                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }
        
        const startIndex = (currentPage - 1) * entriesPerPage;
        return {
            paginatedSlips: filtered.slice(startIndex, startIndex + entriesPerPage),
            totalItems: filtered.length
        };
    }, [allSalarySlips, searchTerm, sortBy, sortOrder, currentPage, entriesPerPage]);


    const reportTableColumns = useMemo(() => [
        { 
            id: 'sl_no', header: "SL NO", 
            cell: ({ row }) => <span>{(currentPage - 1) * entriesPerPage + row.index + 1}</span> 
        },
        { accessorKey: "employee_id", header: "EID", enableSorting: true },
        { accessorKey: "employee_name", header: "Name", enableSorting: true },
        { accessorKey: "net_salary", header: "Net Salary", cell: ({row}) => `₹${Number(row.original.net_salary).toFixed(2)}`, enableSorting: true },
        { 
            id: 'actions', header: "Slip", 
            cell: ({ row }) => (
                <Button variant="ghost" size="icon" onClick={() => setSelectedSlip({ ...row.original, ...activeReport })}>
                    <ReceiptText/>
                </Button>
            )
        }
    ], [currentPage, entriesPerPage, activeReport]);

    const getStatusBadge = (status) => {
        const variants = { completed: 'success', processing: 'secondary', failed: 'destructive' };
        return <Badge variant={variants[status] || 'default'}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
    };

    // --- FIX #4: RECONSTRUCT THE tableState object for the DataTable ---
    // We combine our local loading state with the state managed by the hook.
    const finalTableState = {
        ...tableState,
        loading: isReportLoading,
        totalItems: totalItems,
    };

    return (
      <div>
        <>
          <PayrollGeneratorForm 
            onPreview={handlePreview}
            isLoading={isPreviewLoading} 
            isPolling={isPolling} 
          />

        {previewData && (
  <PayrollPreview
    previewData={previewData}       // the data for table rows
    payPeriod={payPeriod}           // the selected month/year
    onConfirm={handleConfirmGeneration} // confirm & generate payroll
    onCancel={() => setPreviewData(null)} // cancel/close preview
    isLoading={isGenerating}        // loading state for confirm button
  />
)}


          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mt-4">
            <Card className="xl:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Reports</CardTitle>
                <Button size="sm" variant="secondary" onClick={fetchRecent}>Refresh</Button>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {recentReports.length > 0 ? (
                    recentReports.map(report => (
                      <li key={report.id} className="flex justify-between items-center p-2">
                        <span>{report.month}/{report.year}</span>
                        {getStatusBadge(report.status)}
                        <Button 
                          variant="outline" size="icon" 
                          onClick={() => handleViewReport(report)}
                          disabled={report.status !== 'completed'}>
                          <ArrowRight />
                        </Button>
                      </li>
                    ))
                  ) : ( <li className="p-2 text-gray-500">No reports available</li> )}
                </ul>
              </CardContent>
            </Card>
            
            <div className="xl:col-span-3">
              {activeReport && activeReport.status === 'completed' && !isReportLoading && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payroll Report for {activeReport.month}/{activeReport.year}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ShadcnDataTable
                      columns={reportTableColumns}
                      data={paginatedSlips}
                      tableState={finalTableState}
                    />
                  </CardContent>
                </Card>
              )}
              {(isPolling || isReportLoading) && (
                <div className="h-full flex flex-col items-center justify-center p-8 border rounded-lg">
                  <Spinner />
                  <p className="font-semibold mt-2">{isReportLoading ? 'Loading Report...' : 'Processing...'}</p>
                </div>
              )}
               {!activeReport && !previewData && !isPreviewLoading && (
                 <div className="h-full flex flex-col items-center justify-center p-8 border rounded-lg bg-gray-50">
                   <p className="font-semibold mt-2">No Report Selected</p>
                 </div>
               )}
            </div>
          </div>

          <SalarySlipDetailsDialog
            slip={selectedSlip}
            open={!!selectedSlip}
            onOpenChange={(isOpen) => !isOpen && setSelectedSlip(null)}
          />
        </>
      </div>
    );
};

export default PayrollPage;