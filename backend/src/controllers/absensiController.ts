import { Response } from 'express';
import { supabase, isSupabaseConfigured, localStore } from '../config/supabase.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getAttendances = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isDosen = req.user?.role === 'dosen';
    const userId = req.user?.id;

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('attendances').select('*').order('created_at', { ascending: false });
      if (!isDosen && userId) {
        query = query.eq('student_id', userId);
      }
      const { data, error } = await query;
      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }
      res.json({ success: true, data });
      return;
    }

    // Local fallback
    let list = [...localStore.attendances];
    if (!isDosen && userId) {
      list = list.filter(a => a.student_id === userId);
    }
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const recordAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { course_id, course_name, student_id, student_name, status, notes } = req.body;
    const isDosen = req.user?.role === 'dosen';

    const assignedStudentId = (isDosen && student_id) ? student_id : (req.user?.id || 'mhs-1');
    const assignedStudentName = (isDosen && student_name) ? student_name : (req.user?.fullName || 'Budi Pratama');

    const newAttendance = {
      id: 'abs-' + Date.now(),
      course_id: course_id || 'crs-1',
      course_name: course_name || 'Mata Kuliah',
      student_id: assignedStudentId,
      student_name: assignedStudentName,
      date: new Date().toISOString().split('T')[0],
      time_string: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
      status: status || 'Hadir',
      notes: notes || 'Presensi digital tercatat.',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('attendances').insert(newAttendance).select().single();
      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }
      res.status(201).json({ success: true, message: `Presensi (${status}) untuk ${assignedStudentName} berhasil dicatat!`, data });
      return;
    }

    // Local fallback
    localStore.attendances.unshift(newAttendance);
    res.status(201).json({ success: true, message: `Presensi (${status}) untuk ${assignedStudentName} berhasil dicatat!`, data: newAttendance });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('attendances').delete().eq('id', id);
      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }
      res.json({ success: true, message: 'Catatan presensi berhasil dihapus.' });
      return;
    }

    localStore.attendances = localStore.attendances.filter(a => a.id !== id);
    res.json({ success: true, message: 'Catatan presensi berhasil dihapus.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
