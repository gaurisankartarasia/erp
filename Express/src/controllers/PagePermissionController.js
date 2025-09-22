import {models} from "../models/index.js";
import asyncHandler from "express-async-handler";
import sequelize from "../../configs/db.js";

const { Employee, Permission } = models;
/**
 * @desc    Get all permissions
 * @route   GET /api/permissions
 * @access  Private (to be secured later)
 */
const getAllPermissions = asyncHandler(async (req, res) => {
  const permissions = await Permission.findAll({
    order: [
      ["page_name", "ASC"],
      ["description", "ASC"],
    ],
  });
  res.status(200).json(permissions);
});

/**
 * @desc    Get all employees (simplified list)
 * @route   GET /api/employees
 * @access  Private (to be secured later)
 */
const getAllEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.findAll({
    attributes: ["id", "name", "email"],
    where: { is_master: false },
    order: [["name", "ASC"]],
  });
  res.status(200).json(employees);
});

/**
 * @desc    Get permissions for a specific employee
 * @route   GET /api/employees/:id/permissions
 * @access  Private (to be secured later)
 */
const getEmployeePermissions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const employee = await Employee.findByPk(id);

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const permissions = await employee.getPermissions();
  res.status(200).json(permissions);
});

/**
 * @desc    Update permissions for a specific employee
 * @route   PUT /api/employees/:id/permissions
 * @access  Private (to be secured later)
 */
const updateEmployeePermissions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { permissionIds } = req.body;

  if (!Array.isArray(permissionIds)) {
    res.status(400);
    throw new Error("Invalid data format. permissionIds must be an array.");
  }

  const employee = await Employee.findByPk(id);

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const transaction = await sequelize.transaction();

  try {
    await employee.setPermissions(permissionIds, { transaction });

    await transaction.commit();

    res.status(200).json({ message: "Permissions updated successfully" });
  } catch (error) {
    await transaction.rollback();
    res.status(500);
    throw new Error("Failed to update permissions.");
  }
});

export {
  getAllPermissions,
  getAllEmployees,
  getEmployeePermissions,
  updateEmployeePermissions,
};
