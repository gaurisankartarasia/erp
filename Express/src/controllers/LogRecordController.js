import { Op } from "sequelize";
import { models } from "../models/index.js";
import { log } from "../services/LogService.js";

const { Log, Employee } = models;

export const listLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const search = req.query.search || "";
    let sortBy = req.query.sort || "created_at";
    const sortOrder = req.query.order || "DESC";

    const sortByEmployee = sortBy === "employee_name";
    const dbSortBy = sortByEmployee ? "created_at" : sortBy;
    const offset = (page - 1) * limit;

    const whereClause = {
      [Op.or]: [
        { action: { [Op.like]: `%${search}%` } },
        { page_name: { [Op.like]: `%${search}%` } },
        { target: { [Op.like]: `%${search}%` } },
        { ip: { [Op.like]: `%${search}%` } },
        { os: { [Op.like]: `%${search}%` } },
        { browser: { [Op.like]: `%${search}%` } },
        { platform: { [Op.like]: `%${search}%` } },
      ],
    };

    if (search) {
      const matchingEmployees = await Employee.findAll({
        where: { name: { [Op.like]: `%${search}%` } },
        attributes: ["id"],
      });
      const matchingEmployeeIds = matchingEmployees.map((e) => e.id);

      if (matchingEmployeeIds.length > 0) {
        whereClause[Op.or].push({
          employee_id: { [Op.in]: matchingEmployeeIds },
        });
      }
    }

    const { count, rows: logs } = await Log.findAndCountAll({
      where: whereClause,
      order: [[dbSortBy, sortOrder.toUpperCase()]],
      limit,
      offset,
    });

    const employeeIds = [...new Set(logs.map((log) => log.employee_id))];
    let employeeMap = {};
    if (employeeIds.length > 0) {
      const employees = await Employee.findAll({
        where: { id: employeeIds },
        attributes: ["id", "name"],
      });
      employeeMap = employees.reduce((map, emp) => {
        map[emp.id] = emp.name;
        return map;
      }, {});
    }

    const dataWithEmployeeNames = logs.map((log) => {
      const logJSON = log.toJSON();
      return {
        ...logJSON,
        employee_name: employeeMap[logJSON.employee_id] || "Unknown Employee",
        description: `${log.action} ${
          log.target === null ? "" : log.target
        } in ${log.page_name} page.`,
      };
    });

    if (sortByEmployee) {
      dataWithEmployeeNames.sort((a, b) => {
        const nameA = a.employee_name.toLowerCase();
        const nameB = b.employee_name.toLowerCase();
        return sortOrder.toUpperCase() === "ASC"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
    }

    await log({
      req,
      action: "READ",
      page_name: "LOG RECORDS",
    });

    res.status(200).json({
      total: count,
      data: dataWithEmployeeNames,
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ message: "Server error while fetching logs." });
  }
};
