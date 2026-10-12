import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useLMS } from '../../context/LMSContext';
import { quizApi } from '../../services/api';

interface KuisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KuisModal: React.FC<KuisModalProps> = ({ isOpen, onClose }) => {
  const { courses, showToast, refreshAll } = useLMS();
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(5);

  // Question 1
  const [q1Text, setQ1Text] = useState('');
  const [q1OptA, setQ1OptA] = useState('');
  const [q1OptB, setQ1OptB] = useState('');
  const [q1OptC, setQ1OptC] = useState('');
  const [q1OptD, setQ1OptD] = useState('');
  const [q1Correct, setQ1Correct] = useState(0);
  const [q1Exp, setQ1Exp] = useState('');

  // Question 2
  const [q2Text, setQ2Text] = useState('');
  const [q2OptA, setQ2OptA] = useState('');
  const [q2OptB, setQ2OptB] = useState('');
  const [q2OptC, setQ2OptC] = useState('');
  const [q2OptD, setQ2OptD] = useState('');
  const [q2Correct, setQ2Correct] = useState(0);
  const [q2Exp, setQ2Exp] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !q1Text || !q1OptA || !q1OptB) {
      showToast('Judul kuis dan pertanyaan pertama wajib dilengkapi!', 'error');
      return;
    }

    const questions: any[] = [
      {
        question_text: q1Text,
        options: [q1OptA, q1OptB, q1OptC || 'Pilihan C', q1OptD || 'Pilihan D'],
        correct_index: Number(q1Correct),
        explanation: q1Exp || 'Kunci jawaban terverifikasi oleh dosen.'
      }
    ];

    if (q2Text && q2OptA && q2OptB) {
      questions.push({
        question_text: q2Text,
        options: [q2OptA, q2OptB, q2OptC || 'Pilihan C', q2OptD || 'Pilihan D'],
        correct_index: Number(q2Correct),
        explanation: q2Exp || 'Kunci jawaban terverifikasi oleh dosen.'
      });
    }

    setLoading(true);
    try {
      const selectedCourse = courses.find(c => c.id === courseId);
      await quizApi.create({
        course_id: courseId || courses[0]?.id || 'crs-1',
        course_name: selectedCourse?.name || 'Mata Kuliah',
        title,
        duration_minutes: duration,
        questions
      });

      showToast('Kuis baru berhasil diterbitkan untuk mahasiswa!');
      onClose();
      refreshAll();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rancang Kuis Pilihan Ganda Baru"
      subtitle="Susun butir pertanyaan, opsi pilihan, dan kunci jawaban"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Kuliah</label>
            <select 
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Durasi Kuis (Menit)</label>
            <input 
              type="number"
              min={1}
              max={60}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Kuis</label>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Kuis 1: Metodologi Manajemen Proyek"
            required
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
          />
        </div>

        {/* Soal 1 */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Pertanyaan #1</span>
          <input 
            type="text"
            value={q1Text}
            onChange={(e) => setQ1Text(e.target.value)}
            placeholder="Tuliskan pertanyaan nomor 1..."
            required
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
          />
          <div className="grid grid-cols-2 gap-2 text-xs">
            <input 
              type="text" 
              value={q1OptA} 
              onChange={(e) => setQ1OptA(e.target.value)} 
              placeholder="Pilihan A" 
              required 
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white" 
            />
            <input 
              type="text" 
              value={q1OptB} 
              onChange={(e) => setQ1OptB(e.target.value)} 
              placeholder="Pilihan B" 
              required 
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white" 
            />
            <input 
              type="text" 
              value={q1OptC} 
              onChange={(e) => setQ1OptC(e.target.value)} 
              placeholder="Pilihan C" 
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white" 
            />
            <input 
              type="text" 
              value={q1OptD} 
              onChange={(e) => setQ1OptD(e.target.value)} 
              placeholder="Pilihan D" 
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white" 
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kunci Jawaban Benar</label>
              <select 
                value={q1Correct}
                onChange={(e) => setQ1Correct(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value={0}>Pilihan A</option>
                <option value={1}>Pilihan B</option>
                <option value={2}>Pilihan C</option>
                <option value={3}>Pilihan D</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pembahasan Singkat</label>
              <input 
                type="text"
                value={q1Exp}
                onChange={(e) => setQ1Exp(e.target.value)}
                placeholder="Alasan jawaban benar..."
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
          </div>
        </div>

        {/* Soal 2 */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">Pertanyaan #2 (Opsional)</span>
          <input 
            type="text"
            value={q2Text}
            onChange={(e) => setQ2Text(e.target.value)}
            placeholder="Tuliskan pertanyaan nomor 2 (opsional)..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
          />
          <div className="grid grid-cols-2 gap-2 text-xs">
            <input 
              type="text" 
              value={q2OptA} 
              onChange={(e) => setQ2OptA(e.target.value)} 
              placeholder="Pilihan A" 
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white" 
            />
            <input 
              type="text" 
              value={q2OptB} 
              onChange={(e) => setQ2OptB(e.target.value)} 
              placeholder="Pilihan B" 
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white" 
            />
            <input 
              type="text" 
              value={q2OptC} 
              onChange={(e) => setQ2OptC(e.target.value)} 
              placeholder="Pilihan C" 
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white" 
            />
            <input 
              type="text" 
              value={q2OptD} 
              onChange={(e) => setQ2OptD(e.target.value)} 
              placeholder="Pilihan D" 
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white" 
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Kunci Jawaban Benar</label>
              <select 
                value={q2Correct}
                onChange={(e) => setQ2Correct(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value={0}>Pilihan A</option>
                <option value={1}>Pilihan B</option>
                <option value={2}>Pilihan C</option>
                <option value={3}>Pilihan D</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Pembahasan Singkat</label>
              <input 
                type="text"
                value={q2Exp}
                onChange={(e) => setQ2Exp(e.target.value)}
                placeholder="Alasan jawaban benar..."
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
          >
            Batal
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
          >
            {loading ? 'Menerbitkan...' : 'Terbitkan Kuis'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
