import { Router } from 'express';
import { getMaterials, createMaterial, deleteMaterial } from '../controllers/materiController.js';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', getMaterials);
router.post('/', requireRole('dosen'), createMaterial);
router.delete('/:id', requireRole('dosen'), deleteMaterial);

export default router;
