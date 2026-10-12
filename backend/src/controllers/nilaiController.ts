import { Response } from 'express';
import { supabase, isSupabaseConfigured, localStore } from '../config/supabase.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getGrades = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isDosen = req.user?.role === 'dosen';
    const userId = req.user?.id;

    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('grades').select('*').order('updated_at', { ascending: false });
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
    let list = [...localStore.grades];
    if (!isDosen && userId) {
      list = list.filter(g => g.student_id === userId);
    }
    res.json({ success: true, data: list });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const upsertGrade = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { 
      course_id, 
      course_name, 
      student_id, 
      student_name, 
      student_nim, 
      kkm, 
      tugas_score, 
      kuis_score, 
      uts_score, 
      uas_score 
    } = req.body;

    if (!course_name || !student_name) {
      res.status(400).json({ success: false, message: 'Mata kuliah dan nama mahasiswa wajib diisi.' });
      return;
    }

    const tScore = Number(tugas_score) || 0;
    const kScore = Number(kuis_score) || 0;
    const utsScore = Number(uts_score) || 0;
    const uasScore = Number(uas_score) || 0;
    const kkmVal = Number(kkm) || 75;

    // Academic formula: 30% Tugas + 20% Kuis + 25% UTS + 25% UAS
    const finalScore = Math.round((tScore * 0.3) + (kScore * 0.2) + (utsScore * 0.25) + (uasScore * 0.25));

    let gradeLetter = 'D';
    if (finalScore >= 88) gradeLetter = 'A';
    else if (finalScore >= 78) gradeLetter = 'B';
    else if (finalScore >= 70) gradeLetter = 'C';

    const status = finalScore >= kkmVal ? 'Tuntas' : 'Remedial';

    const gradeData = {
      id: 'grd-' + Date.now(),
      course_id: course_id || 'crs-1',
      course_name,
      student_id: student_id || 'mhs-1',
      student_name,
      student_nim: student_nim || '2024001',
      lecturer_name: req.user?.fullName || 'Dosen Pengampu',
      kkm: kkmVal,
      tugas_score: tScore,
      kuis_score: kScore,
      uts_score: utsScore,
      uas_score: uasScore,
      final_score: finalScore,
      grade_letter: gradeLetter,
      status,
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('grades').insert(gradeData).select().single();
      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }
      res.status(201).json({ success: true, message: `Nilai untuk ${student_name} berhasil disimpan!`, data });
      return;
    }

    // Local fallback
    localStore.grades.unshift(gradeData);
    res.status(201).json({ success: true, message: `Nilai untuk ${student_name} berhasil disimpan!`, data: gradeData });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteGrade = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('grades').delete().eq('id', id);
      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }
      res.json({ success: true, message: 'Data nilai berhasil dihapus.' });
      return;
    }

    localStore.grades = localStore.grades.filter(g => g.id !== id);
    res.json({ success: true, message: 'Data nilai berhasil dihapus.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
