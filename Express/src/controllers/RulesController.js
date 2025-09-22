import { models, sequelize } from "../models/index.js";
const { LeaveType, CompanyRule } = models;

import { Op } from "sequelize";
export const getLeaveTypes = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const sortBy = req.query.sort || "id";
    const sortOrder = req.query.order === "desc" ? "DESC" : "ASC";

    const offset = (page - 1) * limit;

    const allowedSortFields = [
      "id",
      "name",
      "monthly_allowance_days",
      "max_days_per_request",
      "is_unpaid",
    ];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : "id";

    const { rows, count } = await LeaveType.findAndCountAll({
      where: search
        ? {
            [Op.or]: [
              { name: { [Op.like]: `%${search}%` } },
              { description: { [Op.like]: `%${search}%` } },
            ],
          }
        : {},
      order: [[sortField, sortOrder]],
      limit,
      offset,
    });

    res.status(200).json({
      data: rows,
      total: count,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching leave types:", error);
    res
      .status(500)
      .json({ message: "Error fetching leave types", error: error.message });
  }
};

export const getLeaveTypeById = async (req, res) => {
  const { id } = req.params;
  try {
    const leaveType = await LeaveType.findByPk(id);
    if (!leaveType) {
      return res.status(404).json({ message: "Leave type not found." });
    }
    res.status(200).json(leaveType);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching leave type", error: error.message });
  }
};

export const createLeaveType = async (req, res) => {
  try {
    const { name, monthly_allowance_days, max_days_per_request, is_unpaid } =
      req.body;

    const newLeaveType = await LeaveType.create({
      name,
      monthly_allowance_days,
      max_days_per_request,
      is_unpaid: is_unpaid || false,
    });

    res.status(201).json(newLeaveType);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error creating leave type", error: error.message });
  }
};

export const updateLeaveType = async (req, res) => {
  const { id } = req.params;
  try {
    const leaveType = await LeaveType.findByPk(id);
    if (!leaveType) {
      return res.status(404).json({ message: "Leave type not found." });
    }

    const { name, monthly_allowance_days, max_days_per_request, is_unpaid } =
      req.body;
    await leaveType.update({
      name,
      monthly_allowance_days,
      max_days_per_request,
      is_unpaid,
    });

    res.status(200).json(leaveType);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating leave type", error: error.message });
  }
};

export const deleteLeaveType = async (req, res) => {
  const { id } = req.params;
  try {
    const leaveType = await LeaveType.findByPk(id);
    if (!leaveType) {
      return res.status(404).json({ message: "Leave type not found." });
    }
    await leaveType.destroy();
    res.status(200).json({ message: "Leave type deleted successfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting leave type", error: error.message });
  }
};

export const getCompanyRules = async (req, res) => {
  try {
    const rules = await CompanyRule.findAll();
    res.status(200).json(rules);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching company rules", error: error.message });
  }
};

export const updateCompanyRules = async (req, res) => {
  const rulesToUpdate = req.body;
  const t = await sequelize.transaction();
  try {
    await Promise.all(
      rulesToUpdate.map((rule) =>
        CompanyRule.update(
          { rule_value: rule.rule_value },
          { where: { rule_key: rule.rule_key }, transaction: t }
        )
      )
    );
    await t.commit();
    res.status(200).json({ message: "Company rules updated successfully." });
  } catch (error) {
    await t.rollback();
    res
      .status(500)
      .json({ message: "Error updating company rules", error: error.message });
  }
};
