import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import cookieParser from "cookie-parser";
import sequelize from "../configs/db.js";
import useragent from "express-useragent"


import authRoutes from "./routes/AuthRoutes.js"
import taskRoutes from "./routes/TaskRoutes.js"
import pagePermissionRoutes from "./routes/PagePermissionRoutes.js"
import SalaryRoutes from "./routes/SalaryRoutes.js";
import employeeRouter from "./routes/EmployeeRoutes.js"
import RulesRoutes from "./routes/RulesRoutes.js";
import incrementSchemesRouter from "./routes/IncrementSchemeRoutes.js"
import leaveRequestRoutes from "./routes/LeaveRoutes.js"
import logRecordRouter from "./routes/LogRecordsRoutes.js";
import payrollRoutes from './routes/PayrollRoutes.js';
import attendanceRoutes from './routes/AttendanceRoutes.js';
import leaveRoutes from './routes/LeaveRoutes.js';
import dashboardRoutes from "./routes/DashboardRoutes.js"



dotenv.config();
const app = express();
const PORT = process.env.PORT;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,

    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(useragent.express())

app.use(express.static(path.join(__dirname, "../public")));





//routes here
app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/page-permissions", pagePermissionRoutes)
app.use('/api/salary', SalaryRoutes);
app.use("/api/employee", employeeRouter)
app.use("/api/rules", RulesRoutes);
app.use("/api/leave", leaveRequestRoutes)
app.use('/api/attendance', attendanceRoutes);
app.use('/api/payroll', payrollRoutes);
app.use("/api/increment-scheme",incrementSchemesRouter)
app.use("/logs", logRecordRouter);
app.use('/api/leave', leaveRoutes);
app.use('/api/dashboard', dashboardRoutes);


const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('db success');

    // await sequelize.sync({ alter: true });
    // console.log('sync success');

    app.listen(PORT, () => {
      console.log(`bluetooth connected on ${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();
