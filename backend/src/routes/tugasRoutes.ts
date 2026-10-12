import { Router } from 'express';
import { 
  getAssignments, 
  createAssignment, 
  submitAssignment, 
  gradeSubmission, 
  deleteAssignment 
} from '../controllers/tugasController.js';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', getAssignments);
router.post('/', requireRole('dosen'), createAssignment);
router.post('/submit', requireRole('mahasiswa'), submitAssignment);
router.post('/grade', requireRole('dosen'), gradeSubmission);
router.delete('/:id', requireRole('dosen'), deleteAssignment);

export default router;
