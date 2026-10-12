import { Response } from 'express';
import { supabase, isSupabaseConfigured, localStore } from '../config/supabase.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getMaterials = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.query;

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('materials').select('*').order('created_at', { ascending: false });
      if (courseId) {
        query = query.eq('course_id', courseId);
      }
      const { data, error } = await query;
      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }
      res.json({ success: true, data });
      return;
    }

    let list = [...localStore.materials];
    if (courseId) {
      list = list.filter(m => m.course_id === courseId);
    }
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { course_id, course_name, title, description, type, file_url } = req.body;

    if (!title || !description) {
      res.status(400).json({ success: false, message: 'Judul dan deskripsi materi wajib diisi.' });
      return;
    }

    const newMaterial = {
      id: 'mat-' + Date.now(),
      course_id: course_id || 'crs-1',
      course_name: course_name || 'Mata Kuliah',
      title,
      description,
      type: type || 'PDF',
      file_url: file_url || '#',
      author_id: req.user?.id || 'dosen',
      author_name: req.user?.fullName || 'Dosen Pengampu',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('materials').insert(newMaterial).select().single();
      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }
      res.status(201).json({ success: true, message: 'Bahan ajar berhasil diunggah!', data });
      return;
    }

    localStore.materials.unshift(newMaterial);
    res.status(201).json({ success: true, message: 'Bahan ajar berhasil diunggah!', data: newMaterial });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteMaterial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('materials').delete().eq('id', id);
      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }
      res.json({ success: true, message: 'Materi berhasil dihapus.' });
      return;
    }

    localStore.materials = localStore.materials.filter(m => m.id !== id);
    res.json({ success: true, message: 'Materi berhasil dihapus.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
