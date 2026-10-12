import { Router } from 'express';
import { getGrades, upsertGrade, deleteGrade } from '../controllers/nilaiController.js';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', getGrades);
router.post('/', requireRole('dosen'), upsertGrade);
router.delete('/:id', requireRole('dosen'), deleteGrade);

export default router;
