import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLMS } from '../context/LMSContext';
import { assignmentApi } from '../services/api';
import type { Assignment, Submission } from '../types';
import { 
  CheckSquare, 
  PlusCircle, 
  Award, 
  Clock, 
  FileCheck, 
  Trash2, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';

interface TugasViewProps {
  onOpenCreateModal: () => void;
  onOpenSubmitModal: (assignment: Assignment) => void;
  onOpenGradeModal: (assignment: Assignment, submission: Submission) => void;
}

export const TugasView: React.FC<TugasViewProps> = ({
  onOpenCreateModal,
  onOpenSubmitModal,
  onOpenGradeModal
}) => {
  const { user } = useAuth();
  const { assignments, refreshAll, showToast } = useLMS();
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'SUBMITTED' | 'GRADED'>('ALL');
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isDosen = user?.role === 'dosen';

  const toggleExpand = (id: string) => {
    setExpandedAssignmentId(prev => (prev === id ? null : id));
  };

  const handleDeleteAssignment = async (id: string, title: string) => {
    if (!window.confirm(`Yakin ingin menghapus tugas "${title}"? Seluruh pengumpulan mahasiswa untuk tugas ini juga akan terhapus.`)) return;

    setDeletingId(id);
    try {
      await assignmentApi.delete(id);
      showToast('Tugas berhasil dihapus!', 'success');
      await refreshAll();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus tugas', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const getSubmissionsList = (assign: Assignment): Submission[] => {
    return assign.submissions || assign.allSubmissions || [];
  };

  const filteredAssignments = assignments.filter(assign => {
    if (isDosen) return true;

    const subs = getSubmissionsList(assign);
    const mySub = subs.find(s => (s.studentId || s.student_id) === user?.id);
    const scoreVal = mySub ? (mySub.grade !== undefined ? mySub.grade : mySub.score) : null;

    if (filterTab === 'PENDING') return !mySub;
    if (filterTab === 'SUBMITTED') return !!mySub && (scoreVal === null || scoreVal === undefined);
    if (filterTab === 'GRADED') return !!mySub && scoreVal !== null && scoreVal !== undefined;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Manajemen Tugas Kuliah</span>
          </div>
          <h1 className="text-lg md:text-xl font-extrabold text-slate-800">
            {isDosen ? 'Evaluasi & Penilaian Tugas Mahasiswa' : 'Daftar Tugas & Pengumpulan'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isDosen 
              ? 'Terbitkan penugasan, tinjau berkas yang dikumpulkan, serta beri skor dan umpan balik edukatif.' 
              : 'Pantau tenggat waktu, serahkan berkas pekerjaan Anda, dan periksa nilai dari dosen.'}
          </p>
        </div>

        {isDosen && (
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Tugas Baru</span>
          </button>
        )}
      </div>

      {/* Filter Tabs for Mahasiswa */}
      {!isDosen && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterTab === 'ALL'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            Semua Tugas ({assignments.length})
          </button>
          <button
            onClick={() => setFilterTab('PENDING')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterTab === 'PENDING'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            Belum Dikerjakan
          </button>
          <button
            onClick={() => setFilterTab('SUBMITTED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterTab === 'SUBMITTED'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            Menunggu Penilaian
          </button>
          <button
            onClick={() => setFilterTab('GRADED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              filterTab === 'GRADED'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            Selesai Dinilai
          </button>
        </div>
      )}

      {/* Assignments List */}
      {filteredAssignments.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <CheckSquare className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Tidak ada tugas pada filter ini</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {isDosen 
              ? 'Belum ada tugas kuliah yang dibuat. Mulai buat penugasan baru untuk mahasiswa.' 
              : 'Anda telah menyelesaikan seluruh tugas atau belum ada tugas aktif saat ini.'}
          </p>

          {isDosen && (
            <button
              onClick={onOpenCreateModal}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Tugas Baru Sekarang</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments.map(assign => {
            const subs = getSubmissionsList(assign);
            const mySub = subs.find(s => (s.studentId || s.student_id) === user?.id);
            const submissionsCount = subs.length;
            const unreviewedCount = subs.filter(s => {
              const score = s.grade !== undefined ? s.grade : s.score;
              return score === undefined || score === null;
            }).length;
            const isExpanded = expandedAssignmentId === assign.id;
            const maxPts = assign.maxPoints || assign.max_points || 100;
            const courseName = assign.courseName || assign.course_name || 'Mata Kuliah';
            const dueDate = assign.dueDate || assign.deadline || 'Tanpa Batas';

            const myScore = mySub ? (mySub.grade !== undefined ? mySub.grade : mySub.score) : null;

            return (
              <div 
                key={assign.id}
                className="bg-white rounded-3xl border border-slate-100 p-5 md:p-6 shadow-2xs transition"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold">
                        {courseName}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded-lg">
                        <Clock className="w-3 h-3" />
                        Tenggat: {dueDate}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-lg">
                        <Award className="w-3 h-3" />
                        Maks {maxPts} Poin
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-800">{assign.title}</h3>
                    <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{assign.description}</p>
                  </div>

                  {/* Actions / Status Right Side */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 pt-2 sm:pt-0">
                    {isDosen ? (
                      <>
                        <button
                          onClick={() => handleDeleteAssignment(assign.id, assign.title)}
                          disabled={deletingId === assign.id}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                          title="Hapus Tugas"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleExpand(assign.id)}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                        >
                          <span>Pengumpulan ({submissionsCount})</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </>
                    ) : (
                      <div>
                        {mySub ? (
                          <div className="text-right">
                            {myScore !== undefined && myScore !== null ? (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                                <FileCheck className="w-4 h-4" />
                                <span>Nilai: {myScore} / {maxPts}</span>
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                                <Clock className="w-4 h-4" />
                                <span>Terkumpul (Menunggu Koreksi)</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => onOpenSubmitModal(assign)}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition flex items-center gap-2"
                          >
                            <FileCheck className="w-4 h-4" />
                            <span>Kumpulkan Tugas</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mahasiswa: Submitted Details */}
                {!isDosen && mySub && (
                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-700">Pekerjaan yang Anda serahkan:</span>
                        <div className="text-slate-500 mt-1 italic">"{mySub.notes || 'Tidak ada catatan tambahan'}"</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(mySub.fileUrl || mySub.file_url) && (
                          <a
                            href={mySub.fileUrl || mySub.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 text-indigo-600 font-bold transition flex items-center gap-1.5"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Lihat Berkas Anda</span>
                          </a>
                        )}
                        <button
                          onClick={() => onOpenSubmitModal(assign)}
                          className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 font-bold transition"
                        >
                          Ubah Pengumpulan
                        </button>
                      </div>
                    </div>

                    {/* Feedback if available */}
                    {mySub.feedback && (
                      <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-start gap-2 text-xs">
                        <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-emerald-800">Catatan & Ulasan Dosen:</span>
                          <p className="text-slate-600 mt-0.5">{mySub.feedback}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Dosen: Expanded Submissions Table */}
                {isDosen && isExpanded && (
                  <div className="mt-5 pt-5 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Daftar Pengumpulan Mahasiswa ({submissionsCount})
                      </h4>
                      {unreviewedCount > 0 && (
                        <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                          {unreviewedCount} belum dinilai
                        </span>
                      )}
                    </div>

                    {submissionsCount === 0 ? (
                      <div className="py-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400">Belum ada mahasiswa yang mengumpulkan tugas ini.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                              <th className="pb-2.5">Mahasiswa</th>
                              <th className="pb-2.5">Waktu Pengumpulan</th>
                              <th className="pb-2.5">Lampiran & Catatan</th>
                              <th className="pb-2.5">Nilai</th>
                              <th className="pb-2.5 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {subs.map(sub => {
                              const studentName = sub.studentName || sub.student_name || 'Mahasiswa';
                              const studentNim = sub.studentNim || sub.student_nim || '-';
                              const submitTime = sub.submittedAt || sub.submitted_at || new Date().toISOString();
                              const fileLink = sub.fileUrl || sub.file_url;
                              const scoreVal = sub.grade !== undefined ? sub.grade : sub.score;

                              return (
                                <tr key={sub.id} className="hover:bg-slate-50/50 transition">
                                  <td className="py-3">
                                    <div className="font-bold text-slate-800">{studentName}</div>
                                    <div className="text-[11px] text-slate-400">NIM: {studentNim}</div>
                                  </td>
                                  <td className="py-3 text-slate-500">
                                    {new Date(submitTime).toLocaleDateString('id-ID', {
                                      day: 'numeric',
                                      month: 'short',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </td>
                                  <td className="py-3">
                                    <div className="flex flex-col gap-1">
                                      {fileLink && (
                                        <a
                                          href={fileLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-bold"
                                        >
                                          <ExternalLink className="w-3 h-3" />
                                          <span>Buka Dokumen</span>
                                        </a>
                                      )}
                                      {sub.notes && (
                                        <span className="text-[11px] text-slate-400 line-clamp-1 italic">
                                          "{sub.notes}"
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    {scoreVal !== undefined && scoreVal !== null ? (
                                      <div>
                                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                                          {scoreVal} / {maxPts}
                                        </span>
                                        {sub.feedback && (
                                          <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                            "{sub.feedback}"
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                                        Belum Dinilai
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 text-right">
                                    <button
                                      onClick={() => onOpenGradeModal(assign, sub)}
                                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition"
                                    >
                                      {scoreVal !== undefined && scoreVal !== null ? 'Edit Nilai' : 'Beri Nilai'}
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
