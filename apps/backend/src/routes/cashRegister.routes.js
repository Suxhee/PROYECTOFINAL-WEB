import { Router } from 'express';
import { cashRegisterController } from '../controllers/cashRegister.controller.js';
const router = Router();
router.get('/status', cashRegisterController.status);
export default router;
