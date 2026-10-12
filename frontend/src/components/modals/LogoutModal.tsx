import React from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useLMS } from '../../context/LMSContext';
import { LogOut, AlertTriangle, ShieldCheck } from 'lucide-react';

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { showToast } = useLMS();

  const handleConfirmLogout = () => {
    logout();
    showToast('Anda telah berhasil keluar dari sistem EduSmart LMS.', 'info');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Konfirmasi Keluar Akun"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200/60 text-amber-900">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-xs">
            <h4 className="font-bold">Apakah Anda yakin ingin mengakhiri sesi ini?</h4>
            <p className="text-amber-700 mt-0.5">
              Sesi login untuk <strong>{user?.fullName}</strong> ({user?.role === 'dosen' ? 'Dosen' : 'Mahasiswa'}) akan ditutup.
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed px-1">
          Pastikan Anda telah menyimpan seluruh pekerjaan Anda (pengumpulan tugas, input nilai, atau hasil kuis) sebelum keluar dari portal akademik.
        </p>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Token otentikasi JWT pada browser Anda akan dihapus secara permanen untuk keamanan akun.</span>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            Batal / Tetap Masuk
          </button>
          <button
            type="button"
            onClick={handleConfirmLogout}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200 transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Ya, Keluar dari Sistem</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
