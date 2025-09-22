import express from 'express';
import { listLogs } from '../controllers/LogRecordController.js';

const logRecordRouter = express.Router();


logRecordRouter.get('/', listLogs);

export default logRecordRouter;


//  /logs/all-logs 