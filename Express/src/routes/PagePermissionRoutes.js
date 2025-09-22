import express from 'express';
import { getAllPermissions,  getAllEmployees,
  getEmployeePermissions,
  updateEmployeePermissions, } from '../controllers/PagePermissionController.js';
import {protect, hasPermission} from "../middlewares/AuthMiddleware.js"


const router = express.Router();
router.use(protect).use(hasPermission("PP"))

// The protect middleware would be added here later for security
router.route('/permissions').get(getAllPermissions);
router.route('/employees').get(getAllEmployees);

router
  .route('/:id/permissions')
  .get(getEmployeePermissions)
  .put(updateEmployeePermissions);


export default router;