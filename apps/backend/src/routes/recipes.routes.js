import { Router } from 'express';
import { recipesController } from '../controllers/recipes.controller.js';
const router = Router();
router.get('/', recipesController.list);
export default router;
