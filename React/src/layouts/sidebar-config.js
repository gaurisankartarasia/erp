import {
  MdDashboard,
  MdPeople,
  MdChecklist,
  MdTrendingUp,
  MdSecurity,
  MdEventAvailable,
  MdEventNote,
  MdPersonAddAlt,
  MdCurrencyRupee,
  MdArrowCircleUp,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
  MdDescription,
  MdPostAdd,
} from "react-icons/md";
import { GoTriangleRight  } from "react-icons/go";


// import { permissions } from "@/utils/permissions";

export const navItems = [
  {
    href: "/",
    icon: GoTriangleRight ,
    label: "Dashboard",
    permission: null,
  },

  {
    href: "/page-permissions",
    icon: GoTriangleRight ,
    label: "Page Permissions",
    permission: "PP ",
  },
  {
    href: "/employees",
    icon: GoTriangleRight ,
    label: "Employees",
    permission: null,
  },
  
    {
    label: "Increments",
    icon: GoTriangleRight ,
    permission: null,
    isSubmenu: true,
    subItems: [
    {
    href: "/incrementschemes",
    icon: GoTriangleRight ,
    label: "Increment Schemes",
    permission: null,
  },
  {
    href: "/increment-reports",
    icon: GoTriangleRight ,
    label: "Increment Reports",
    permission: null,
  },
    ],
  },
  {
    label: "Tasks",
    icon: GoTriangleRight ,
    permission: null,
    isSubmenu: true,
    subItems: [
      {
        href: "/tasks",
        icon: GoTriangleRight ,
        label: "Tasks",
        permission: null,
      },
      {
        href: "/tasks/history",
        icon: GoTriangleRight ,
        label: "Tasks History",
        permission: null,
      },
      {
        href: "/tasks/all-employees",
        icon: GoTriangleRight ,
        label: "All Employee Tasks",
        permission: null,
      },
    ],
  },
    {
    label: "Payroll",
    icon: GoTriangleRight ,
    permission: null,
    isSubmenu: true,
    subItems: [
     {
    href: "/salary-components",
    icon: GoTriangleRight ,
    label: "Salary Policy",
    permission: null,
  },
  {
    href: "/salary-stucture",
    icon: GoTriangleRight ,
    label: "SalaryStructurePage",
    permission: null,
  },
   {
    href: "/salary-payroll",
    icon:  MdCurrencyRupee,
    label: "Generate Salary",
    permission: null,
  },
    ],
  },
    {
    label: "Leaves",
    icon: GoTriangleRight ,
    permission: null,
    isSubmenu: true,
    subItems: [
      {
    href: "/leave-types",
    icon: GoTriangleRight ,
    label: "Leave Types",
    permission: null,
  },
    {
    href: "/manage-leaves",
    icon: GoTriangleRight ,
    label: "Manage Leaves",
    permission: null,
  },
   {
    href: "/request-leave",
    icon: GoTriangleRight ,
    label: "Request Leave",
    permission: null,
  },
    ],
  },
 {
    href: "/log",
    icon: GoTriangleRight ,
    label: "ActivityLog",
    permission: null,
  }


   

];
