import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLMS } from '../context/LMSContext';
import { gradeApi } from '../services/api';
import type { Grade } from '../types';
import { 
  Award, 
  PlusCircle, 
  Printer, 
  Trash2, 
  Edit3, 
  GraduationCap 
} from 'lucide-react';

interface NilaiViewProps {
  onOpenCreateModal: (gradeToEdit?: Grade) => void;
}

export const NilaiView: React.FC<NilaiViewProps> = ({ onOpenCreateModal }) => {
  const { user } = useAuth();
  const { grades, refreshAll, showToast } = useLMS();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isDosen = user?.role === 'dosen';

  const handleDeleteGrade = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus nilai untuk ${name}?`)) return;

    setDeletingId(id);
    try {
      await gradeApi.delete(id);
      showToast('Nilai berhasil dihapus!', 'success');
      await refreshAll();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus nilai', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter grades for Mahasiswa vs Dosen
  const studentGrades = grades.filter(g => (g.studentId || g.student_id) === user?.id);

  // Calculate GPA / IPK for student
  const letterToGpa = (letter?: string) => {
    switch (letter) {
      case 'A': return 4.0;
      case 'B+': return 3.5;
      case 'B': return 3.0;
      case 'C': return 2.0;
      case 'D': return 1.0;
      default: return 0.0;
    }
  };

  const calculatedGpa = studentGrades.length > 0
    ? (studentGrades.reduce((acc, curr) => {
        const letter = curr.letterGrade || curr.grade_letter || 'A';
        return acc + letterToGpa(letter);
      }, 0) / studentGrades.length).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-6">
      {/* Header Banner (Hidden during print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            <span>Sistem Penilaian Akademik</span>
          </div>
          <h1 className="text-lg md:text-xl font-extrabold text-slate-800">
            {isDosen ? 'Buku Nilai & Evaluasi Mahasiswa' : 'Transkrip Nilai & Capaian Belajar'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isDosen 
              ? 'Kelola rekapitulasi nilai tugas, kuis, dan absensi menjadi nilai akhir berbobot.' 
              : 'Pantau nilai akhir per mata kuliah, konversi huruf mutu, dan cetak transkrip resmi.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {isDosen && (
            <button
              onClick={() => onOpenCreateModal()}
              className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Input Nilai Baru</span>
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Transkrip</span>
          </button>
        </div>
      </div>

      {isDosen ? (
        /* DOSEN GRADEBOOK VIEW */
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Tabel Rekapitulasi Buku Nilai Dosen</h2>
              <p className="text-xs text-slate-400">Total {grades.length} entri nilai mahasiswa terdaftar</p>
            </div>
            <div className="text-xs text-slate-400 italic">
              Formula: (Tugas 30%) + (Kuis 30%) + (Presensi 20%) + (Evaluasi 20%)
            </div>
          </div>

          {grades.length === 0 ? (
            <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-500">Buku nilai masih kosong.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Mulai input nilai mahasiswa untuk mata kuliah yang Anda ampu.</p>
              <button
                onClick={() => onOpenCreateModal()}
                className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Input Nilai Sekarang</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th className="pb-3">Mahasiswa</th>
                    <th className="pb-3">Mata Kuliah</th>
                    <th className="pb-3 text-center">Tugas (30%)</th>
                    <th className="pb-3 text-center">Kuis (30%)</th>
                    <th className="pb-3 text-center">Presensi (20%)</th>
                    <th className="pb-3 text-center">Nilai Akhir</th>
                    <th className="pb-3 text-center">Huruf</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grades.map(grd => {
                    const studentName = grd.studentName || grd.student_name || 'Mahasiswa';
                    const studentNim = grd.studentNim || grd.student_nim || '-';
                    const courseName = grd.courseName || grd.course_name || 'Mata Kuliah';
                    const tugas = grd.tugasScore ?? grd.tugas_score ?? '-';
                    const kuis = grd.kuisScore ?? grd.kuis_score ?? '-';
                    const presensi = grd.attendanceScore ?? grd.attendance_score ?? '-';
                    const finalGrd = grd.finalGrade ?? grd.final_score ?? 0;
                    const letter = grd.letterGrade || grd.grade_letter || 'A';
                    const statusText = grd.status || (finalGrd >= 70 ? 'LULUS' : 'REMEDIAL');
                    const isPassed = statusText === 'LULUS' || statusText === 'Tuntas';

                    return (
                      <tr key={grd.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5">
                          <div className="font-bold text-slate-800">{studentName}</div>
                          <div className="text-[11px] text-slate-400">NIM: {studentNim}</div>
                        </td>
                        <td className="py-3.5 font-semibold text-slate-700">
                          {courseName}
                        </td>
                        <td className="py-3.5 text-center font-medium text-slate-600">
                          {tugas}
                        </td>
                        <td className="py-3.5 text-center font-medium text-slate-600">
                          {kuis}
                        </td>
                        <td className="py-3.5 text-center font-medium text-slate-600">
                          {presensi}
                        </td>
                        <td className="py-3.5 text-center">
                          <span className="text-sm font-black text-indigo-700">
                            {finalGrd}
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-md font-bold bg-indigo-50 text-indigo-800">
                            {letter}
                          </span>
                        </td>
                        <td className="py-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPassed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {statusText}
                          </span>
                        </td>
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => onOpenCreateModal(grd)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition"
                              title="Edit Nilai"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteGrade(grd.id, studentName)}
                              disabled={deletingId === grd.id}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                              title="Hapus Nilai"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* MAHASISWA TRANSCRIPT VIEW (PRINT READY) */
        <div className="bg-white p-6 md:p-10 rounded-3xl border border-slate-200/80 shadow-md">
          {/* Official Campus Transcript Header */}
          <div className="border-b-2 border-slate-800 pb-5 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-900 text-white flex items-center justify-center font-black shadow-md">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
                  KEMENTERIAN PENDIDIKAN TINGGI & TEKNOLOGI
                </h2>
                <h3 className="text-sm font-bold text-slate-800">
                  UNIVERSITAS TEKNOLOGI DIGITAL INDONESIA
                </h3>
                <p className="text-xs text-slate-500">
                  Fakultas Ilmu Komputer - Sistem Informasi Akademik (EduSmart LMS)
                </p>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
                Transkrip Nilai Resmi
              </span>
              <p className="text-[11px] text-slate-400 mt-1">Dicetak pada: {new Date().toLocaleDateString('id-ID')}</p>
            </div>
          </div>

          {/* Student Bio Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs mb-6">
            <div>
              <span className="text-slate-400 font-medium">Nama Mahasiswa:</span>
              <div className="font-bold text-slate-800">{user?.fullName || 'Budi Pratama'}</div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Nomor Induk (NIM):</span>
              <div className="font-bold text-slate-800">{user?.nimNip || '2024001'}</div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Program Studi:</span>
              <div className="font-bold text-slate-800">{user?.department || 'Teknik Informatika'}</div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Indeks Prestasi Kumulatif (IPK):</span>
              <div className="text-sm font-extrabold text-indigo-700">{calculatedGpa} / 4.00</div>
            </div>
          </div>

          {/* Grades Table */}
          {studentGrades.length === 0 ? (
            <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-500">Belum ada nilai yang diterbitkan dosen untuk Anda.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Nilai akan otomatis muncul di sini setelah dosen merekap tugas & kuis.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-200 text-slate-700 font-bold bg-slate-50">
                    <th className="py-3 px-3">No</th>
                    <th className="py-3 px-3">Mata Kuliah</th>
                    <th className="py-3 px-3 text-center">Tugas (30%)</th>
                    <th className="py-3 px-3 text-center">Kuis (30%)</th>
                    <th className="py-3 px-3 text-center">Presensi (20%)</th>
                    <th className="py-3 px-3 text-center">Nilai Angka</th>
                    <th className="py-3 px-3 text-center">Huruf Mutu</th>
                    <th className="py-3 px-3 text-center">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentGrades.map((grd, idx) => {
                    const courseName = grd.courseName || grd.course_name || 'Mata Kuliah';
                    const tugas = grd.tugasScore ?? grd.tugas_score ?? '-';
                    const kuis = grd.kuisScore ?? grd.kuis_score ?? '-';
                    const presensi = grd.attendanceScore ?? grd.attendance_score ?? '-';
                    const finalGrd = grd.finalGrade ?? grd.final_score ?? 0;
                    const letter = grd.letterGrade || grd.grade_letter || 'A';
                    const statusText = grd.status || (finalGrd >= 70 ? 'LULUS' : 'REMEDIAL');
                    const isPassed = statusText === 'LULUS' || statusText === 'Tuntas';

                    return (
                      <tr key={grd.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3 font-semibold text-slate-400">{idx + 1}</td>
                        <td className="py-3 px-3 font-bold text-slate-800">{courseName}</td>
                        <td className="py-3 px-3 text-center text-slate-600">{tugas}</td>
                        <td className="py-3 px-3 text-center text-slate-600">{kuis}</td>
                        <td className="py-3 px-3 text-center text-slate-600">{presensi}</td>
                        <td className="py-3 px-3 text-center font-extrabold text-indigo-700">{finalGrd}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900">{letter}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPassed ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                          }`}>
                            {statusText}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Academic Signature Section for Print */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex justify-between text-xs text-slate-600">
            <div>
              <p>Mengetahui,</p>
              <p className="font-bold text-slate-800 mt-0.5">Ketua Program Studi</p>
              <div className="h-16"></div>
              <p className="font-bold underline text-slate-800">Dr. Ir. Hendra Gunawan, M.T.</p>
              <p className="text-[11px] text-slate-400">NIP: 198005122005011002</p>
            </div>

            <div className="text-right">
              <p>Yogyakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-bold text-slate-800 mt-0.5">Dosen Pembimbing Akademik</p>
              <div className="h-16"></div>
              <p className="font-bold underline text-slate-800">Dr. Siti Rahmawati, M.Kom.</p>
              <p className="text-[11px] text-slate-400">NIP: 198501152010122001</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
