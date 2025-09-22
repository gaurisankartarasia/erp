import { sequelize } from "../models/index.js";
import { Op } from "sequelize";
import { log } from "../services/LogService.js"


const { Employee, Task } = sequelize.models;

export const getDashboardSummary = async (req, res) => {
  const { id: userId, is_master } = req.user;

  try {
    let summary = {};

    if (is_master) {
      const [
        totalEmployees,
        totalTasks,
        tasksInProgress,
        recentTasks,
        overallRating,
      ] = await Promise.all([
        Employee.count(),
        Task.count(),
        Task.count({ where: { status: "in_progress" } }),
        Task.findAll({
          limit: 5,
          order: [["createdAt", "DESC"]],
          include: { model: Employee, attributes: ["name"] },
        }),
        Task.findOne({
          attributes: [
            [
              sequelize.fn("AVG", sequelize.col("completion_rating")),
              "avgRating",
            ],
          ],
          where: { status: "completed" },
          raw: true,
        }),
      ]);
      summary = {
        kpi1: { title: "Total Employees", value: totalEmployees },
        kpi2: { title: "Total Tasks", value: totalTasks },
        kpi3: { title: "Tasks In Progress", value: tasksInProgress },
        kpi4: {
          title: "Overall Avg. Rating",
          value: parseFloat(overallRating.avgRating || 0).toFixed(2),
        },
        recentTasks,
      };
    } else {
      const [
        myTasks,
        myTasksInProgress,
        myTasksCompleted,
        recentTasks,
        myRating,
      ] = await Promise.all([
        Task.count({ where: { EmployeeId: userId } }),
        Task.count({ where: { EmployeeId: userId, status: "in_progress" } }),
        Task.count({ where: { EmployeeId: userId, status: "completed" } }),
        Task.findAll({
          where: { EmployeeId: userId },
          limit: 5,
          order: [["createdAt", "DESC"]],
        }),
        Task.findOne({
          attributes: [
            [
              sequelize.fn("AVG", sequelize.col("completion_rating")),
              "avgRating",
            ],
          ],
          where: { EmployeeId: userId, status: "completed" },
          raw: true,
        }),
      ]);
      summary = {
        kpi1: { title: "My Total Tasks", value: myTasks },
        kpi2: { title: "My Tasks In Progress", value: myTasksInProgress },
        kpi3: { title: "My Completed Tasks", value: myTasksCompleted },
        kpi4: {
          title: "My Avg. Rating",
          value: parseFloat(myRating.avgRating || 0).toFixed(2),
        },
        recentTasks,
      };
    }
    await log({
      req,
      action: "READ",
      page_name: "DASHBOARD SUMMAERY PAGE",

    });
    res.status(200).json(summary);
  } catch (error) {
    console.error("Dashboard summary error:", error);
    res.status(500).json({
      message: "Error fetching dashboard summary.",
      error: error.message,
    });
  }
};

export const getPerformanceCharts = async (req, res) => {
  const { id: userId, is_master, permissions } = req.user;
  const { view = "self" } = req.query;

  const canViewAll =
    is_master ||
    (permissions && permissions.includes("dashboard-view-all-performance"));
    // (permissions && permissions.includes(PERMISSIONS.VIEW_ALL_PERFORMANCE_CHART));

  const isAllEmployeesView = canViewAll && view === "all";

  try {
    const calculateData = async (timeframe) => {
      const whereClause = {
        status: "completed",
        completion_rating: { [Op.not]: null },
      };
      let dateBoundary;

      if (timeframe === "weekly") {
        dateBoundary = new Date(new Date() - 7 * 24 * 60 * 60 * 1000);
      } else {
        dateBoundary = new Date(
          new Date().setFullYear(new Date().getFullYear() - 1)
        );
      }
      whereClause.createdAt = { [Op.gte]: dateBoundary };
      if (!isAllEmployeesView) {
        whereClause.EmployeeId = userId;
      } else {
        whereClause["$Employee.is_master$"] = false;
      }
      const rawData = await Task.findAll({
        where: whereClause,
        attributes: [
          [
            sequelize.fn(
              "DATE_FORMAT",
              sequelize.col("Task.createdAt"),
              timeframe === "weekly" ? "%Y-%m-%d" : "%Y-%m"
            ),
            "date_group",
          ],
          "EmployeeId",
          [sequelize.col("Employee.name"), "employee_name"],
          [
            sequelize.fn("AVG", sequelize.col("completion_rating")),
            "average_rating",
          ],
          [sequelize.fn("COUNT", sequelize.col("Task.id")), "task_count"],
        ],
        include: [{ model: Employee, attributes: [] }],
        group: ["date_group", "EmployeeId", "Employee.name"],
        order: [[sequelize.col("date_group"), "ASC"]],
        raw: true,
      });
      const employees = [...new Set(rawData.map((r) => r.employee_name))];
      const timeMap = new Map();
      if (timeframe === "weekly") {
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(new Date().getDate() - i);
          const key = date.toISOString().split("T")[0];
          const label = `${date.getDate()} ${date.toLocaleString("en-US", {
            month: "short",
          })}, ${date.toLocaleString("en-US", { weekday: "short" })}`;
          const initialData = { name: label };
          if (isAllEmployeesView)
            employees.forEach((e) => (initialData[e] = 0));
          else initialData.rating = 0;
          timeMap.set(key, initialData);
        }
      } else {
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const key = `${date.getFullYear()}-${date.getMonth() + 1}`;
          const label = date.toLocaleString("en-US", { month: "short" });
          const initialData = { name: label };
          if (isAllEmployeesView)
            employees.forEach((e) => (initialData[e] = 0));
          else initialData.rating = 0;
          timeMap.set(key, initialData);
        }
      }
      rawData.forEach((item) => {
        let key;
        if (timeframe === "weekly") {
          key = item.date_group;
        } else {
          const date = new Date(item.date_group + "-02");
          key = `${date.getFullYear()}-${date.getMonth() + 1}`;
        }
        if (timeMap.has(key)) {
          if (isAllEmployeesView) {
            timeMap.get(key)[item.employee_name] = parseFloat(
              item.average_rating
            );
          } else {
            timeMap.get(key).rating = parseFloat(item.average_rating);
            timeMap.get(key).count = item.task_count;
          }
        }
      });
      return { data: Array.from(timeMap.values()), employees };
    };
    const [weekly, monthly] = await Promise.all([
      calculateData("weekly"),
      calculateData("monthly"),
    ]);
        await log({
      req,
      action: "READ",
      page_name: "DASHBOARD PERFOMRANCE CHART PAGE",
//  target: `Salary Component: ${newComponent.name} (ID: ${newComponent.id})`
    });
    res.status(200).json({
      weeklyData: weekly.data,
      weeklyEmployees: weekly.employees,
      monthlyData: monthly.data,
      monthlyEmployees: monthly.employees,
    });
  } catch (error) {
    console.error("Chart data error:", error);
    res
      .status(500)
      .json({ message: "Error fetching chart data.", error: error.message });
  }
};
