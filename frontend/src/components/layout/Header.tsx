import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Clock, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onOpenMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onOpenMobile }) => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState('');

  const titles: Record<string, string> = {
    dashboard: user?.role === 'dosen' ? 'Dashboard Dosen' : 'Dashboard Mahasiswa',
    materi: user?.role === 'dosen' ? 'Manajemen Bahan Ajar' : 'Materi Pembelajaran',
    tugas: user?.role === 'dosen' ? 'Evaluasi & Penilaian Tugas' : 'Tugas Kuliah',
    kuis: user?.role === 'dosen' ? 'Bank Kuis & Soal' : 'Kuis Interaktif',
    absensi: user?.role === 'dosen' ? 'Rekap Presensi Kelas' : 'Presensi Mandiri',
    nilai: user?.role === 'dosen' ? 'Buku Nilai (Gradebook)' : 'Transkrip Nilai / Rapor'
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleDateString('id-ID', {
        weekday: 'short',
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

  return (
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 md:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenMobile}
          className="lg:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <div className="text-[11px] text-slate-400 font-medium">Halaman Aktif</div>
          <h2 className="text-sm md:text-base font-bold text-slate-800 leading-tight">
            {titles[activeTab] || 'EduSmart LMS'}
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Role Pill */}
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
          user?.role === 'dosen' 
            ? 'bg-violet-50 text-violet-700 border-violet-200' 
            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
        }`}>
          {user?.role === 'dosen' ? 'Akses Dosen' : 'Akses Mahasiswa'}
        </span>

        {/* Real-time Clock */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>{currentTime || 'Memuat waktu...'}</span>
        </div>

        {/* Security / SSL Indicator */}
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 font-semibold" title="Koneksi Aman JWT & Helmet Protected">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Secured</span>
        </div>
      </div>
    </header>
  );
};
