import { Router } from 'express';
import { getCourses, createCourse } from '../controllers/courseController.js';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authenticateJWT);

router.get('/', getCourses);
router.post('/', requireRole('dosen'), createCourse);

export default router;
