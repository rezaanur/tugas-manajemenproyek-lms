import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useLMS } from '../../context/LMSContext';
import { materialApi } from '../../services/api';

interface MateriModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MateriModal: React.FC<MateriModalProps> = ({ isOpen, onClose }) => {
  const { courses, showToast, refreshAll } = useLMS();
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'PDF' | 'VIDEO' | 'SLIDE'>('PDF');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      showToast('Judul dan deskripsi materi wajib diisi!', 'error');
      return;
    }

    setLoading(true);
    try {
      const selectedCourse = courses.find(c => c.id === courseId);
      await materialApi.create({
        course_id: courseId || courses[0]?.id || 'crs-1',
        course_name: selectedCourse?.name || 'Mata Kuliah',
        title,
        type,
        description,
        file_url: '#'
      });

      showToast('Bahan ajar berhasil diunggah!');
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
      title="Upload Bahan Ajar Baru"
      subtitle="Publikasikan modul, slide, atau video materi untuk mahasiswa"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Mata Kuliah</label>
          <select 
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500"
          >
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Tipe Bahan Ajar</label>
          <select 
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
          >
            <option value="PDF">Dokumen Digital (PDF)</option>
            <option value="VIDEO">Video Pembelajaran (MP4 / YouTube)</option>
            <option value="SLIDE">Slide Presentasi (PPTX)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Judul Materi</label>
          <input 
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Contoh: Modul 1: Manajemen Proyek Perangkat Lunak"
            required
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Deskripsi & Pokok Bahasan</label>
          <textarea 
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tuliskan ringkasan materi atau petunjuk pengerjaan..."
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
            {loading ? 'Menyimpan...' : 'Publikasikan Materi'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
