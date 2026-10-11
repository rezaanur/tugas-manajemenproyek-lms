/**
 * Data Awal Kosong & Default Seed untuk EduSmart LMS
 * Bersih tanpa data dummy agar pengguna dapat menginput data sendiri
 */

const DEFAULT_USERS = [
  {
    id: 'user-siswa-1',
    name: 'Siswa (Nama Anda)',
    role: 'siswa', // 'siswa' | 'guru'
    nis: '2024001',
    kelas: 'Kelas XII MIPA 1',
    email: 'siswa@sekolah.sch.id',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    sekolah: 'SMA / Kampus Saya'
  },
  {
    id: 'user-guru-1',
    name: 'Guru / Dosen Pengajar',
    role: 'guru',
    nip: '198501012010011001',
    mapelUtama: 'Mata Kuliah / Pelajaran',
    email: 'guru@sekolah.sch.id',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    sekolah: 'SMA / Kampus Saya'
  }
];

// Pilihan mata pelajaran standar yang bisa dipilih atau ditambah oleh user
const DEFAULT_MAPEL = [
  { id: 'WEB', name: 'Pemrograman Web', guru: 'Dosen / Guru Pengampu', color: 'blue', icon: 'code' },
  { id: 'MANPRO', name: 'Manajemen Proyek', guru: 'Dosen / Guru Pengampu', color: 'indigo', icon: 'kanban' },
  { id: 'MTK', name: 'Matematika', guru: 'Dosen / Guru Pengampu', color: 'violet', icon: 'calculator' },
  { id: 'BD', name: 'Basis Data', guru: 'Dosen / Guru Pengampu', color: 'emerald', icon: 'database' }
];

// Data awal bersih/kosong (Siap diinput sendiri oleh user)
const DEFAULT_MATERI = [];
const DEFAULT_TUGAS = [];
const DEFAULT_KUIS = [];
const DEFAULT_ABSENSI = [];
const DEFAULT_NILAI = [];
