import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'edusmart_super_secure_jwt_secret_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'dosen' | 'mahasiswa';
    fullName: string;
    nimNip?: string;
  };
}

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Silakan masuk ke akun Anda terlebih dahulu.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Sesi Anda telah berakhir. Silakan masuk kembali.' });
  }
};

export const requireRole = (allowedRole: 'dosen' | 'mahasiswa') => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Silakan masuk ke akun Anda terlebih dahulu.' });
      return;
    }

    if (req.user.role !== allowedRole) {
      const roleLabel = allowedRole === 'dosen' ? 'Dosen' : 'Mahasiswa';
      res.status(403).json({ 
        success: false, 
        message: `Halaman atau fitur ini khusus untuk ${roleLabel}.` 
      });
      return;
    }

    next();
  };
};
