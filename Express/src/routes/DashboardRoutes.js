import express from "express";

import { getDashboardSummary, getPerformanceCharts } from "../controllers/DashboardController.js";
// import { PERMISSIONS } from "../../config/permissions.js";
import { protect } from '../middlewares/AuthMiddleware.js';

const router = express.Router();

router.use(protect);

router.get("/summary", getDashboardSummary); 
router.get("/charts", getPerformanceCharts);

export default router;
