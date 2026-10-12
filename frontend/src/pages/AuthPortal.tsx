import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLMS } from '../context/LMSContext';
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  ShieldCheck, 
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

  // Quick fill demo helper
  const handleFillDemo = (role: 'dosen' | 'mahasiswa') => {
    setActiveTab('LOGIN');
    if (role === 'dosen') {
      setLoginEmail('dosen@kampus.ac.id');
      setLoginPassword('123456');
      showToast('Kredensial Dosen dimuat. Silakan klik tombol "Masuk ke Sistem".', 'info');
    } else {
      setLoginEmail('mahasiswa@kampus.ac.id');
      setLoginPassword('123456');
      showToast('Kredensial Mahasiswa dimuat. Silakan klik tombol "Masuk ke Sistem".', 'info');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('Harap isi email dan kata sandi Anda!', 'error');
      return;
    }

    setIsLoggingIn(true);
    try {
      const res = await login(loginEmail, loginPassword);
      if (res.success) {
        showToast(res.message, 'success');
        await refreshAll();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Gagal terhubung ke server autentikasi', 'error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regFullName.trim()) {
      showToast('Nama lengkap wajib diisi!', 'error');
      return;
    }
    if (!regNimNip.trim()) {
      showToast(`${regRole === 'dosen' ? 'NIP' : 'NIM'} wajib diisi!`, 'error');
      return;
    }
    if (!regEmail.trim()) {
      showToast('Email kampus wajib diisi!', 'error');
      return;
    }
    if (regPassword.length < 6) {
      showToast('Kata sandi minimal 6 karakter!', 'error');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      showToast('Konfirmasi kata sandi tidak cocok!', 'error');
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
        showToast('Pendaftaran akun berhasil! Anda langsung masuk ke sistem.', 'success');
        await refreshAll();
      } else {
        showToast(res.message, 'error');
      }
    } catch {
      showToast('Gagal mendaftarkan akun baru', 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 flex items-center justify-center p-4 md:p-8 font-sans antialiased text-slate-800">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* Left Column: Campus Identity & Feature Showcase (5 cols) */}
        <div className="lg:col-span-5 bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 p-8 md:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            {/* Campus Brand */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-indigo-300" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">EduSmart LMS</h1>
                <p className="text-xs text-indigo-200 font-medium">Sistem Informasi Akademik Terpadu</p>
              </div>
            </div>

            {/* University Tagline */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-[11px] font-semibold border border-indigo-400/30">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Portal Resmi Perkuliahan & Evaluasi</span>
              </div>
              <h2 className="text-2xl font-black leading-snug">
                Platform Pembelajaran Digital Standar Universitas
              </h2>
              <p className="text-xs text-indigo-200 leading-relaxed">
                Akses terpusat materi kuliah, pengerjaan tugas, evaluasi kuis interaktif, rekap presensi, dan buku nilai terstruktur.
              </p>
            </div>

            {/* Features Bullet Points */}
            <div className="mt-8 space-y-3 text-xs text-indigo-100">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-indigo-700/60 flex items-center justify-center shrink-0">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
                </div>
                <span>Bahan ajar & silabus perkuliahan terintegrasi</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-indigo-700/60 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
                </div>
                <span>Kuis interaktif berbatas waktu dengan koreksi otomatis</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-indigo-700/60 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-3.5 h-3.5 text-emerald-300" />
                </div>
                <span>Presensi mandiri & rekap kehadiran kelas real-time</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-indigo-700/60 flex items-center justify-center shrink-0">
                  <Award className="w-3.5 h-3.5 text-violet-300" />
                </div>
                <span>Buku Nilai (Gradebook) & Transkrip Akademik resmi</span>
              </div>
            </div>
          </div>

          {/* Footer Security Badges */}
          <div className="relative z-10 pt-8 border-t border-indigo-700/60 mt-8 flex items-center justify-between text-[11px] text-indigo-300">
            <span>© 2026 EduSmart Kampus</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-300">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>JWT & RBAC Secured</span>
            </span>
          </div>

          {/* Decorative shapes */}
          <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-white/5 blur-2xl pointer-events-none"></div>
          <div className="absolute -left-16 -bottom-16 w-56 h-56 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none"></div>
        </div>

        {/* Right Column: Authentication Forms (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Mode Switch Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800">
                  {activeTab === 'LOGIN' ? 'Masuk ke Akun Anda' : 'Registrasi Akun Akademik'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeTab === 'LOGIN' 
                    ? 'Gunakan email kampus terdaftar untuk mengakses ruang kelas' 
                    : 'Lengkapi formulir di bawah untuk mendaftarkan akun baru'}
                </p>
              </div>

              <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('LOGIN')}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === 'LOGIN' 
                      ? 'bg-white text-indigo-700 shadow-2xs' 
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
                      ? 'bg-white text-indigo-700 shadow-2xs' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Daftar
                </button>
              </div>
            </div>

            {/* TAB 1: LOGIN FORM */}
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
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Kata Sandi
                    </label>
                    <span className="text-[11px] text-indigo-600 hover:underline cursor-pointer">
                      Lupa kata sandi?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
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
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-100 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  <span>{isLoggingIn ? 'Memverifikasi Kredensial...' : 'Masuk ke Sistem LMS'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Convenient Demo Autofill Pills for Evaluation */}
                <div className="mt-6 pt-5 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Isi Cepat Kredensial Pengujian:</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">Tersedia Akun Teruji</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleFillDemo('dosen')}
                      className="p-2.5 rounded-xl border border-violet-200 bg-violet-50/60 hover:bg-violet-100 text-left transition"
                    >
                      <div className="text-[11px] font-bold text-violet-800">Akun Dosen</div>
                      <div className="text-[10px] text-violet-600 font-mono truncate">dosen@kampus.ac.id</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFillDemo('mahasiswa')}
                      className="p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-left transition"
                    >
                      <div className="text-[11px] font-bold text-indigo-800">Akun Mahasiswa</div>
                      <div className="text-[10px] text-indigo-600 font-mono truncate">mahasiswa@kampus.ac.id</div>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* TAB 2: REGISTER FORM */}
            {activeTab === 'REGISTER' && (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                {/* Role Selector Cards */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Daftar Sebagai Peran:
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setRegRole('mahasiswa')}
                      className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                        regRole === 'mahasiswa'
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        regRole === 'mahasiswa' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Mahasiswa</div>
                        <div className="text-[10px] text-slate-500">Mata kuliah & tugas</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegRole('dosen')}
                      className={`p-3 rounded-2xl border text-left transition flex items-center gap-2.5 ${
                        regRole === 'dosen'
                          ? 'border-violet-600 bg-violet-50/70 text-violet-900 ring-2 ring-violet-500/20'
                          : 'border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        regRole === 'dosen' ? 'bg-violet-600 text-white' : 'bg-slate-200 text-slate-600'
                      }`}>
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold">Dosen Pengajar</div>
                        <div className="text-[10px] text-slate-500">Manajemen perkuliahan</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder={regRole === 'dosen' ? 'Dr. Ahmad Fauzan, M.Kom.' : 'Rian Pratama'}
                      value={regFullName}
                      onChange={e => setRegFullName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                {/* NIM / NIP and Department */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {regRole === 'dosen' ? 'Nomor Induk Pegawai (NIP)' : 'Nomor Induk Siswa (NIM)'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={regRole === 'dosen' ? '19850101...' : '2024009'}
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
                      <option value="Teknik Elektro">Teknik Elektro</option>
                    </select>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Kampus</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="nama@kampus.ac.id"
                      value={regEmail}
                      onChange={e => setRegEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                {/* Password & Confirm */}
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ulangi Kata Sandi</label>
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
                  className="w-full py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
                >
                  <span>{isRegistering ? 'Mendaftarkan Akun...' : 'Daftar & Masuk ke Sistem'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

          <div className="pt-4 text-center text-[11px] text-slate-400">
            Sistem Informasi Akademik Terintegrasi &middot; Keamanan Terproteksi JWT
          </div>
        </div>

      </div>
    </div>
  );
};
