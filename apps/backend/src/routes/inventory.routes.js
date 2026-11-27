import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller.js';
const router = Router();
router.get('/', inventoryController.list);
export default router;
