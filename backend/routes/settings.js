import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware.js';
import { requireAdmin } from '../middlewares/adminMiddleware.js';
import { getSettings, updateSettings } from '../controllers/settingsController.js';

const router = Router();

// Público: leer configuración (para aplicar colores/featured)
router.get('/', getSettings);

// Admin: actualizar
router.put('/', authenticateJWT, requireAdmin, updateSettings);

export default router;

