import { Router } from 'express';
import { payrollController } from '../controllers/payroll.controller.js';
const router = Router();
router.get('/employees', payrollController.list);
export default router;
