import { Response } from 'express';
import { supabase, isSupabaseConfigured, localStore } from '../config/supabase.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

export const getQuizzes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (isSupabaseConfigured && supabase) {
      const { data: quizzes, error } = await supabase
        .from('quizzes')
        .select('*, quiz_questions(count), quiz_attempts(*)')
        .order('created_at', { ascending: false });

      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }

      const formatted = (quizzes || []).map(q => {
        const userAttempt = (q.quiz_attempts || []).find((att: any) => att.student_id === userId);
        return {
          id: q.id,
          course_id: q.course_id,
          course_name: q.course_name,
          title: q.title,
          duration_minutes: q.duration_minutes,
          questions_count: q.quiz_questions?.[0]?.count || 0,
          created_at: q.created_at,
          userAttempt: userAttempt || null,
          isCompleted: Boolean(userAttempt)
        };
      });

      res.json({ success: true, data: formatted });
      return;
    }

    // Local fallback
    const formatted = localStore.quizzes.map(q => {
      const questions = localStore.quizQuestions.filter(quest => quest.quiz_id === q.id);
      const userAttempt = localStore.quizAttempts.find(att => att.quiz_id === q.id && att.student_id === userId);
      return {
        ...q,
        questions_count: questions.length,
        userAttempt: userAttempt || null,
        isCompleted: Boolean(userAttempt)
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getQuizDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured && supabase) {
      const { data: quiz, error: qErr } = await supabase.from('quizzes').select('*').eq('id', id).single();
      if (qErr || !quiz) {
        res.status(404).json({ success: false, message: 'Kuis tidak ditemukan.' });
        return;
      }

      const { data: questions, error: questErr } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('quiz_id', id)
        .order('sort_order', { ascending: true });

      if (questErr) {
        res.status(500).json({ success: false, message: questErr.message });
        return;
      }

      res.json({ success: true, data: { ...quiz, questions: questions || [] } });
      return;
    }

    // Local fallback
    const quiz = localStore.quizzes.find(q => q.id === id);
    if (!quiz) {
      res.status(404).json({ success: false, message: 'Kuis tidak ditemukan.' });
      return;
    }

    const questions = localStore.quizQuestions.filter(q => q.quiz_id === id);
    res.json({ success: true, data: { ...quiz, questions } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { course_id, course_name, title, duration_minutes, questions } = req.body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      res.status(400).json({ success: false, message: 'Judul kuis dan minimal 1 butir soal wajib diisi.' });
      return;
    }

    const quizId = 'quiz-' + Date.now();
    const newQuiz = {
      id: quizId,
      course_id: course_id || 'crs-1',
      course_name: course_name || 'Mata Kuliah',
      title,
      duration_minutes: Number(duration_minutes) || 5,
      created_by: req.user?.id,
      created_at: new Date().toISOString()
    };

    const newQuestions = questions.map((q: any, idx: number) => ({
      id: 'quest-' + Date.now() + '-' + idx,
      quiz_id: quizId,
      question_text: q.question_text || q.question,
      options: q.options || [],
      correct_index: Number(q.correct_index) || 0,
      explanation: q.explanation || 'Pembahasan materi terverifikasi.',
      sort_order: idx + 1
    }));

    if (isSupabaseConfigured && supabase) {
      const { data: qData, error: qErr } = await supabase.from('quizzes').insert(newQuiz).select().single();
      if (qErr) {
        res.status(500).json({ success: false, message: qErr.message });
        return;
      }

      const { error: questErr } = await supabase.from('quiz_questions').insert(newQuestions);
      if (questErr) {
        res.status(500).json({ success: false, message: questErr.message });
        return;
      }

      res.status(201).json({ success: true, message: 'Kuis baru berhasil dibuat!', data: { ...qData, questions: newQuestions } });
      return;
    }

    // Local fallback
    localStore.quizzes.unshift(newQuiz);
    localStore.quizQuestions.push(...newQuestions);

    res.status(201).json({ success: true, message: 'Kuis baru berhasil dibuat!', data: { ...newQuiz, questions: newQuestions } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const submitQuizAttempt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quiz_id, user_answers } = req.body;
    const studentId = req.user?.id || 'mhs-1';
    const studentName = req.user?.fullName || 'Budi Pratama';

    if (!quiz_id) {
      res.status(400).json({ success: false, message: 'ID Kuis tidak valid.' });
      return;
    }

    let questions: any[] = [];

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase.from('quiz_questions').select('*').eq('quiz_id', quiz_id);
      questions = data || [];
    } else {
      questions = localStore.quizQuestions.filter(q => q.quiz_id === quiz_id);
    }

    if (questions.length === 0) {
      res.status(400).json({ success: false, message: 'Soal kuis tidak ditemukan.' });
      return;
    }

    // Evaluate answers
    let correctCount = 0;
    questions.forEach(q => {
      const chosen = user_answers?.[q.id];
      if (chosen === q.correct_index) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);

    const attemptData = {
      id: 'att-' + Date.now(),
      quiz_id,
      student_id: studentId,
      student_name: studentName,
      score,
      user_answers: user_answers || {},
      completed_at: new Date().toISOString()
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('quiz_attempts').insert(attemptData).select().single();
      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }
      res.json({ success: true, message: 'Kuis selesai! Skor berhasil dihitung.', score, correctCount, totalQuestions: questions.length, data });
      return;
    }

    // Local fallback
    localStore.quizAttempts = localStore.quizAttempts.filter(a => !(a.quiz_id === quiz_id && a.student_id === studentId));
    localStore.quizAttempts.unshift(attemptData);

    res.json({ success: true, message: 'Kuis selesai! Skor berhasil dihitung.', score, correctCount, totalQuestions: questions.length, data: attemptData });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('quizzes').delete().eq('id', id);
      if (error) {
        res.status(500).json({ success: false, message: error.message });
        return;
      }
      res.json({ success: true, message: 'Kuis berhasil dihapus.' });
      return;
    }

    localStore.quizzes = localStore.quizzes.filter(q => q.id !== id);
    localStore.quizQuestions = localStore.quizQuestions.filter(quest => quest.quiz_id !== id);
    localStore.quizAttempts = localStore.quizAttempts.filter(att => att.quiz_id !== id);
    res.json({ success: true, message: 'Kuis berhasil dihapus.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
