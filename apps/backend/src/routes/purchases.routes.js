import { Router } from 'express';
import { purchasesController } from '../controllers/purchases.controller.js';
const router = Router();
router.get('/', purchasesController.list);
export default router;
