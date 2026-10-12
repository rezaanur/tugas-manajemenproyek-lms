import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLMS } from '../context/LMSContext';
import { 
  BookOpen, 
  CheckSquare, 
  HelpCircle, 
  CalendarCheck, 
  Award, 
  PlusCircle, 
  Clock, 
  FileText,
  UserCheck
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenMateriModal: () => void;
  onOpenTugasModal: () => void;
  onOpenKuisModal: () => void;
  onOpenNilaiModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenMateriModal,
  onOpenTugasModal,
  onOpenKuisModal,
  onOpenNilaiModal
}) => {
  const { user } = useAuth();
  const { materials, assignments, quizzes, attendances, grades } = useLMS();
  const isDosen = user?.role === 'dosen';

  // Calculations for Dosen
  const totalSubmissions = assignments.reduce((acc, curr) => {
    const list = curr.submissions || curr.allSubmissions || [];
    return acc + list.length;
  }, 0);

  const unreviewedSubmissions = assignments.reduce((acc, curr) => {
    const list = curr.submissions || curr.allSubmissions || [];
    const unreviewed = list.filter(s => {
      const score = s.grade !== undefined ? s.grade : s.score;
      return score === undefined || score === null;
    });
    return acc + unreviewed.length;
  }, 0);

  // Calculations for Mahasiswa
  const mySubmissionsCount = assignments.filter(a => {
    const list = a.submissions || a.allSubmissions || [];
    return list.some(s => (s.studentId || s.student_id) === user?.id);
  }).length;

  const myPendingAssignments = assignments.filter(a => {
    const list = a.submissions || a.allSubmissions || [];
    return !list.some(s => (s.studentId || s.student_id) === user?.id);
  });

  const myAttendancesCount = attendances.filter(a => (a.studentId || a.student_id) === user?.id).length;
  const myGrades = grades.filter(g => (g.studentId || g.student_id) === user?.id);
  const averageGrade = myGrades.length > 0 
    ? (myGrades.reduce((sum, g) => sum + (g.finalGrade ?? g.final_score ?? 0), 0) / myGrades.length).toFixed(1)
    : '-';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 p-6 md:p-8 text-white shadow-xl shadow-indigo-100">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold tracking-wide mb-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              {isDosen ? 'Ruang Manajemen Dosen' : 'Ruang Belajar Mahasiswa'}
            </div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight">
              Selamat Datang, {user?.fullName || 'Pengguna'}! 👋
            </h1>
            <p className="mt-1.5 text-xs md:text-sm text-indigo-100 max-w-xl">
              {isDosen 
                ? 'Kelola bahan ajar, pantau pengumpulan tugas mahasiswa, susun kuis interaktif, dan rekap nilai secara terpusat.'
                : 'Akses materi perkuliahan, kumpulkan tugas tepat waktu, ikuti kuis latihan, dan pantau perkembangan nilai akademik Anda.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {isDosen ? (
              <>
                <button
                  onClick={onOpenMateriModal}
                  className="px-4 py-2.5 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold shadow-md transition flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Unggah Materi</span>
                </button>
                <button
                  onClick={onOpenTugasModal}
                  className="px-4 py-2.5 rounded-2xl bg-indigo-800/80 hover:bg-indigo-800 text-white border border-indigo-500/40 text-xs font-bold shadow-md transition flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Buat Tugas</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('absensi')}
                className="px-4 py-2.5 rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 text-xs font-bold shadow-md transition flex items-center gap-2"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Presensi Hari Ini</span>
              </button>
            )}
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-10 -bottom-10 w-60 h-60 rounded-full bg-white/5 pointer-events-none blur-xl"></div>
        <div className="absolute right-40 top-0 w-40 h-40 rounded-full bg-indigo-500/20 pointer-events-none blur-2xl"></div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1: Materi */}
        <div 
          onClick={() => onNavigate('materi')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Materi Kuliah</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{materials.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Dokumen & Referensi</div>
        </div>

        {/* Card 2: Tugas */}
        <div 
          onClick={() => onNavigate('tugas')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">
              {isDosen ? 'Tugas Aktif' : 'Tugas Kuliah'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {isDosen ? assignments.length : myPendingAssignments.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isDosen ? `${totalSubmissions} Pengumpulan` : 'Perlu diselesaikan'}
          </div>
        </div>

        {/* Card 3: Kuis */}
        <div 
          onClick={() => onNavigate('kuis')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">Kuis Online</span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:scale-110 transition">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{quizzes.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Evaluasi Interaktif</div>
        </div>

        {/* Card 4: Presensi / Nilai */}
        <div 
          onClick={() => onNavigate(isDosen ? 'nilai' : 'absensi')}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-2xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500">
              {isDosen ? 'Submisi Menunggu' : 'Presensi Kehadiran'}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              {isDosen ? <Clock className="w-4 h-4" /> : <CalendarCheck className="w-4 h-4" />}
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {isDosen ? unreviewedSubmissions : `${myAttendancesCount} Hari`}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {isDosen ? 'Perlu dinilai & feedback' : 'Presensi tercatat'}
          </div>
        </div>
      </div>

      {/* Main Section: Dynamic Role Features */}
      {isDosen ? (
        /* DOSEN DASHBOARD SECTIONS */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Quick Actions & Needs Grading */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions Panel */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
              <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>Manajemen Aksi Cepat Dosen</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <button
                  onClick={onOpenMateriModal}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/40 text-left transition group"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">Unggah Materi</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">PDF/Slide perkuliahan</p>
                </button>

                <button
                  onClick={onOpenTugasModal}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/40 text-left transition group"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                    <CheckSquare className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">Buat Tugas</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Tentukan tenggat & skor</p>
                </button>

                <button
                  onClick={onOpenKuisModal}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/40 text-left transition group"
                >
                  <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">Buat Kuis</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Pilihan ganda interaktif</p>
                </button>

                <button
                  onClick={onOpenNilaiModal}
                  className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 bg-slate-50/50 hover:bg-indigo-50/40 text-left transition group"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                    <Award className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-800">Input Nilai</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Rekapitulasi gradebook</p>
                </button>
              </div>
            </div>

            {/* Assignments Queue */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Antrean Evaluasi Tugas</h2>
                  <p className="text-xs text-slate-400">Tugas yang telah dikumpulkan mahasiswa</p>
                </div>
                <button
                  onClick={() => onNavigate('tugas')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Lihat Semua
                </button>
              </div>

              {assignments.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-500">Belum ada tugas yang dibuat</p>
                  <button
                    onClick={onOpenTugasModal}
                    className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    + Buat Tugas Sekarang
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {assignments.slice(0, 4).map(assign => {
                    const subs = assign.submissions || assign.allSubmissions || [];
                    const subCount = subs.length;
                    const unreviewed = subs.filter(s => {
                      const score = s.grade !== undefined ? s.grade : s.score;
                      return score === undefined || score === null;
                    }).length;
                    const courseName = assign.courseName || assign.course_name || 'Mata Kuliah';
                    const dueDate = assign.dueDate || assign.deadline || 'Tanpa Batas';

                    return (
                      <div 
                        key={assign.id}
                        className="p-4 rounded-2xl border border-slate-100 hover:border-slate-200 flex items-center justify-between gap-4 transition"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-600">
                              {courseName}
                            </span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Tenggat: {dueDate}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 mt-1 truncate">{assign.title}</h4>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-700">{subCount} Siswa</span>
                            <div className="text-[10px] text-amber-600 font-medium">
                              {unreviewed > 0 ? `${unreviewed} belum dinilai` : 'Semua dinilai'}
                            </div>
                          </div>
                          <button
                            onClick={() => onNavigate('tugas')}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition"
                          >
                            Periksa
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Teaching Overview & Status */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
              <h2 className="text-sm font-bold text-slate-800 mb-3">Status Kelas & Presensi</h2>
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">Total Presensi Masuk</span>
                    <span className="font-bold text-indigo-600">{attendances.length} Data</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Terekam di sistem perkuliahan</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-700">Nilai Mahasiswa Terekam</span>
                    <span className="font-bold text-emerald-600">{grades.length} Rekap</span>
                  </div>
                  <p className="text-[11px] text-slate-400">Siap dicetak sebagai transkrip</p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate('absensi')}
                    className="w-full py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-700 transition flex items-center justify-center gap-2"
                  >
                    <UserCheck className="w-4 h-4 text-slate-500" />
                    <span>Lihat Rekap Presensi Lengkap</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Teaching Info */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-2">
                <FileText className="w-4 h-4" />
                <span>Pedoman Penilaian Akademik</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Sistem menghitung nilai akhir dengan bobot: Tugas (30%), Kuis (30%), Presensi (20%), dan Evaluasi (20%).
              </p>
              <button
                onClick={() => onNavigate('nilai')}
                className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold transition text-center"
              >
                Buka Buku Nilai
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* MAHASISWA DASHBOARD SECTIONS */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Pending Tasks & Materials */}
          <div className="lg:col-span-2 space-y-6">
            {/* Urgent Tasks */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Tugas yang Perlu Diselesaikan</h2>
                  <p className="text-xs text-slate-400">Perhatikan batas waktu pengumpulan tugas</p>
                </div>
                <button
                  onClick={() => onNavigate('tugas')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Semua Tugas ({assignments.length})
                </button>
              </div>

              {myPendingAssignments.length === 0 ? (
                <div className="py-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-100">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-emerald-800">Tidak ada tugas tertunda!</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">
                    {assignments.length > 0 
                      ? 'Semua tugas kuliah telah berhasil Anda kumpulkan.' 
                      : 'Belum ada tugas kuliah yang diberikan dosen.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myPendingAssignments.slice(0, 3).map(assign => {
                    const courseName = assign.courseName || assign.course_name || 'Mata Kuliah';
                    const dueDate = assign.dueDate || assign.deadline || 'Tanpa Batas';

                    return (
                      <div 
                        key={assign.id}
                        className="p-4 rounded-2xl border border-amber-100 bg-amber-50/30 flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-amber-100 text-[10px] font-bold text-amber-800">
                              {courseName}
                            </span>
                            <span className="text-xs text-rose-500 font-semibold flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Tenggat: {dueDate}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-slate-800 mt-1">{assign.title}</h4>
                        </div>
                        <button
                          onClick={() => onNavigate('tugas')}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shrink-0 shadow-2xs transition"
                        >
                          Kumpulkan
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Learning Materials */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-slate-800">Materi Perkuliahan Terbaru</h2>
                  <p className="text-xs text-slate-400">Unduh atau pelajari modul materi</p>
                </div>
                <button
                  onClick={() => onNavigate('materi')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  Lihat Semua
                </button>
              </div>

              {materials.length === 0 ? (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-medium text-slate-500">Belum ada materi pembelajaran yang diunggah</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {materials.slice(0, 4).map(mat => {
                    const courseName = mat.courseName || mat.course_name || 'Mata Kuliah';

                    return (
                      <div 
                        key={mat.id}
                        className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-200 transition bg-slate-50/40"
                      >
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-[10px] font-semibold text-indigo-700">
                          {courseName}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 mt-1.5 truncate">{mat.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{mat.description}</p>
                        <button
                          onClick={() => onNavigate('materi')}
                          className="mt-3 text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                        >
                          Pelajari Materi &rarr;
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Academic Status & Attendance */}
          <div className="space-y-6">
            {/* Academic Snapshot */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
              <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>Ringkasan Nilai & Progres</span>
              </h2>
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-50 to-violet-50 border border-indigo-100 text-center mb-4">
                <div className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">Rata-Rata Nilai</div>
                <div className="text-3xl font-black text-indigo-700 mt-1">{averageGrade}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Dari {myGrades.length} mata kuliah terdata</div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Tugas Diserahkan</span>
                  <span className="font-bold text-slate-800">{mySubmissionsCount} / {assignments.length}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Presensi Kehadiran</span>
                  <span className="font-bold text-emerald-600">{myAttendancesCount} Hari Masuk</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">Kuis Selesai</span>
                  <span className="font-bold text-violet-600">
                    {quizzes.filter(q => (q.attempts || []).some(a => a.studentId === user?.id) || q.userAttempt).length} / {quizzes.length}
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('nilai')}
                className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>Lihat Transkrip Nilai Lengkap</span>
              </button>
            </div>

            {/* Quick Quiz Card */}
            <div className="bg-gradient-to-tr from-violet-600 to-indigo-700 p-6 rounded-3xl text-white shadow-lg">
              <div className="flex items-center gap-2 text-xs font-bold text-violet-200 mb-2">
                <HelpCircle className="w-4 h-4" />
                <span>Asah Pemahaman Materi</span>
              </div>
              <h3 className="text-sm font-bold leading-snug">
                Ikuti Kuis Interaktif untuk Menguji Penguasaan Topik
              </h3>
              <p className="text-xs text-violet-100 mt-1 mb-4">
                Sistem memberikan koreksi instan dan pembahasan setelah kuis disubmit.
              </p>
              <button
                onClick={() => onNavigate('kuis')}
                className="w-full py-2.5 rounded-xl bg-white text-violet-700 hover:bg-violet-50 text-xs font-bold transition shadow-sm"
              >
                Mulai Kuis Interaktif
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
