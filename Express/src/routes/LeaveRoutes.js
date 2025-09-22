import express from "express";
import { protect } from "../middlewares/AuthMiddleware.js";
import {
  getLeaveConfig,
  updateLeaveRequest,
  getMyLeaveRequests,
  getManagedLeaveRequests,
  validateLeaveRequest,
  createSingleLeaveRequest,
  createSplitLeaveRequest,
  getCalendarData,
} from "../controllers/LeaveController.js";

const router = express.Router();

router.use(protect);

router.post("/validate", validateLeaveRequest);
router.post("/create-single", createSingleLeaveRequest);
router.post("/create-split", createSplitLeaveRequest);
router.get("/calendar-data", getCalendarData);

router.get("/config", getLeaveConfig);
router.get("/my-requests", getMyLeaveRequests);
router.get(
  "/manage",
  getManagedLeaveRequests
);
router.patch(
  "/:id",
  updateLeaveRequest
);

export default router;
