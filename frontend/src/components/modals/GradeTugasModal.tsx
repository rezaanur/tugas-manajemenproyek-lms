import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useLMS } from '../../context/LMSContext';
import { assignmentApi } from '../../services/api';
import type { Assignment, Submission } from '../../types';

interface GradeTugasModalProps {
  assignment: Assignment | null;
  submission: Submission | null;
  onClose: () => void;
  isOpen?: boolean;
}

export const GradeTugasModal: React.FC<GradeTugasModalProps> = ({ 
  assignment, 
  submission, 
  onClose 
}) => {
  const { showToast, refreshAll } = useLMS();
  const [score, setScore] = useState<number | string>(submission?.score ?? submission?.grade ?? 85);
  const [feedback, setFeedback] = useState(submission?.feedback ?? '');
  const [loading, setLoading] = useState(false);

  if (!assignment || !submission) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numScore = Number(score);
    if (isNaN(numScore) || numScore < 0 || numScore > 100) {
      showToast('Masukkan nilai yang valid (0 - 100)!', 'error');
      return;
    }

    setLoading(true);
    try {
      await assignmentApi.grade({
        submission_id: submission.id,
        assignment_id: assignment.id,
        student_id: submission.student_id || submission.studentId || '',
        score: numScore,
        feedback
      });

      showToast(`Nilai ${numScore} berhasil disimpan!`);
      onClose();
      refreshAll();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const studentName = submission.student_name || submission.studentName || 'Mahasiswa';
  const fileName = submission.file_name || 'Dokumen_Tugas.pdf';

  return (
    <Modal
      isOpen={Boolean(assignment && submission)}
      onClose={onClose}
      title="Evaluasi & Beri Nilai Tugas"
      subtitle={`Mahasiswa: ${studentName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <span className="text-xs font-semibold text-slate-500 block mb-1">Judul Tugas</span>
          <p className="text-xs font-bold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            {assignment.title}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block mb-0.5">Berkas Mahasiswa:</span>
            <span className="font-bold text-slate-700 truncate block">{fileName}</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400 block mb-0.5">Catatan Mahasiswa:</span>
            <span className="font-semibold text-slate-700 truncate block">{submission.notes || '-'}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Input Nilai (Skala 0 - 100)</label>
          <input 
            type="number"
            min={0}
            max={100}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-indigo-700"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Evaluasi / Masukan Dosen</label>
          <textarea 
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tuliskan masukan peningkatan untuk mahasiswa..."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
          />
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
            className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan Nilai'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
