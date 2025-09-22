import express from "express";
import {
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTaskHistories,
  getAvailableTasks,
  getMyActiveTasks,
} from "../controllers/TaskController.js";
import { protect } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/").post(createTask);

router.route("/active-tasks").get(getMyActiveTasks);
router.route("/all-employees").get(getAvailableTasks);

router.route("/histories").get(getTaskHistories);

router.route("/:id").get(getTaskById).put(updateTask).delete(deleteTask);

router.route("/:id/status").patch(updateTaskStatus);

export default router;
