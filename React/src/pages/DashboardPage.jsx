
// src/pages/dashboard/DashboardPage.js
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import PageLayout from "@/components/layouts/PageLayout";

// Component Imports
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Users, ListChecks, Activity, Star, User } from "lucide-react";
import PerformanceChart from "@/components/dashboard/PerformanceChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [weeklyChartData, setWeeklyChartData] = useState([]);
  const [monthlyChartData, setMonthlyChartData] = useState([]);
  const [weeklyEmployees, setWeeklyEmployees] = useState([]);
  const [monthlyEmployees, setMonthlyEmployees] = useState([]);
  const [performanceView, setPerformanceView] = useState("all");
  const [loading, setLoading] = useState({ summary: true, charts: true });
  
  const canViewAllPerformance = true; // Hardcoded as per previous request

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_BASE_URL}/dashboard/summary`, { withCredentials: true })
      .then((res) => setSummary(res.data))
      .catch((error) => {
        console.error("Failed to load summary data.", error);
        toast.error("Failed to load summary data.", { description: error.message });
      })
      .finally(() => setLoading((prev) => ({ ...prev, summary: false })));
  }, []);

  const fetchChartData = useCallback(async () => {
    setLoading((prev) => ({ ...prev, charts: true }));
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/dashboard/charts`, {
        params: { view: performanceView },
        withCredentials: true,
      });
      setWeeklyChartData(res.data.weeklyData);
      setWeeklyEmployees(res.data.weeklyEmployees);
      setMonthlyChartData(res.data.monthlyData);
      setMonthlyEmployees(res.data.monthlyEmployees);
    } catch (error)      {
      console.error("Failed to load chart data.", error);
      toast.error("Failed to load chart data.", { description: error.message });
    } finally {
      setLoading((prev) => ({ ...prev, charts: false }));
    }
  }, [performanceView]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  return (
 
    <PageLayout>
      <div className="space-y-6">


        
        <div className="flex justify-end">
          {canViewAllPerformance && (
            <div className="flex items-center space-x-2">
              <label htmlFor="view-mode" className="text-sm font-medium">Performance View</label>
              <Select value={performanceView} onValueChange={setPerformanceView}>
                <SelectTrigger id="view-mode" className="w-[180px]">
                  <SelectValue placeholder="Select view" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="self">
                    <div className="flex items-center gap-2"><User className="h-4 w-4" /> Personal</div>
                  </SelectItem>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2"><Users className="h-4 w-4" /> All Employees</div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* KPI Cards Section */}
        {loading.summary ? (
          <div className="h-24 flex items-center justify-center"><Spinner /></div>
        ) : summary && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <DashboardCard title={summary.kpi1.title} value={summary.kpi1.value} icon={Users} link="/employees" />
            <DashboardCard title={summary.kpi2.title} value={summary.kpi2.value} icon={ListChecks} link="/tasks/all-employees" />
            <DashboardCard title={summary.kpi3.title} value={summary.kpi3.value} icon={Activity} />
            <DashboardCard title={summary.kpi4.title} value={summary.kpi4.value} icon={Star} />
          </div>
        )}

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Last 7 days performance</CardTitle>
              <CardDescription>{performanceView === 'all' ? 'Team performance overview' : 'Your daily average rating.'}</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {loading.charts ? <div className="h-[350px] flex items-center justify-center"><Spinner /></div> : <PerformanceChart data={weeklyChartData} employees={weeklyEmployees} viewType={performanceView} />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Last 12 Months Performance</CardTitle>
              <CardDescription>{performanceView === 'all' ? 'Team performance overview' : 'Your monthly average rating.'}</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              {loading.charts ? <div className="h-[350px] flex items-center justify-center"><Spinner /></div> : <PerformanceChart data={monthlyChartData} employees={monthlyEmployees} viewType={performanceView} />}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardPage;

