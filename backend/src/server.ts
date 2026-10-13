import express from 'express';
import dotenv from 'dotenv';
import { helmetSecurity, corsOptions, apiLimiter } from './middleware/security.js';
import authRoutes from './routes/authRoutes.js';
import materiRoutes from './routes/materiRoutes.js';
import tugasRoutes from './routes/tugasRoutes.js';
import kuisRoutes from './routes/kuisRoutes.js';
import absensiRoutes from './routes/absensiRoutes.js';
import nilaiRoutes from './routes/nilaiRoutes.js';
import courseRoutes from './routes/courseRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmetSecurity);
app.use(corsOptions);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply rate limiter to general API
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'EduSmart LMS Backend API is operational and secure.',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/materi', materiRoutes);
app.use('/api/tugas', tugasRoutes);
app.use('/api/kuis', kuisRoutes);
app.use('/api/absensi', absensiRoutes);
app.use('/api/nilai', nilaiRoutes);
app.use('/api/courses', courseRoutes);

// Global 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint API tidak ditemukan.' });
});

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal pada server backend.'
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 EduSmart LMS Express Server running securely on port ${PORT}`);
    console.log(`📡 Health Check URL: http://localhost:${PORT}/api/health`);
  });
}

export default app;
