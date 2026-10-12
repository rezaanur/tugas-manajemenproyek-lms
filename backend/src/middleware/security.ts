import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

// CORS configuration for security
export const corsOptions = cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// Helmet HTTP Security Headers
export const helmetSecurity = helmet({
  contentSecurityPolicy: false, // Allows flexible CDN font/asset loading if needed
  crossOriginEmbedderPolicy: false
});

// Rate limiter for Auth to prevent brute force
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 50, // max 50 request per IP dalam 15 menit
  message: {
    success: false,
    message: 'Terlalu banyak percobaan autentikasi dari alamat IP ini. Silakan coba lagi setelah 15 menit demi keamanan.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Batas laju permintaan terlampaui. Silakan perlambat permintaan Anda.'
  }
});
