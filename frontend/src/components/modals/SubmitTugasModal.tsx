import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useLMS } from '../../context/LMSContext';
import { assignmentApi } from '../../services/api';
import type { Assignment } from '../../types';
import { Upload } from 'lucide-react';

interface SubmitTugasModalProps {
  assignment: Assignment | null;
  onClose: () => void;
  isOpen?: boolean;
}

export const SubmitTugasModal: React.FC<SubmitTugasModalProps> = ({ assignment, onClose }) => {
  const { showToast, refreshAll } = useLMS();
  const [fileName, setFileName] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!assignment) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await assignmentApi.submit({
        assignment_id: assignment.id,
        file_name: fileName || 'Jawaban_Tugas_Mahasiswa.pdf',
        notes
      });

      showToast('Jawaban tugas berhasil dikirimkan ke dosen!');
      onClose();
      refreshAll();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const courseName = assignment.courseName || assignment.course_name || 'Mata Kuliah';

  return (
    <Modal
      isOpen={Boolean(assignment)}
      onClose={onClose}
      title="Kumpulkan Jawaban Tugas"
      subtitle={courseName}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
          <span className="font-bold text-slate-800 block mb-1">Instruksi Tugas:</span>
          <p>{assignment.description}</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Berkas Jawaban (PDF / ZIP / Dokumen)</label>
          <div className="p-4 border-2 border-dashed border-slate-200 rounded-2xl text-center hover:bg-slate-50 transition cursor-pointer">
            <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
            <input 
              type="file" 
              onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700"
            />
            {fileName && (
              <p className="mt-2 text-xs font-semibold text-emerald-600">
                Berkas siap diunggah: {fileName}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Tambahan untuk Dosen (Opsional)</label>
          <textarea 
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tuliskan catatan atau keterangan pengerjaan..."
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
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
          >
            {loading ? 'Mengirimkan...' : 'Kirimkan Jawaban'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
