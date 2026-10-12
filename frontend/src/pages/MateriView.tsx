import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLMS } from '../context/LMSContext';
import { materialApi } from '../services/api';
import { 
  BookOpen, 
  PlusCircle, 
  Search, 
  Download, 
  Trash2, 
  Calendar, 
  User 
} from 'lucide-react';

interface MateriViewProps {
  onOpenCreateModal: () => void;
}

export const MateriView: React.FC<MateriViewProps> = ({ onOpenCreateModal }) => {
  const { user } = useAuth();
  const { materials, courses, refreshAll, showToast } = useLMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isDosen = user?.role === 'dosen';

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = (m.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (m.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const courseId = m.courseId || m.course_id;
    const matchesCourse = selectedCourse === 'ALL' || courseId === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Yakin ingin menghapus materi "${title}"?`)) return;

    setDeletingId(id);
    try {
      await materialApi.delete(id);
      showToast('Materi berhasil dihapus!', 'success');
      await refreshAll();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus materi', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Bank Materi Pembelajaran</span>
          </div>
          <h1 className="text-lg md:text-xl font-extrabold text-slate-800">
            {isDosen ? 'Manajemen Bahan Ajar & Modul' : 'Daftar Materi Perkuliahan'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isDosen 
              ? 'Unggah dan atur silabus, materi presentasi, dan dokumen ajar untuk mahasiswa.' 
              : 'Akses dan unduh materi kuliah yang telah disediakan oleh dosen pengampu.'}
          </p>
        </div>

        {isDosen && (
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Materi Baru</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari materi kuliah, topik, atau kata kunci..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition"
          />
        </div>

        <select
          value={selectedCourse}
          onChange={e => setSelectedCourse(e.target.value)}
          className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs transition"
        >
          <option value="ALL">Semua Mata Kuliah ({materials.length})</option>
          {courses.map(crs => (
            <option key={crs.id} value={crs.id}>{crs.name}</option>
          ))}
        </select>
      </div>

      {/* Material Grid / List */}
      {filteredMaterials.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Tidak ada materi pembelajaran</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || selectedCourse !== 'ALL'
              ? 'Tidak ada materi yang sesuai dengan kriteria pencarian Anda.'
              : isDosen 
                ? 'Mulai mengunggah bahan kuliah, modul ajar, atau slide presentasi pertama Anda.' 
                : 'Dosen belum mengunggah materi perkuliahan untuk semester ini.'}
          </p>

          {isDosen && (
            <button
              onClick={onOpenCreateModal}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Unggah Materi Sekarang</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map(mat => {
            const courseName = mat.courseName || mat.course_name || 'Mata Kuliah';
            const createdAt = mat.createdAt || mat.created_at || new Date().toISOString();
            const fileUrl = mat.fileUrl || mat.file_url;
            const author = mat.uploadedBy || mat.author_name || 'Dosen Pengampu';

            return (
              <div 
                key={mat.id}
                className="bg-white rounded-3xl border border-slate-100 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-[11px] font-bold truncate max-w-[200px]">
                      {courseName}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-extrabold text-slate-800 group-hover:text-indigo-600 transition line-clamp-2">
                    {mat.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {mat.description || 'Tidak ada deskripsi tambahan.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 min-w-0">
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{author}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isDosen && (
                      <button
                        onClick={() => handleDelete(mat.id, mat.title)}
                        disabled={deletingId === mat.id}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Hapus Materi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    {fileUrl ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Buka File</span>
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Tanpa lampiran</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
