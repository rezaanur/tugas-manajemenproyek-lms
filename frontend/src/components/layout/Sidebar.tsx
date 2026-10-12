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
  X 
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
    { id: 'materi', label: isDosen ? 'Kelola Materi' : 'Materi Kuliah', icon: BookOpen },
    { id: 'tugas', label: isDosen ? 'Tugas & Nilai Mahasiswa' : 'Tugas Kuliah', icon: CheckSquare },
    { id: 'kuis', label: isDosen ? 'Bank Soal Kuis' : 'Kuis Latihan', icon: HelpCircle },
    { id: 'absensi', label: isDosen ? 'Presensi Kelas' : 'Presensi Saya', icon: CalendarCheck },
    { id: 'nilai', label: isDosen ? 'Buku Nilai' : 'Nilai & Rapor', icon: Award }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col 
        transform transition-transform duration-200 ease-in-out shadow-xs
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-base font-extrabold text-slate-900 leading-tight">EduSmart LMS</h1>
              <p className="text-[11px] text-slate-400 font-medium">Portal Kuliah Online</p>
            </div>
          </div>
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Card */}
        <div className="px-4 pt-4">
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Akun Anda</span>
              <span className={`px-2 py-0.5 text-xs font-bold rounded-lg inline-block mt-0.5 ${
                isDosen ? 'bg-violet-100 text-violet-800' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {isDosen ? 'Dosen Pengajar' : 'Mahasiswa'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium truncate max-w-[100px]">
              {user?.department || 'Teknik Informatika'}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Menu Utama
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
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition text-left ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile Card & Friendly Logout */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <img 
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
              alt="Avatar" 
              className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-800 truncate">{user?.fullName || 'Pengguna'}</h4>
              <p className="text-[11px] text-slate-400 truncate">
                {isDosen ? `NIP: ${user?.nimNip || '-'}` : `NIM: ${user?.nimNip || '2024001'}`}
              </p>
            </div>
            <button 
              onClick={onOpenLogoutModal}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition flex items-center gap-1"
              title="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
