import { Router } from 'express';
import { 
  getQuizzes, 
  getQuizDetails, 
  createQuiz, 
  submitQuizAttempt, 
  deleteQuiz 
} from '../controllers/kuisController.js';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', getQuizzes);
router.get('/:id', getQuizDetails);
router.post('/', requireRole('dosen'), createQuiz);
router.post('/attempt', requireRole('mahasiswa'), submitQuizAttempt);
router.delete('/:id', requireRole('dosen'), deleteQuiz);

export default router;
