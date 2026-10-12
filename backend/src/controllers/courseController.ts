import { Request, Response } from 'express';
import { supabase, isSupabaseConfigured, localStore } from '../config/supabase.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getCourses = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }
      res.json({ success: true, data: data || [] });
      return;
    }

    res.json({ success: true, data: localStore.courses });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code, name, description, color } = req.body;

    if (!code || !name) {
      res.status(400).json({ success: false, message: 'Kode dan nama mata kuliah wajib diisi.' });
      return;
    }

    const newCourse = {
      id: 'crs-' + Date.now(),
      code,
      name,
      description: description || '',
      lecturer_id: req.user?.id,
      lecturer_name: req.user?.fullName || 'Dosen Pengampu',
      color: color || 'indigo'
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('courses').insert(newCourse).select().single();
      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }
      res.status(201).json({ success: true, message: 'Mata kuliah baru berhasil ditambahkan!', data });
      return;
    }

    localStore.courses.push(newCourse);
    res.status(201).json({ success: true, message: 'Mata kuliah baru berhasil ditambahkan!', data: newCourse });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
