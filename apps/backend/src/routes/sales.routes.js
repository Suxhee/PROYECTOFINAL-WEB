import { Router } from 'express';
import { salesController } from '../controllers/sales.controller.js';
const router = Router();
router.get('/', salesController.list);
router.post('/', salesController.create);
export default router;
