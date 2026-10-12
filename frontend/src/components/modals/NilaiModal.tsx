import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useLMS } from '../../context/LMSContext';
import { gradeApi } from '../../services/api';
import type { Grade } from '../../types';

interface NilaiModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingGrade?: Grade;
}

export const NilaiModal: React.FC<NilaiModalProps> = ({ isOpen, onClose, existingGrade }) => {
  const { courses, showToast, refreshAll } = useLMS();
  const [courseId, setCourseId] = useState('');
  const [studentName, setStudentName] = useState('Budi Pratama');
  const [studentNim, setStudentNim] = useState('2024001');
  const [kkm, setKkm] = useState(75);
  const [tugasScore, setTugasScore] = useState(85);
  const [kuisScore, setKuisScore] = useState(80);
  const [utsScore, setUtsScore] = useState(85);
  const [uasScore, setUasScore] = useState(90);
  const [loading, setLoading] = useState(false);

  const students = [
    { name: 'Budi Pratama', nim: '2024001' },
    { name: 'Siti Nurhaliza', nim: '2024002' },
    { name: 'Ahmad Fauzan', nim: '2024003' }
  ];

  useEffect(() => {
    if (existingGrade) {
      setStudentName(existingGrade.studentName || existingGrade.student_name || 'Budi Pratama');
      setStudentNim(existingGrade.studentNim || existingGrade.student_nim || '2024001');
      setCourseId(existingGrade.courseId || existingGrade.course_id || '');
      setTugasScore(existingGrade.tugasScore ?? existingGrade.tugas_score ?? 85);
      setKuisScore(existingGrade.kuisScore ?? existingGrade.kuis_score ?? 80);
      setKkm(existingGrade.kkm || 75);
    } else {
      setStudentName('Budi Pratama');
      setStudentNim('2024001');
      setCourseId(courses[0]?.id || 'crs-1');
      setTugasScore(85);
      setKuisScore(80);
      setUtsScore(85);
      setUasScore(90);
      setKkm(75);
    }
  }, [existingGrade, courses]);

  const handleStudentChange = (name: string) => {
    setStudentName(name);
    const found = students.find(s => s.name === name);
    if (found) setStudentNim(found.nim);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedCourse = courses.find(c => c.id === courseId);
      await gradeApi.upsert({
        course_id: courseId || courses[0]?.id || 'crs-1',
        course_name: selectedCourse?.name || 'Mata Kuliah',
        student_id: 'mhs-' + studentNim,
        student_name: studentName,
        student_nim: studentNim,
        kkm: Number(kkm),
        tugas_score: Number(tugasScore),
        kuis_score: Number(kuisScore),
        uts_score: Number(utsScore),
        uas_score: Number(uasScore)
      });

      showToast(`Nilai untuk ${studentName} berhasil disimpan ke Buku Nilai!`);
      onClose();
      refreshAll();
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
      title={existingGrade ? 'Perbarui Nilai Mahasiswa' : 'Input Nilai Akademik Mahasiswa'}
      subtitle="Formula: Tugas (30%) + Kuis (20%) + UTS (25%) + UAS (25%)"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pilih Mahasiswa</label>
            <select 
              value={studentName}
              onChange={(e) => handleStudentChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
            >
              {students.map(s => (
                <option key={s.nim} value={s.name}>{s.name} ({s.nim})</option>
              ))}
            </select>
          </div>
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
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Standar KKM Mata Kuliah</label>
          <input 
            type="number"
            min={50}
            max={100}
            value={kkm}
            onChange={(e) => setKkm(Number(e.target.value))}
            required
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
          />
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
          <span className="text-xs font-bold text-slate-700 block">Komponen Nilai Mahasiswa (0 - 100):</span>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <label className="text-[11px] text-slate-500 font-semibold block mb-1">Tugas (30%)</label>
              <input 
                type="number" 
                min={0} 
                max={100} 
                value={tugasScore} 
                onChange={(e) => setTugasScore(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-center" 
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-semibold block mb-1">Kuis (20%)</label>
              <input 
                type="number" 
                min={0} 
                max={100} 
                value={kuisScore} 
                onChange={(e) => setKuisScore(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-center" 
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-semibold block mb-1">UTS (25%)</label>
              <input 
                type="number" 
                min={0} 
                max={100} 
                value={utsScore} 
                onChange={(e) => setUtsScore(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-center" 
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 font-semibold block mb-1">UAS (25%)</label>
              <input 
                type="number" 
                min={0} 
                max={100} 
                value={uasScore} 
                onChange={(e) => setUasScore(Number(e.target.value))}
                className="w-full px-2 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800 text-center" 
              />
            </div>
          </div>
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
            {loading ? 'Menyimpan...' : 'Simpan ke Buku Nilai'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
