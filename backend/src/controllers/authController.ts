import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase, isSupabaseConfigured, localStore } from '../config/supabase.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

const JWT_SECRET = process.env.JWT_SECRET || 'edusmart_super_secure_jwt_secret_key_2026';

// Seed default users if store is empty
const ensureDefaultUsers = async () => {
  if (localStore.users.length === 0) {
    const defaultPassword = await bcrypt.hash('123456', 10);
    localStore.users.push(
      {
        id: 'usr-mhs-1',
        email: 'mahasiswa@kampus.ac.id',
        password_hash: defaultPassword,
        full_name: 'Budi Pratama',
        role: 'mahasiswa',
        nim_nip: '2024001',
        department: 'Teknik Informatika - Semester 7',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
      },
      {
        id: 'usr-dsn-1',
        email: 'dosen@kampus.ac.id',
        password_hash: defaultPassword,
        full_name: 'Dr. Siti Aminah, M.Kom',
        role: 'dosen',
        nim_nip: '198501012010011001',
        department: 'Fakultas Ilmu Komputer',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
      }
    );
  }
};

ensureDefaultUsers();

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, full_name, role, nim_nip, department } = req.body;

    if (!email || !password || !full_name) {
      res.status(400).json({ success: false, message: 'Email, kata sandi, dan nama lengkap wajib diisi.' });
      return;
    }

    const assignedRole = role === 'dosen' ? 'dosen' : 'mahasiswa';
    const password_hash = await bcrypt.hash(password, 10);

    if (isSupabaseConfigured && supabase) {
      // Check existing email in Supabase
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (existingUser) {
        res.status(400).json({ success: false, message: 'Email tersebut sudah terdaftar di sistem.' });
        return;
      }

      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          email: email.toLowerCase().trim(),
          password_hash,
          full_name,
          role: assignedRole,
          nim_nip: nim_nip || '',
          department: department || 'Fakultas Ilmu Komputer'
        })
        .select()
        .single();

      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email, role: newUser.role, fullName: newUser.full_name, nimNip: newUser.nim_nip },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil!',
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.full_name,
          role: newUser.role,
          nimNip: newUser.nim_nip,
          department: newUser.department
        }
      });
      return;
    }

    // Local fallback
    const exists = localStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      res.status(400).json({ success: false, message: 'Email tersebut sudah terdaftar di sistem.' });
      return;
    }

    const newUser = {
      id: 'usr-' + Date.now(),
      email: email.toLowerCase().trim(),
      password_hash,
      full_name,
      role: assignedRole,
      nim_nip: nim_nip || '',
      department: department || 'Fakultas Ilmu Komputer',
      avatar_url: assignedRole === 'dosen' 
        ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
    };

    localStore.users.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, fullName: newUser.full_name, nimNip: newUser.nim_nip },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil!',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        role: newUser.role,
        nimNip: newUser.nim_nip,
        department: newUser.department,
        avatarUrl: newUser.avatar_url
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + err.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Harap masukkan email dan kata sandi.' });
      return;
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email.toLowerCase().trim())
          .single();

        if (!error && user) {
          const isMatch = await bcrypt.compare(password, user.password_hash);
          if (isMatch) {
            const token = jwt.sign(
              { id: user.id, email: user.email, role: user.role, fullName: user.full_name, nimNip: user.nim_nip },
              JWT_SECRET,
              { expiresIn: '7d' }
            );

            res.json({
              success: true,
              message: 'Login berhasil!',
              token,
              user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
                nimNip: user.nim_nip,
                department: user.department,
                avatarUrl: user.avatar_url
              }
            });
            return;
          }
        }
      } catch (err) {
        console.warn('Supabase query error, falling back to localStore:', err);
      }
    }

    // Local fallback
    await ensureDefaultUsers();
    const user = localStore.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      res.status(401).json({ success: false, message: 'Email atau kata sandi tidak cocok.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Email atau kata sandi tidak cocok.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, fullName: user.full_name, nimNip: user.nim_nip },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        nimNip: user.nim_nip,
        department: user.department,
        avatarUrl: user.avatar_url
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server: ' + err.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Silakan masuk ke akun Anda terlebih dahulu.' });
    return;
  }

  res.json({
    success: true,
    user: req.user
  });
};
