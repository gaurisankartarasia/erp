import express from 'express';
import { protect, hasPermission } from '../middlewares/AuthMiddleware.js';
// import { PERMISSIONS } from '../../config/permissions.js';
import {
   getPayrollPreviewData,
       initiatePayrollGeneration, 
       getReportStatus,
        getPayrollReport,
        getRecentReports } from '../controllers/PayrollController.js';

const router = express.Router();

router.use(protect);


router.post('/preview', getPayrollPreviewData);


router.post('/initiate',
 
  initiatePayrollGeneration);
router.get('/status/:reportId',

 getReportStatus);
router.get('/report/:reportId',
 getPayrollReport);
router.get('/recent',

 getRecentReports);

export default router;