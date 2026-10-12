import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  CheckSquare, 
  HelpCircle, 
  CalendarCheck, 
  Award, 
  LogOut,
  X,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenLogoutModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  onOpenLogoutModal
}) => {
  const { user } = useAuth();
  const isDosen = user?.role === 'dosen';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'materi', label: isDosen ? 'Kelola Materi Kuliah' : 'Materi Pembelajaran', icon: BookOpen },
    { id: 'tugas', label: isDosen ? 'Evaluasi & Penilaian Tugas' : 'Tugas Kuliah', icon: CheckSquare },
    { id: 'kuis', label: isDosen ? 'Bank Kuis Interaktif' : 'Kuis Interaktif', icon: HelpCircle },
    { id: 'absensi', label: isDosen ? 'Rekap Presensi Kelas' : 'Presensi Mandiri', icon: CalendarCheck },
    { id: 'nilai', label: isDosen ? 'Buku Nilai (Gradebook)' : 'Transkrip Nilai / Rapor', icon: Award }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col 
        transform transition-transform duration-200 ease-in-out shadow-sm
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">EduSmart LMS</h1>
              <p className="text-[11px] text-slate-400 font-medium">{user?.department || 'Fakultas Ilmu Komputer'}</p>
            </div>
          </div>
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Verified Role Information */}
        <div className="px-5 pt-4">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Status Akun Terverifikasi</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full inline-block truncate ${
                  isDosen ? 'bg-violet-100 text-violet-800' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {isDosen ? 'Dosen Pengajar' : 'Mahasiswa Aktif'}
                </span>
              </div>
            </div>

            <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
              <UserCheck className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Perkuliahan
          </div>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition text-left ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile Card & Validated Logout Trigger */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <img 
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
              alt="Avatar" 
              className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-800 truncate">{user?.fullName || 'Pengguna'}</h4>
              <p className="text-[11px] text-slate-400 truncate">
                {isDosen ? `NIP: ${user?.nimNip || '-'}` : `NIM: ${user?.nimNip || '2024001'}`}
              </p>
            </div>
            <button 
              onClick={onOpenLogoutModal}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              title="Keluar dari Akun (Konfirmasi)"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
