import React from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useLMS } from '../../context/LMSContext';
import { LogOut } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { showToast } = useLMS();

  const handleConfirmLogout = () => {
    logout();
    showToast('Sampai jumpa! Anda telah berhasil keluar dari akun.', 'info');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Keluar dari Akun"
      maxWidth="max-w-sm"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <img 
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'} 
            alt="Avatar" 
            className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-100 shrink-0"
          />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-800 truncate">{user?.fullName || 'Pengguna'}</h4>
            <p className="text-[11px] text-slate-400">
              {user?.role === 'dosen' ? 'Dosen Pengajar' : 'Mahasiswa'} &middot; {user?.department || 'Teknik Informatika'}
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Apakah Anda yakin ingin keluar? Semua tugas dan data Anda tersimpan dengan aman. Anda dapat masuk kembali kapan saja dengan email dan kata sandi Anda.
        </p>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Ya, Keluar</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
