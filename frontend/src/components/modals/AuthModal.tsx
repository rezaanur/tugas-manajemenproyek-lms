import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useLMS } from '../../context/LMSContext';
import { LogIn, UserPlus, KeyRound, Mail, User, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useAuth();
  const { showToast, refreshAll } = useLMS();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'dosen' | 'mahasiswa'>('mahasiswa');
  const [nimNip, setNimNip] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuickLogin = async (asRole: 'dosen' | 'mahasiswa') => {
    setLoading(true);
    const targetEmail = asRole === 'dosen' ? 'dosen@kampus.ac.id' : 'mahasiswa@kampus.ac.id';
    const res = await login(targetEmail, '123456');
    setLoading(false);

    if (res.success) {
      showToast(`Berhasil masuk sebagai ${asRole === 'dosen' ? 'Dosen' : 'Mahasiswa'}!`, 'success');
      await refreshAll();
      onClose();
    } else {
      showToast(res.message, 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'LOGIN') {
        const res = await login(email, password);
        if (res.success) {
          showToast('Login berhasil!', 'success');
          await refreshAll();
          onClose();
        } else {
          showToast(res.message, 'error');
        }
      } else {
        const res = await register({
          email,
          password,
          fullName,
          role,
          nimNip: nimNip || (role === 'dosen' ? '198501152010122001' : '2024001')
        });
        if (res.success) {
          showToast('Pendaftaran akun berhasil!', 'success');
          await refreshAll();
          onClose();
        } else {
          showToast(res.message, 'error');
        }
      }
    } catch (err: any) {
      showToast('Terjadi kesalahan pada sistem', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'LOGIN' ? 'Masuk ke Akun EduSmart LMS' : 'Daftar Akun Baru'}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Quick Demo Access Box */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-indigo-500" />
            <span>Login Cepat Demo (Instan)</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('dosen')}
              disabled={loading}
              className="py-2 px-3 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-violet-200"
            >
              <span>Akses Dosen</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('mahasiswa')}
              disabled={loading}
              className="py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center justify-center gap-1.5 border border-indigo-200"
            >
              <span>Akses Mahasiswa</span>
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode('LOGIN')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              mode === 'LOGIN' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => setMode('REGISTER')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition ${
              mode === 'REGISTER' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Daftar Baru
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'REGISTER' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Rian Anggara"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Peran Akun</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="mahasiswa">Mahasiswa</option>
                    <option value="dosen">Dosen</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">NIM / NIP</label>
                  <input
                    type="text"
                    placeholder="Contoh: 2024009"
                    value={nimNip}
                    onChange={e => setNimNip(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Kampus</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="nama@kampus.ac.id"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi</label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {mode === 'LOGIN' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{loading ? 'Memproses...' : mode === 'LOGIN' ? 'Masuk Sekarang' : 'Daftar Sekarang'}</span>
          </button>
        </form>

        <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1 pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Keamanan akun perkuliahan terjamin dan terlindungi</span>
        </div>
      </div>
    </Modal>
  );
};
