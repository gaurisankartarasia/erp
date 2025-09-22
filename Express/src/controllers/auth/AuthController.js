import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import {models} from "../../models/index.js";

const { Employee } = models;

const JWT_SECRET = process.env.JWT_SECRET;

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Both email and password are required",
    });
  }

  try {
    const user = await Employee.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatched = await bcrypt.compare(password, user.password);

    if (!isMatched) {
      return res.status(400).json({
        message: "Password does not match",
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      is_master: user.is_master,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        is_master: user.is_master,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logout successful." });
};

export const getCurrentUser = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const employee = await Employee.findByPk(decoded.id, {
      attributes: [
        "id",
        "name",
        "email",
        "is_master",
        "picture",
        "last_login",
        "is_active",
      ],
    });

    if (!employee) {
      return res.status(404).json({ message: "User not found." });
    }
    if (!employee.is_active) {
      return res.status(403).json({ message: "Account inactive" });
    }

    let permissions = [];
    if (!employee.is_master) {
      const employeePermissions = await employee.getPermissions({
        attributes: ["code_name"],
        raw: true,
      });
      permissions = employeePermissions.map((p) => p.code_name);
    }

    res.status(200).json({
      user: {
        id: employee.id,
        name: employee.name,
        email: employee.email,
        is_master: employee.is_master,
        permissions,
        picture: employee.picture,
        last_login: employee.last_login,
      },
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(401).json({ message: "Invalid token." });
  }
};
