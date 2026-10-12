import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLMS } from '../context/LMSContext';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  BookOpen, 
  Award, 
  HelpCircle,
  CalendarCheck,
  ArrowRight
} from 'lucide-react';

export const AuthPortal: React.FC = () => {
  const { login, register } = useAuth();
  const { showToast, refreshAll } = useLMS();

  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register form state
  const [regRole, setRegRole] = useState<'mahasiswa' | 'dosen'>('mahasiswa');
  const [regFullName, setRegFullName] = useState('');
  const [regNimNip, setRegNimNip] = useState('');
  const [regDepartment, setRegDepartment] = useState('Teknik Informatika');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Helper untuk memudahkan pengujian akun
  const handleFillDemo = (role: 'dosen' | 'mahasiswa') => {
    setActiveTab('LOGIN');
    if (role === 'dosen') {
      setLoginEmail('dosen@kampus.ac.id');
      setLoginPassword('123456');
      showToast('Kredensial Dosen telah diisi. Silakan klik "Masuk".', 'info');
    } else {
      setLoginEmail('mahasiswa@kampus.ac.id');
      setLoginPassword('123456');
      showToast('Kredensial Mahasiswa telah diisi. Silakan klik "Masuk".', 'info');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('Harap masukkan email dan kata sandi Anda.', 'error');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        showToast('Selamat datang kembali!', 'success');
        await refreshAll();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Gagal masuk. Periksa kembali email dan kata sandi Anda.', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regFullName.trim()) {
      showToast('Nama lengkap wajib diisi.', 'error');
      return;
    }
    if (!regNimNip.trim()) {
      showToast(`${regRole === 'dosen' ? 'NIP' : 'NIM'} wajib diisi.`, 'error');
      return;
    }
    if (!regEmail.trim()) {
      showToast('Email kampus wajib diisi.', 'error');
      return;
    }
    if (regPassword.length < 6) {
      showToast('Kata sandi minimal 6 karakter.', 'error');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      showToast('Kata sandi konfirmasi tidak sama.', 'error');
      return;
    }

    setIsRegistering(true);
    try {
      const res = await register({
        email: regEmail,
        password: regPassword,
        full_name: regFullName,
        role: regRole,
        nim_nip: regNimNip,
        department: regDepartment
      });

      if (res.success) {
        showToast('Pendaftaran berhasil! Selamat datang di EduSmart LMS.', 'success');
        await refreshAll();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Pendaftaran gagal. Silakan coba kembali.', 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-8 font-sans antialiased text-slate-800">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        
        {/* Kolom Kiri: Pengenalan Aplikasi yang Ramah & Jelas (5 Kolom) */}
        <div className="md:col-span-5 bg-gradient-to-br from-indigo-800 to-indigo-950 p-8 md:p-10 text-white flex flex-col justify-between">
          <div>
            {/* Logo & Judul */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white shadow-md">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-tight">EduSmart LMS</h1>
                <p className="text-xs text-indigo-200">Portal Belajar Online Kampus</p>
              </div>
            </div>

            {/* Pesan Selamat Datang */}
            <div className="space-y-2 mb-8">
              <h2 className="text-xl font-extrabold leading-snug">
                Semua Aktivitas Kuliah Jadi Lebih Mudah
              </h2>
              <p className="text-xs text-indigo-200 leading-relaxed">
                Tempat dosen dan mahasiswa berbagi materi, mengumpulkan tugas, mengikuti kuis, dan melihat nilai dengan praktis.
              </p>
            </div>

            {/* Fitur Utama yang Mudah Dipahami */}
            <div className="space-y-3.5 text-xs text-indigo-100">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-indigo-700/60 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-indigo-300" />
                </div>
                <span>Download materi kuliah kapan saja</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-indigo-700/60 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-4 h-4 text-emerald-300" />
                </div>
                <span>Isi presensi kehadiran kelas dengan mudah</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-indigo-700/60 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4 text-amber-300" />
                </div>
                <span>Kerjakan kuis latihan dengan hasil langsung</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-indigo-700/60 flex items-center justify-center shrink-0">
                  <Award className="w-4 h-4 text-violet-300" />
                </div>
                <span>Lihat nilai dan cetak rapor semester Anda</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-indigo-700/50 mt-6 text-[11px] text-indigo-300">
            Tahun Ajaran 2026/2027 &middot; Fakultas Ilmu Komputer
          </div>
        </div>

        {/* Kolom Kanan: Form Masuk & Daftar yang Bersih dan Sederhana (7 Kolom) */}
        <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Pilihan Tab Masuk / Daftar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div>
                <h2 className="text-lg font-extrabold text-slate-800">
                  {activeTab === 'LOGIN' ? 'Masuk ke Akun' : 'Daftar Akun Baru'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeTab === 'LOGIN' 
                    ? 'Silakan masukkan email dan kata sandi Anda' 
                    : 'Lengkapi data diri singkat Anda di bawah ini'}
                </p>
              </div>

              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('LOGIN')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === 'LOGIN' 
                      ? 'bg-white text-indigo-700 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('REGISTER')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === 'REGISTER' 
                      ? 'bg-white text-indigo-700 shadow-xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Daftar
                </button>
              </div>
            </div>

            {/* TAB MASUK (LOGIN) */}
            {activeTab === 'LOGIN' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Email Kampus
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="nama@kampus.ac.id"
                      value={loginEmail}
                      onChange={e => setLoginEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  <span>{isLoggingIn ? 'Sedang masuk...' : 'Masuk'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Bantuan Akun Percobaan untuk Mempermudah Pengujian */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">
                    Ingin mencoba langsung? Pilih salah satu akun contoh:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleFillDemo('dosen')}
                      className="p-2.5 rounded-xl border border-violet-200 bg-violet-50/50 hover:bg-violet-100 text-left transition"
                    >
                      <div className="text-xs font-bold text-violet-800">Akun Dosen</div>
                      <div className="text-[10px] text-violet-600 font-mono">dosen@kampus.ac.id</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFillDemo('mahasiswa')}
                      className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/50 hover:bg-indigo-100 text-left transition"
                    >
                      <div className="text-xs font-bold text-indigo-800">Akun Mahasiswa</div>
                      <div className="text-[10px] text-indigo-600 font-mono">mahasiswa@kampus.ac.id</div>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB DAFTAR (REGISTER) */}
            {activeTab === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {/* Pilihan Peran */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Saya mendaftar sebagai:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('mahasiswa')}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        regRole === 'mahasiswa'
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs">Mahasiswa</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('dosen')}
                      className={`p-2.5 rounded-xl border text-center transition ${
                        regRole === 'dosen'
                          ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs">Dosen Pengajar</span>
                    </button>
                  </div>
                </div>

                {/* Nama Lengkap */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Pratama"
                    value={regFullName}
                    onChange={e => setRegFullName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* NIM / NIP dan Program Studi */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {regRole === 'dosen' ? 'NIP Dosen' : 'NIM Mahasiswa'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={regRole === 'dosen' ? '19850101...' : '2024001'}
                      value={regNimNip}
                      onChange={e => setRegNimNip(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Program Studi</label>
                    <select
                      value={regDepartment}
                      onChange={e => setRegDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="Teknik Informatika">Teknik Informatika</option>
                      <option value="Sistem Informasi">Sistem Informasi</option>
                      <option value="Ilmu Komputer">Ilmu Komputer</option>
                    </select>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Kampus</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@kampus.ac.id"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Kata Sandi & Konfirmasi */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Kata Sandi (Min 6)</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ulangi Sandi</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                >
                  <span>{isRegistering ? 'Mendaftarkan akun...' : 'Daftar Sekarang'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          <div className="pt-4 text-center text-[11px] text-slate-400">
            Aplikasi resmi kegiatan perkuliahan kampus
          </div>
        </div>

      </div>
    </div>
  );
};
