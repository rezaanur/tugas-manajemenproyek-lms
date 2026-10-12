import { Router } from 'express';
import { getAttendances, recordAttendance, deleteAttendance } from '../controllers/absensiController.js';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAttendances);
router.post('/', recordAttendance);
router.delete('/:id', requireRole('dosen'), deleteAttendance);

export default router;
