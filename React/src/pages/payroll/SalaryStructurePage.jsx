import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import PageLayout from "@/components/layouts/PageLayout"; // Assuming you have this layout component
import SalaryStructureForm from "./SalaryStructureForm"; 
import axios from 'axios';

const SalaryStructurePage = () => {
    const [employees, setEmployees] = useState([]);
    const [salaryComponents, setSalaryComponents] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            setIsLoading(true);
            try {
                const [empResponse, compResponse] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/salary/list-employees`),
                    // Fetching up to 100 components to ensure all are available in the form
                    axios.get(`${import.meta.env.VITE_API_BASE_URL}/salary/components?limit=100`) 
                ]);

                setEmployees(empResponse.data); 
                setSalaryComponents(compResponse.data.data);

            } catch (error) {
                console.error("Failed to load initial data:", error);
                toast.error("Failed to load required data. Please try again.", { 
                  description: error.response?.data?.message || error.message 
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchInitialData();
    }, []);

    if (isLoading) {
        return <div className="flex items-center justify-center h-96"><Spinner /></div>;
    }

    return (
        <PageLayout title="Employee Salary Structure">
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Select Employee</CardTitle>
                        <CardDescription>
                            Choose an employee to view or define their salary structure.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="max-w-sm">
                            <Label htmlFor="employee-select">Employee</Label>
                            {/* --- THE FIX IS HERE --- */}
                            <Select onValueChange={setSelectedEmployeeId}>
                                <SelectTrigger id="employee-select">
                                    <SelectValue placeholder="Select an employee..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(emp => (
                                        <SelectItem key={emp.id} value={String(emp.id)}>
                                            {emp.name} (ID: {emp.id})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* This will now work correctly because selectedEmployeeId will be updated */}
                {selectedEmployeeId && (
                    <SalaryStructureForm
                        key={selectedEmployeeId}
                        employeeId={selectedEmployeeId}
                        masterComponents={salaryComponents}
                    />
                )}
            </div>
        </PageLayout>
    );
};

export default SalaryStructurePage;