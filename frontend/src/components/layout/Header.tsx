import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Clock } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onOpenMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onOpenMobile }) => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState('');

  const titles: Record<string, string> = {
    dashboard: user?.role === 'dosen' ? 'Dashboard Dosen' : 'Dashboard Mahasiswa',
    materi: user?.role === 'dosen' ? 'Kelola Materi Kuliah' : 'Materi Pembelajaran',
    tugas: user?.role === 'dosen' ? 'Tugas & Penilaian Mahasiswa' : 'Tugas Kuliah',
    kuis: user?.role === 'dosen' ? 'Bank Soal & Kuis' : 'Kuis Latihan',
    absensi: user?.role === 'dosen' ? 'Rekap Kehadiran Kelas' : 'Presensi Kehadiran',
    nilai: user?.role === 'dosen' ? 'Buku Nilai' : 'Nilai & Transkrip'
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) + ' WIB');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const isDosen = user?.role === 'dosen';

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-sm md:text-base font-extrabold text-slate-800 leading-tight">
            {titles[activeTab] || 'EduSmart LMS'}
          </h2>
          <p className="text-[11px] text-slate-400 font-medium">Sistem Pembelajaran Kampus</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Role Pill */}
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          isDosen 
            ? 'bg-violet-100 text-violet-800' 
            : 'bg-indigo-100 text-indigo-800'
        }`}>
          {isDosen ? 'Dosen' : 'Mahasiswa'}
        </span>

        {/* Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>{currentTime || 'Memuat...'}</span>
        </div>
      </div>
    </header>
  );
};
