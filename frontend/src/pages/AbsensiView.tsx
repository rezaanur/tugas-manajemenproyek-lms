import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLMS } from '../context/LMSContext';
import { attendanceApi } from '../services/api';
import { 
  CalendarCheck, 
  CheckCircle2, 
  UserCheck, 
  Calendar, 
  Filter, 
  Send, 
  Printer 
} from 'lucide-react';

export const AbsensiView: React.FC = () => {
  const { user } = useAuth();
  const { attendances, courses, refreshAll, showToast } = useLMS();
  const isDosen = user?.role === 'dosen';

  // State for Mahasiswa Check-In
  const [courseId, setCourseId] = useState(courses[0]?.id || 'crs-1');
  const [status, setStatus] = useState<'HADIR' | 'IZIN' | 'SAKIT'>('HADIR');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for Dosen Filter
  const [filterCourse, setFilterCourse] = useState('ALL');

  const todayStr = new Date().toISOString().split('T')[0];

  // Check if Mahasiswa already attended today for selected course
  const alreadyAttendedToday = attendances.some(
    a => a.studentId === user?.id && a.date === todayStr && a.courseId === courseId
  );

  const handleSubmitAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) {
      showToast('Pilih mata kuliah terlebih dahulu!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedCourseObj = courses.find(c => c.id === courseId);
      await attendanceApi.create({
        courseId,
        courseName: selectedCourseObj?.name || 'Mata Kuliah',
        date: todayStr,
        status,
        notes: notes.trim()
      });

      showToast(`Presensi ${status} berhasil dicatat!`, 'success');
      setNotes('');
      await refreshAll();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Gagal mengirim presensi', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAttendances = attendances.filter(a => {
    if (isDosen) {
      return filterCourse === 'ALL' || a.courseId === filterCourse;
    } else {
      return a.studentId === user?.id;
    }
  });

  // Calculate statistics
  const totalHadir = filteredAttendances.filter(a => a.status === 'HADIR').length;
  const totalIzin = filteredAttendances.filter(a => a.status === 'IZIN').length;
  const totalSakit = filteredAttendances.filter(a => a.status === 'SAKIT').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <CalendarCheck className="w-4 h-4" />
            <span>Presensi Perkuliahan Digital</span>
          </div>
          <h1 className="text-lg md:text-xl font-extrabold text-slate-800">
            {isDosen ? 'Rekapitulasi Presensi Kehadiran Kelas' : 'Presensi Kehadiran Mandiri'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isDosen 
              ? 'Pantau kehadiran mahasiswa per pertemuan secara real-time dan transparan.' 
              : 'Catat kehadiran perkuliahan Anda setiap pertemuan dengan bukti waktu tersinkronisasi.'}
          </p>
        </div>

        {isDosen && (
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Rekap Presensi</span>
          </button>
        )}
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            H
          </div>
          <div>
            <div className="text-xl md:text-2xl font-black text-slate-800">{totalHadir}</div>
            <div className="text-[11px] text-slate-400 font-medium">Hadir Tepat Waktu</div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            I
          </div>
          <div>
            <div className="text-xl md:text-2xl font-black text-slate-800">{totalIzin}</div>
            <div className="text-[11px] text-slate-400 font-medium">Izin Terkonfirmasi</div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-100 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            S
          </div>
          <div>
            <div className="text-xl md:text-2xl font-black text-slate-800">{totalSakit}</div>
            <div className="text-[11px] text-slate-400 font-medium">Sakit Berhalangan</div>
          </div>
        </div>
      </div>

      {/* Mahasiswa: Check-In Form */}
      {!isDosen && (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-800">Formulir Presensi Hari Ini ({todayStr})</h2>
          </div>

          {alreadyAttendedToday ? (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center gap-3 text-emerald-800">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold">Anda sudah melakukan presensi untuk mata kuliah ini hari ini.</p>
                <p className="text-[11px] text-emerald-600 mt-0.5">Kehadiran Anda telah dicatat oleh sistem LMS.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitAttendance} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mata Kuliah
                  </label>
                  <select
                    value={courseId}
                    onChange={e => setCourseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                  >
                    {courses.map(crs => (
                      <option key={crs.id} value={crs.id}>{crs.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Status Kehadiran
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['HADIR', 'IZIN', 'SAKIT'] as const).map(st => (
                      <button
                        type="button"
                        key={st}
                        onClick={() => setStatus(st)}
                        className={`py-2 text-xs font-bold rounded-xl border transition ${
                          status === st
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Catatan / Keterangan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Hadir di kelas ruang A-301 / Izin keperluan lomba kampus"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Mencatat...' : 'Kirim Presensi Sekarang'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Attendance History Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              {isDosen ? 'Log Rekapitulasi Presensi Seluruh Mahasiswa' : 'Riwayat Presensi Pribadi'}
            </h2>
            <p className="text-xs text-slate-400">Total {filteredAttendances.length} baris riwayat presensi tercatat</p>
          </div>

          {isDosen && (
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={filterCourse}
                onChange={e => setFilterCourse(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ALL">Semua Mata Kuliah</option>
                {courses.map(crs => (
                  <option key={crs.id} value={crs.id}>{crs.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {filteredAttendances.length === 0 ? (
          <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-500">Belum ada data presensi yang terekam.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {!isDosen ? 'Gunakan form di atas untuk melakukan presensi pertama Anda.' : 'Menunggu mahasiswa melakukan presensi.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="pb-3">Tanggal & Waktu</th>
                  {isDosen && <th className="pb-3">Mahasiswa</th>}
                  <th className="pb-3">Mata Kuliah</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendances.map(att => (
                  <tr key={att.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{att.date}</span>
                      </div>
                    </td>
                    {isDosen && (
                      <td className="py-3">
                        <div className="font-bold text-slate-800">{att.studentName || 'Mahasiswa'}</div>
                        <div className="text-[11px] text-slate-400">NIM: {att.studentNim || '-'}</div>
                      </td>
                    )}
                    <td className="py-3 font-semibold text-slate-700">
                      {att.courseName}
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        att.status === 'HADIR'
                          ? 'bg-emerald-100 text-emerald-800'
                          : att.status === 'IZIN'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {att.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 italic">
                      {att.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
