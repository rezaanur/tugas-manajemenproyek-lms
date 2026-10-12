import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLMS } from '../context/LMSContext';
import { quizApi } from '../services/api';
import type { Quiz, QuizAttempt } from '../types';
import { 
  HelpCircle, 
  PlusCircle, 
  Clock, 
  Award, 
  PlayCircle, 
  Trash2, 
  Users,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface KuisViewProps {
  onOpenCreateModal: () => void;
  onStartQuiz: (quiz: Quiz) => void;
}

export const KuisView: React.FC<KuisViewProps> = ({
  onOpenCreateModal,
  onStartQuiz
}) => {
  const { user } = useAuth();
  const { quizzes, refreshAll, showToast } = useLMS();
  const [expandedQuizId, setExpandedQuizId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isDosen = user?.role === 'dosen';

  const toggleExpand = (id: string) => {
    setExpandedQuizId(prev => (prev === id ? null : id));
  };

  const handleDeleteQuiz = async (id: string, title: string) => {
    if (!window.confirm(`Yakin ingin menghapus kuis "${title}"?`)) return;

    setDeletingId(id);
    try {
      await quizApi.delete(id);
      showToast('Kuis berhasil dihapus!', 'success');
      await refreshAll();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal menghapus kuis', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 text-violet-600 text-xs font-bold uppercase tracking-wider mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Bank Soal & Kuis Interaktif</span>
          </div>
          <h1 className="text-lg md:text-xl font-extrabold text-slate-800">
            {isDosen ? 'Manajemen Bank Kuis & Evaluasi' : 'Kuis Interaktif Perkuliahan'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isDosen 
              ? 'Rancang soal pilihan ganda, atur batas waktu dan skor kelulusan, serta pantau hasil nilai mahasiswa.' 
              : 'Uji pemahaman materi Anda dengan timer langsung dan koreksi jawaban secara otomatis.'}
          </p>
        </div>

        {isDosen && (
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Buat Kuis Baru</span>
          </button>
        )}
      </div>

      {/* Quizzes List */}
      {quizzes.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 p-8 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto mb-3">
            <HelpCircle className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Belum ada kuis yang tersedia</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {isDosen 
              ? 'Buat bank soal kuis pertama Anda untuk menguji pemahaman mahasiswa.' 
              : 'Dosen belum mengaktifkan kuis untuk topik perkuliahan saat ini.'}
          </p>

          {isDosen && (
            <button
              onClick={onOpenCreateModal}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Buat Kuis Sekarang</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map(quiz => {
            const courseName = quiz.courseName || quiz.course_name || 'Mata Kuliah';
            const duration = quiz.durationMinutes || quiz.duration_minutes || 15;
            const passing = quiz.passingScore || quiz.passing_score || 70;
            const attempts: QuizAttempt[] = quiz.attempts || [];
            const myAttempt = attempts.find(a => (a.studentId) === user?.id) || quiz.userAttempt;
            const attemptsCount = attempts.length;
            const isExpanded = expandedQuizId === quiz.id;
            const questionsCount = quiz.questions?.length || quiz.questions_count || 0;

            const myScore = myAttempt ? myAttempt.score : null;

            return (
              <div 
                key={quiz.id}
                className="bg-white rounded-3xl border border-slate-100 p-5 md:p-6 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 rounded-lg bg-violet-50 text-violet-700 text-[11px] font-bold">
                      {courseName}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{duration} Menit</span>
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-800 line-clamp-1">{quiz.title}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {quiz.description || 'Kuis pilihan ganda evaluasi topik materi.'}
                  </p>

                  {/* Meta items */}
                  <div className="flex flex-wrap items-center gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1 text-slate-600">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{questionsCount} Soal Pilihan</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600">
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>KKM: {passing}</span>
                    </div>
                    {isDosen && (
                      <div className="flex items-center gap-1 text-slate-600">
                        <Users className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{attemptsCount} Siswa mencoba</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isDosen ? (
                    <>
                      <button
                        onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                        disabled={deletingId === quiz.id}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                        title="Hapus Kuis"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => toggleExpand(quiz.id)}
                        className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <span>Hasil Mahasiswa ({attemptsCount})</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-between gap-2">
                      {myScore !== null ? (
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                            myScore >= passing
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            Nilai: {myScore} ({myScore >= passing ? 'Lulus' : 'Belum Lulus'})
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Belum dikerjakan</span>
                      )}

                      <button
                        onClick={() => onStartQuiz(quiz)}
                        className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold shadow-md shadow-violet-100 transition flex items-center gap-1.5"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>{myScore !== null ? 'Coba Lagi' : 'Mulai Kuis'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Dosen: Expanded Attempts Table */}
                {isDosen && isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Rekap Pengerjaan Mahasiswa
                    </h5>
                    {attemptsCount === 0 ? (
                      <p className="text-xs text-slate-400 py-3 text-center">Belum ada data pengerjaan.</p>
                    ) : (
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {attempts.map((att: QuizAttempt, idx: number) => (
                          <div 
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-800">{att.studentName || 'Mahasiswa'}</span>
                              <div className="text-[10px] text-slate-400">
                                {new Date(att.completedAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-md font-bold ${
                              att.score >= passing 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              Skor: {att.score}
                            </span>
                          </div>
                        ))}
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
