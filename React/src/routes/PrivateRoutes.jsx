import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { Layout } from "@/layouts/Layout";
import LogOutPage from "@/pages/auth/LogOutPage";

import DashboardPage from "../pages/DashboardPage";
import PageNotFound from "@/pages/not-found";
import TasksPage from "@/pages/tasks/TasksPage";
import TaskListPage from "@/pages/tasks/TaskHistoriesPage";
import AllEmployeesTasksPage from "@/pages/tasks/AllEmployeesTaskPage";
import TaskFormPage from "@/pages/tasks/TaskFormPage";
import AssignPagePermission from "@/pages/permissions/AssignPermissionPage";
import ManageSalaryComponentsPage from "@/pages/payroll/ManageSalaryComponetsPage";
import SalaryComponentFormPage from "@/pages/payroll/SalaryComponetFormPage";
import SalaryStructurePage from "@/pages/payroll/SalaryStructurePage";
import EmployeeFormPage from "@/pages/employee/EmployeeFormPage";
import EmployeeListPage from "@/pages/employee/EmployeeListPage";

import RulesPage from "@/pages/LeaveTypesPage"; 
import LeaveTypesManager from "@/pages/LeaveTypesManager";
import IncrementSchemeList from "@/pages/incrementscheme/IncrementSchemeListPage";
import IncrementSchemeForm from "@/pages/incrementscheme/IncrementSchemeFormPage";
import AccountPage from "@/pages/employee/AccountPage";
import RequestLeavePage from "@/pages/leaves/RequestLeavePage";
import LeaveHistoryPage from "@/pages/leaves/MyLeaveHistoryPage";
import LeaveManagementAdminPage from "@/pages/leaves/LeaveManagementPage";
import PayrollPage from "@/pages/payroll/PayrollPage";
import ActivityLog from "@/pages/activitylog/ActivityLog";
import IncrementReportPage from "@/pages/incrementscheme/IncrementReportPage";

const ProtectedPage = ({ children, permission }) => (
  <ProtectedRoute permission={permission}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
);

const PrivateRoutes = () => {
  const routes = [
    {
      path: "/",
      element: DashboardPage,
    },
    {
      path: "/logout",
      element: LogOutPage,
    },
    {
      path: "*",
      element: PageNotFound,
    },
    {
      path: "/tasks/history",
      element: TaskListPage,
    },
    {
      path: "/tasks",
      element: TasksPage,
    },
    {
      path: "/tasks/all-employees",
      element: AllEmployeesTasksPage,
    },
    {
      path: "/tasks/add",
      element: TaskFormPage,
    },
    {
      path: "/tasks/edit/:id",
      element: TaskFormPage,
    },
    {
      path: "/page-permissions",
      element: AssignPagePermission,
      permission: "PP",
    },

    {
      path: "/salary-components",
      element: ManageSalaryComponentsPage,
    },
    {
      path: "/salary-components/create",
      element: SalaryComponentFormPage,
    },
    {
      path: "/salary-components/:id/edit",
      element: SalaryComponentFormPage,
    },
    {
      path: "/salary-stucture",
      element: SalaryStructurePage,
    },
    {
      
  path:"/salary-payroll",
  element:PayrollPage,

    },
    {
      path: "/emp-list/add",
      element: EmployeeFormPage,
    },
    {
      path: "/emp-list",
      element: EmployeeListPage,
    },
    {
      path: "/leave-types",
      element: RulesPage,
    },
    {
      path: "/leave-types/add",
      element: LeaveTypesManager,
    },

    {
      path: "/leave-types/edit/:id",
      element: LeaveTypesManager,
    },
     {
      path: "/request-leave",
      element: RequestLeavePage,
    },
      {
      path: "/request-leave/history",
      element: LeaveHistoryPage,
    },
     {
      path: "/manage-leaves",
      element: LeaveManagementAdminPage,
    },
    {
      path: "/employees",
      element: EmployeeListPage,
    },
    {
      path: "/employees/add",
      element: EmployeeFormPage,
    },
    {
      path: "/employees/:id/edit",
      element: EmployeeFormPage,
    },
    //increment schemes
    {
      path: "/incrementschemes",
      element: IncrementSchemeList,
    },
     {
      path: "/increment-reports",
      element: IncrementReportPage,
    },
    {
      path: "/incrementschemes/add",
      element: IncrementSchemeForm,
    },
    {
      path: "/incrementschemes/edit/:id",
      element: IncrementSchemeForm,
    },
    //account page
    {
      path: "/account",
      element: AccountPage,
    },
     //log record
    {
      path: "/log",
      element:ActivityLog,
    },
  ];

  return (
    <Routes>
      {routes.map(({ path, element: Component, permission }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedPage permission={permission}>
              <Component />
            </ProtectedPage>
          }
        />
      ))}
    </Routes>
  );
};

export default PrivateRoutes;
