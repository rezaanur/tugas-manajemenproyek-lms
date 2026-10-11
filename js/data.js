/**
 * Data Awal Kosong & Default Seed untuk EduSmart LMS
 * Mendukung Role-Based Access Control (Dosen vs Mahasiswa)
 */

const DEFAULT_USERS = [
  {
    id: 'user-siswa-1',
    name: 'Budi Pratama (Mahasiswa)',
    role: 'siswa', // 'siswa' | 'guru'
    nis: '2024001',
    kelas: 'Semester 7 - Teknik Informatika',
    email: 'budi.pratama@kampus.ac.id',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
    sekolah: 'Fakultas Ilmu Komputer'
  },
  {
    id: 'user-guru-1',
    name: 'Dr. Siti Aminah, M.Kom (Dosen)',
    role: 'guru',
    nip: '198501012010011001',
    mapelUtama: 'Pemrograman Web & Manajemen Proyek',
    email: 'siti.aminah@kampus.ac.id',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    sekolah: 'Fakultas Ilmu Komputer'
  }
];

// Daftar mahasiswa di kelas untuk referensi dosen
const DAFTAR_MAHASISWA = [
  { id: 'mhs-1', name: 'Budi Pratama', nim: '2024001', kelas: 'Semester 7 - TI' },
  { id: 'mhs-2', name: 'Siti Nurhaliza', nim: '2024002', kelas: 'Semester 7 - TI' },
  { id: 'mhs-3', name: 'Ahmad Fauzan', nim: '2024003', kelas: 'Semester 7 - TI' }
];

// Pilihan mata kuliah / pelajaran
const DEFAULT_MAPEL = [
  { id: 'WEB', name: 'Pemrograman Web', guru: 'Dr. Siti Aminah, M.Kom', color: 'blue', icon: 'code' },
  { id: 'MANPRO', name: 'Manajemen Proyek Perangkat Lunak', guru: 'Dr. Siti Aminah, M.Kom', color: 'indigo', icon: 'kanban' },
  { id: 'BD', name: 'Basis Data Lanjut', guru: 'Ahmad Fauzi, M.Kom', color: 'emerald', icon: 'database' },
  { id: 'AI', name: 'Kecerdasan Buatan', guru: 'Prof. Bambang, Ph.D', color: 'violet', icon: 'cpu' }
];

// Koleksi data (bersih tanpa dummy, siap diinput)
const DEFAULT_MATERI = [];
const DEFAULT_TUGAS = [];
const DEFAULT_KUIS = [];
const DEFAULT_ABSENSI = [];
const DEFAULT_NILAI = [];
