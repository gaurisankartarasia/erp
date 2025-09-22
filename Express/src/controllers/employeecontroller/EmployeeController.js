import bcrypt from "bcrypt";
import { models, sequelize } from "../../models/index.js";
import { Op } from "sequelize";
import { log } from "../../services/LogService.js";
const Employee = sequelize.models.Employee;


export const registerEmployee = async (req, res) => {
  const {
    name,
    email,
    phone,
    address,
    is_master,
    joined_at,
  } = req.body;

  // ✅ Extract picture filename from the uploaded file
  const picture = req.file?.path;

  if (!name || !email || !phone || !address || !picture) {
    return res.status(400).json({
      message: 'Name, Email, Phone, Address, and Picture are required',
    });
  }

  try {
    // Check duplicate phone
    const existingPhone = await Employee.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone already exists" });
    }

    // Check duplicate email
    const existingEmail = await Employee.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Generate password (simple)
    const firstTwoLetters = name.slice(0, 2);
    const formattedLetters = firstTwoLetters[0].toUpperCase() + firstTwoLetters[1].toLowerCase();

    const phoneDigits = phone.replace(/\D/g, '');
    const lastFiveDigits = phoneDigits.slice(-5);

    const rawPassword = `${formattedLetters}@${lastFiveDigits}`;

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);

    // Create employee with hashed password
    const employee = await Employee.create({
      name,
      email,
      password: hashedPassword,
      phone,
      picture, // ✅ just store filename
      address,
      is_master,
      joined_at,
      is_active: true,
    });

    // Log the CREATE action
    await log({
      req,
      action: "CREATE",
      page_name: "EMPLOYEE FORM PAGE",
      target: `Employee ID: ${employee.id}`,
    });

    res.status(201).json({
      message: "Employee Created Successfully",
      data: employee,
      generatedPassword: rawPassword,
    });

  } catch (err) {
    res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

export const getAllEmployees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "DESC",
      search = "",
    } = req.query;

    const offset = (page - 1) * limit;

    const whereCondition = {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ],
    };

    const { rows: employees, count: totalEmployees } =
      await Employee.findAndCountAll({
        where: search ? whereCondition : {},
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [[sortBy, order.toUpperCase()]],
        attributes: {
          exclude: [
            "password",
            "activation_token",
            "activation_token_expires_at",
            "createdAt",
            "updatedAt",
            "is_master",
          ],
        },
      });

    return res.status(200).json({
      message: "Employees fetched successfully",
      data: employees,
        total: totalEmployees,
        page: parseInt(page),
        pages: Math.ceil(totalEmployees / limit),
      
    });
  } catch (err) {
    console.error("Error fetching employees:", err);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const getEmployeeById = async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(400).json({
        message: "Employee Not Found",
      });
    }

    await log({
      req,
      action: "READ",
      page_name: "EMPLOYEE FORM PAGE",
      target: employee.name,
    });

    res.status(200).json(employee); // ✅ fixed line

  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message, // 👈 helpful for debugging
    });
  }
};


export const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const updateFields = req.body;

  try {
    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(400).json({
        message: "Employee Not Found",
      });
    }

    // Check for duplicate email if changed
    if (updateFields.email && updateFields.email !== employee.email) {
      const existingEmail = await Employee.findOne({ where: { email: updateFields.email } });
      if (existingEmail) {
        return res.status(409).json({
          message: "Email already in use",
        });
      }
    }

    // Check for duplicate phone if changed
    if (updateFields.phone && updateFields.phone !== employee.phone) {
      const existingPhone = await Employee.findOne({ where: { phone: updateFields.phone } });
      if (existingPhone) {
        return res.status(409).json({
          message: "Phone already in use.",
        });
      }
    }

    // If file uploaded, update picture field with new filename
    if (req.file) {
      updateFields.picture = req.file.path; // This is just the filename set by the upload middleware
    }

    await log({
      req,
      action: "UPDATE",
      page_name: "EMPLOYEE FORM PAGE",
      target: employee.id,
    });

    // Update employee with new fields
    await employee.update(updateFields);

    res.status(200).json({
      message: "Employee updated successfully.",
      data: employee,
    });

  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};


export const toggleEmployeeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const employee = await Employee.findByPk(id);

        if (!employee) {
            return res.status(404).json({ message: "Employee not found." });
        }

        employee.is_active = !employee.is_active;
        await employee.save();
 

        res.status(200).json({
            message: `Employee has been ${employee.is_active ? "activated" : "deactivated"}.`,
            data: employee,
        });

    } catch (error) {
        console.error("Error toggling employee status:", error);
        res.status(500).json({ message: "Server error while toggling status." });
    }
};


export const getAccountById = async (req, res) => {
  const {id} = req.user

  try {
    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(400).json({
        message: "Employee Not Found",
      });
    }

    await log({
      req,
      action: "READ",
      page_name: "EMPLOYEE FORM PAGE",
      target: employee.id,
    });

    res.status(200).json(employee); // ✅ fixed line

  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message, // 👈 helpful for debugging
    });
  }
};


export const updateAccount = async (req, res) => {
  const {id} = req.user
  const updateFields = req.body;

  try {
    const employee = await Employee.findByPk(id);

    if (!employee) {
      return res.status(400).json({
        message: "Employee Not Found",
      });
    }

    // Check for duplicate email if changed
    if (updateFields.email && updateFields.email !== employee.email) {
      const existingEmail = await Employee.findOne({ where: { email: updateFields.email } });
      if (existingEmail) {
        return res.status(409).json({
          message: "Email already in use",
        });
      }
    }

    // Check for duplicate phone if changed
    if (updateFields.phone && updateFields.phone !== employee.phone) {
      const existingPhone = await Employee.findOne({ where: { phone: updateFields.phone } });
      if (existingPhone) {
        return res.status(409).json({
          message: "Phone already in use.",
        });
      }
    }

    // If file uploaded, update picture field with new filename
    if (req.file) {
      updateFields.picture = req.file.path; // This is just the filename set by the upload middleware
    }

    await log({
      req,
      action: "UPDATE",
      page_name: "EMPLOYEE FORM PAGE",
      target: employee.id,
    });

    // Update employee with new fields
    await employee.update(updateFields);

    res.status(200).json({
      message: "Employee updated successfully.",
      data: employee,
    });

  } catch (err) {
    console.error("Error updating employee:", err);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};