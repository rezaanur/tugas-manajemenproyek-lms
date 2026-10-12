import { Response } from 'express';
import { supabase, isSupabaseConfigured, localStore } from '../config/supabase.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isDosen = req.user?.role === 'dosen';
    const userId = req.user?.id;

    if (isSupabaseConfigured && supabase) {
      const { data: assignments, error } = await supabase
        .from('assignments')
        .select('*, submissions(*)')
        .order('created_at', { ascending: false });

      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }

      // Format based on role
      const formatted = (assignments || []).map(a => {
        const userSubmission = (a.submissions || []).find((s: any) => s.student_id === userId);
        return {
          ...a,
          userSubmission: userSubmission || null,
          allSubmissions: isDosen ? a.submissions : undefined
        };
      });

      res.json({ success: true, data: formatted });
      return;
    }

    // Local fallback
    const formatted = localStore.assignments.map(a => {
      const userSubmission = localStore.submissions.find(s => s.assignment_id === a.id && s.student_id === userId);
      const allSubs = localStore.submissions.filter(s => s.assignment_id === a.id);
      return {
        ...a,
        userSubmission: userSubmission || null,
        allSubmissions: isDosen ? allSubs : undefined
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { course_id, course_name, title, description, deadline } = req.body;

    if (!title || !deadline) {
      res.status(400).json({ success: false, message: 'Judul tugas dan batas waktu pengumpulan wajib diisi.' });
      return;
    }

    const newAssignment = {
      id: 'tug-' + Date.now(),
      course_id: course_id || 'crs-1',
      course_name: course_name || 'Mata Kuliah',
      title,
      description: description || '',
      deadline,
      created_by: req.user?.id,
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('assignments').insert(newAssignment).select().single();
      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }
      res.status(201).json({ success: true, message: 'Tugas baru berhasil diterbitkan!', data });
      return;
    }

    localStore.assignments.unshift(newAssignment);
    res.status(201).json({ success: true, message: 'Tugas baru berhasil diterbitkan!', data: newAssignment });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const submitAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { assignment_id, file_name, notes } = req.body;

    if (!assignment_id) {
      res.status(400).json({ success: false, message: 'ID tugas tidak valid.' });
      return;
    }

    const studentId = req.user?.id || 'mhs-1';
    const studentName = req.user?.fullName || 'Budi Pratama';
    const studentNim = req.user?.nimNip || '2024001';

    const submissionData = {
      id: 'sub-' + Date.now(),
      assignment_id,
      student_id: studentId,
      student_name: studentName,
      student_nim: studentNim,
      file_name: file_name || `Jawaban_${studentName.replace(/\s+/g, '')}.pdf`,
      notes: notes || '',
      score: null,
      feedback: '',
      status: 'Sudah Dikumpulkan',
      submitted_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('submissions')
        .upsert(submissionData, { onConflict: 'assignment_id,student_id' })
        .select()
        .single();

      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }
      res.json({ success: true, message: 'Jawaban tugas berhasil dikumpulkan ke dosen!', data });
      return;
    }

    // Local fallback
    const existingIndex = localStore.submissions.findIndex(s => s.assignment_id === assignment_id && s.student_id === studentId);
    if (existingIndex >= 0) {
      localStore.submissions[existingIndex] = { ...localStore.submissions[existingIndex], ...submissionData };
    } else {
      localStore.submissions.unshift(submissionData);
    }

    res.json({ success: true, message: 'Jawaban tugas berhasil dikumpulkan ke dosen!', data: submissionData });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const gradeSubmission = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { submission_id, assignment_id, student_id, score, feedback } = req.body;

    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      res.status(400).json({ success: false, message: 'Masukkan nilai yang valid (skala 0 - 100).' });
      return;
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('submissions')
        .update({
          score: numScore,
          feedback: feedback || 'Telah diperiksa dan dinilai oleh dosen pengampu.',
          status: 'Dinilai',
          graded_at: new Date().toISOString()
        })
        .match(submission_id ? { id: submission_id } : { assignment_id, student_id })
        .select()
        .single();

      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }
      res.json({ success: true, message: `Nilai ${numScore} berhasil disimpan!`, data });
      return;
    }

    // Local fallback
    let target = localStore.submissions.find(s => 
      submission_id ? s.id === submission_id : (s.assignment_id === assignment_id && s.student_id === student_id)
    );

    if (!target) {
      // Create mock submission record if needed
      target = {
        id: 'sub-' + Date.now(),
        assignment_id: assignment_id || 'tug-1',
        student_id: student_id || 'mhs-1',
        student_name: 'Budi Pratama',
        student_nim: '2024001',
        file_name: 'Jawaban_Mahasiswa.pdf',
        notes: 'Telah dikumpulkan',
        score: numScore,
        feedback: feedback || 'Telah diperiksa oleh dosen.',
        status: 'Dinilai',
        submitted_at: new Date().toISOString(),
        graded_at: new Date().toISOString()
      };
      localStore.submissions.push(target);
    } else {
      target.score = numScore;
      target.feedback = feedback || 'Telah diperiksa oleh dosen.';
      target.status = 'Dinilai';
      target.graded_at = new Date().toISOString();
    }

    res.json({ success: true, message: `Nilai ${numScore} berhasil disimpan!`, data: target });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('assignments').delete().eq('id', id);
      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }
      res.json({ success: true, message: 'Tugas berhasil dihapus.' });
      return;
    }

    localStore.assignments = localStore.assignments.filter(a => a.id !== id);
    localStore.submissions = localStore.submissions.filter(s => s.assignment_id !== id);
    res.json({ success: true, message: 'Tugas berhasil dihapus.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
