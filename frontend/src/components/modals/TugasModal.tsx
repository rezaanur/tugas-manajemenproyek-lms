import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useLMS } from '../../context/LMSContext';
import { assignmentApi } from '../../services/api';

interface TugasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TugasModal: React.FC<TugasModalProps> = ({ isOpen, onClose }) => {
  const { courses, showToast, refreshAll } = useLMS();
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !deadline) {
      showToast('Judul dan batas waktu wajib diisi!', 'error');
      return;
    }

    setLoading(true);
    try {
      const selectedCourse = courses.find(c => c.id === courseId);
      await assignmentApi.create({
        course_id: courseId || courses[0]?.id || 'crs-1',
        course_name: selectedCourse?.name || 'Mata Kuliah',
        title,
        deadline,
        description
      });

      showToast('Tugas baru berhasil diterbitkan untuk mahasiswa!');
      onClose();
      refreshAll();
      setTitle('');
      setDescription('');
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
      title="Buat Penugasan Kuliah Baru"
      subtitle="Terbitkan instruksi tugas mandiri atau kelompok untuk mahasiswa"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Tugas</label>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Tugas 1: Membuat Work Breakdown Structure (WBS)"
            required
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Batas Waktu Pengumpulan (Deadline)</label>
          <input 
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Petunjuk & Instruksi Pengerjaan</label>
          <textarea 
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tuliskan format file jawaban dan ketentuan penilaian..."
            required
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
            {loading ? 'Menerbitkan...' : 'Terbitkan Tugas'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
