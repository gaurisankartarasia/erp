import { Op } from "sequelize";
import { calculateSalaryBreakdown } from "./SalaryController.js";
import { models, sequelize } from "../models/index.js";

const { IncrementScheme, Task, Employee } = models;

export const createIncrementScheme = async (req, res) => {
  const { rating, level, percentage } = req.body;

  try {
    const newScheme = await IncrementScheme.create({
      rating,
      level,
      percentage,
    });
    res.status(201).json(newScheme);
  } catch (error) {
    res.status(500).json({
      message: "Error creating increment scheme",
      error: error.message,
    });
  }
};

export const getIncrementSchemes = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || "";
  const sortBy = req.query.sort || "created_at";
  const sortOrder = (req.query.order || "DESC").toUpperCase();

  const allowedSortColumns = [
    "id",
    "rating",
    "level",
    "percentage",
    "created_at",
    "updated_at",
  ];
  if (!allowedSortColumns.includes(sortBy)) {
    return res.status(400).json({ message: "Invalid sort column" });
  }

  try {
    const whereClause = search
      ? {
          [Op.or]: [
            { level: { [Op.iLike]: `%${search}%` } },
            { rating: isNaN(search) ? undefined : Number(search) },
          ],
        }
      : {};

    const { count, rows } = await IncrementScheme.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [[sortBy, sortOrder]],
    });

    res.status(200).json({
      total: count,
      page,
      limit,
      data: rows,
    });
  } catch (error) {
    console.error("Error fetching increment schemes:", error);
    res.status(500).json({
      message: "Error fetching increment schemes",
      error: error.message,
    });
  }
};

export const updateIncrementScheme = async (req, res) => {
  const { id } = req.params;
  const { rating, level, percentage } = req.body;

  try {
    const scheme = await IncrementScheme.findByPk(id);

    if (!scheme) {
      return res.status(404).json({ message: "Increment scheme not found" });
    }

    scheme.rating = rating ?? scheme.rating;
    scheme.level = level ?? scheme.level;
    scheme.percentage = percentage ?? scheme.percentage;

    await scheme.save();

    res.status(200).json(scheme);
  } catch (error) {
    res.status(500).json({
      message: "Error updating increment scheme",
      error: error.message,
    });
  }
};
export const deleteIncrementScheme = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await IncrementScheme.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ message: "Increment scheme not found" });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      message: "Error deleting increment scheme",
      error: error.message,
    });
  }
};

export const getIncrementReport = async (req, res) => {
  try {
    const {
      search,
      page = 1,
      limit = 10,
      sort = "name",
      order = "ASC",
    } = req.query;

    const schemeRows = await IncrementScheme.findAll({ raw: true });
    if (schemeRows.length === 0) {
      return res
        .status(500)
        .json({ message: "Increment scheme is not configured." });
    }

    const schemeMap = new Map(
      schemeRows.map((item) => [item.rating, parseFloat(item.percentage)])
    );
    const defaultPercentage = schemeMap.get(0) || 0;

    const parsedLimit = parseInt(limit, 10);
    const offset = (parseInt(page, 10) - 1) * parsedLimit;

    const whereClause = { is_master: false };
    if (search) {
      whereClause.name = { [Op.like]: `%${search}%` };
    }

    const dbSortableColumns = ["name", "joined_at"];
    const dbSort = dbSortableColumns.includes(sort) ? sort : "name";
    const dbOrder = order.toUpperCase();

    const allMatchingEmployees = await Employee.findAll({
      where: whereClause,
      attributes: [
        "id",
        "name",
        "joined_at",
        "picture",
        "email",
        "phone",
        [
          sequelize.fn(
            "DATEDIFF",
            sequelize.fn("NOW"),
            sequelize.col("joined_at")
          ),
          "days_of_service",
        ],
        [
          sequelize.fn("AVG", sequelize.col("Tasks.completion_rating")),
          "average_rating",
        ],
      ],
      include: [
        {
          model: Task,
          as: "Tasks",
          attributes: [],
          where: { status: "completed" },
          required: false,
        },
      ],
      group: ["Employee.id"],
      order: [[dbSort, dbOrder]],
      subQuery: false,
    });

    const fullReport = [];
    for (const emp of allMatchingEmployees) {
      const rawEmp = emp.get({ plain: true });
      const roundedRating = Math.round(rawEmp.average_rating || 0);
      const isEligible = rawEmp.days_of_service >= 180;
      const incrementPercentage = isEligible
        ? schemeMap.get(roundedRating) || defaultPercentage
        : 0;

      const salaryStructureResult = await calculateSalaryBreakdown(rawEmp.id);
      let currentSalary = 0;

      if (!salaryStructureResult.error) {
        currentSalary = salaryStructureResult.breakdown
          .filter((component) => component.type === "Earning")
          .reduce((total, component) => total + component.amount, 0);
      }

      fullReport.push({
        ...rawEmp,
        average_rating: rawEmp.average_rating
          ? parseFloat(rawEmp.average_rating).toFixed(2)
          : "N/A",
        is_eligible: isEligible,
        increment_percentage: incrementPercentage,
        current_salary: currentSalary,
        new_salary: currentSalary * (1 + incrementPercentage / 100),
      });
    }

    const derivedSortFields = ["current_salary", "new_salary", "is_eligible"];
    if (derivedSortFields.includes(sort)) {
      fullReport.sort((a, b) => {
        const valA = a[sort];
        const valB = b[sort];
        if (order.toUpperCase() === "ASC") {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
    }

    const paginatedReport = fullReport.slice(offset, offset + parsedLimit);

    res.status(200).json({
      total: fullReport.length,
      data: paginatedReport,
    });
  } catch (error) {
    console.error("Error generating increment report:", error);
    res
      .status(500)
      .json({
        message: "Error generating increment report",
        error: error.message,
      });
  }
};
