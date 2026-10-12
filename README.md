# 🎓 EduSmart LMS — Fullstack Learning Management System

> **Aplikasi Fullstack Learning Management System (LMS)** modern, responsif, dan aman berbasis **React TypeScript + Tailwind CSS** (Frontend) dan **Express.js + TypeScript + Supabase** (Backend).

---

## 🌟 Ringkasan Kasus & Solusi

Sistem LMS dirancang untuk mengelola seluruh siklus perkuliahan akademik secara terpusat:
- 📖 **Manajemen Materi Pembelajaran**: Silabus, PDF modul, presentasi slide, dan video materi kuliah.
- 📝 **Tugas & Pengumpulan Tugas (Assignments & Submissions)**: Dosen menerbitkan tugas dengan tenggat waktu, mahasiswa mengunggah file jawaban, dan dosen memberikan skor serta ulasan (*feedback*).
- ❓ **Bank Kuis Interaktif**: Kuis pilihan ganda dengan timer hitung mundur, koreksi otomatis, dan pembahasan jawaban.
- 📅 **Presensi Digital**: Presensi mandiri mahasiswa per pertemuan (Hadir, Izin, Sakit) dan rekap kehadiran kelas bagi dosen.
- 🏆 **Buku Nilai (Gradebook) & Transkrip Akademik**: Rekapitulasi nilai berbobot otomatis (Tugas 30%, Kuis 20%, UTS 25%, UAS 25%), konversi huruf mutu (A, B+, B, C, D, E), status kelulusan, serta fitur cetak rapor resmi.
- 🔐 **Autentikasi & Otorisasi Berbasis Peran (RBAC)**: Tampilan dan hak akses terpisah secara UX antara **Dosen** dan **Mahasiswa**, dilengkapi fitur **Quick Role Switcher** untuk demonstrasi langsung.

---

## 🏗️ Arsitektur Proyek (Decoupled Monorepo)

Proyek ini telah dipisahkan menjadi dua folder utama yang mandiri dan terstruktur:

```
Codingan LMS/
├── backend/                  # RESTful API Backend (Express + TypeScript + Supabase)
│   ├── src/
│   │   ├── config/           # Supabase client & in-memory fallback store
│   │   ├── controllers/      # Business logic (auth, materi, tugas, kuis, absensi, nilai)
│   │   ├── database/         # PostgreSQL / Supabase DDL schema.sql
│   │   ├── middleware/       # JWT auth & RBAC requireRole ('dosen' | 'mahasiswa')
│   │   ├── routes/           # Express API route declarations
│   │   ├── security.ts       # Helmet, CORS, Rate Limiting setup
│   │   └── server.ts         # Main server bootstrap (Port 5000)
│   ├── .env.example          # Template environment variable backend
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # Client Web Application (Vite + React 19 + TypeScript + Tailwind)
│   ├── src/
│   │   ├── components/       # Layout (Sidebar, Header), Common (Modal, Toast), Modals
│   │   ├── context/          # AuthContext (JWT & demo role) & LMSContext (State sync)
│   │   ├── pages/            # Views (Dashboard, Materi, Tugas, Kuis, Absensi, Nilai)
│   │   ├── services/         # Axios API client dengan Bearer token interceptor
│   │   ├── types/            # TypeScript Interface definitions
│   │   ├── App.tsx           # Main application routing & controller
│   │   └── index.css         # Modern typography & custom scrollbar
│   ├── .env.example          # Template environment variable frontend
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts        # Vite config (Port 5173)
│
├── .gitignore                # Filter node_modules, build artifacts, & secret keys
└── README.md                 # Dokumentasi lengkap proyek
```

---

## 🚀 Panduan Menjalankan Proyek di Komputer Lokal

### 1. Menjalankan Backend API

Buka terminal (PowerShell atau Command Prompt) di folder `backend`:

```powershell
cd backend
npm install
npm run dev
```

- Server backend akan berjalan di **`http://localhost:5000`**.
- Status kesehatan backend dapat dicek di: **`http://localhost:5000/api/health`**.

> **Catatan Supabase**: Backend sudah dilengkapi dengan *graceful degradation*. Jika Anda belum memasukkan API key Supabase di `backend/.env`, backend akan otomatis menggunakan *high-speed secure local store* sehingga aplikasi langsung siap digunakan tanpa setup manual!

---

### 2. Menjalankan Frontend Web Application

Buka terminal kedua di folder `frontend`:

```powershell
cd frontend
npm install
npm run dev
```

- Buka browser Anda dan akses: **`http://localhost:5173`**.
- Web LMS akan langsung terbuka dengan akun demo aktif.

---

## 👥 Pengalaman Pengguna (UX) & Akun Demo

Untuk mempermudah presentasi atau pengujian, aplikasi telah menyediakan **2 Akun Siap Pakai** dengan hak akses berbeda:

| Peran (Role) | Email | Kata Sandi | Hak Akses & Fitur |
|---|---|---|---|
| **Dosen Pengajar** | `dosen@kampus.ac.id` | `123456` | Unggah materi ajar, buat tugas, buat kuis, beri skor & koreksi tugas mahasiswa, rekap presensi kelas, dan isi buku nilai (gradebook). |
| **Mahasiswa Aktif** | `mahasiswa@kampus.ac.id` | `123456` | Unduh materi modul, kumpulkan file jawaban tugas, ikuti kuis interaktif dengan timer, lakukan presensi mandiri harian, dan cetak transkrip nilai/rapor akademik. |

> 💡 **Fitur Ganti Role Sekali Klik**: Anda dapat menekan tombol **"Ganti Role"** di sidebar kapan saja untuk langsung bertukar peran antara Dosen dan Mahasiswa tanpa perlu logout atau mengetik ulang email!

---

## 🔒 Fitur Keamanan Aplikasi Web

Sistem dibangun dengan standar keamanan aplikasi modern:
1. **JWT (JSON Web Token)**: Autentikasi stateless dengan verifikasi token Bearer pada setiap request sensitif.
2. **Bcrypt Password Hashing**: Kata sandi di-hash menggunakan salt rounds sehingga tidak pernah disimpan dalam plain text.
3. **Role-Based Access Control (RBAC)**: Endpoint pembuatan materi, pembuatan tugas, penilaian, dan bank kuis dilindungi dengan middleware `requireRole('dosen')`.
4. **Helmet Security Headers**: Mengamankan HTTP headers dari serangan XSS, Clickjacking, dan MIME-sniffing.
5. **CORS Policy Restriction**: Hanya mengizinkan request dari domain frontend yang diizinkan (`http://localhost:5173`).
6. **Rate Limiting**: Membatasi hingga 200 request per IP per 15 menit untuk mencegah serangan brute force dan DDoS.

---

## 📱 Responsivitas Lintas Perangkat

Aplikasi web telah dioptimalkan secara menyeluruh menggunakan Tailwind CSS:
- **Laptop & Desktop (Windows/Mac)**: Tampilan luas dengan sidebar tetap, tabel rekapitulasi lengkap, dan layout multi-kolom.
- **Tablet (iPad / Android Tab)**: Tata letak grid 2-kolom adaptif dengan navigasi sentuh yang nyaman.
- **Handphone (Android / iOS)**: Sidebar berubah menjadi *slide-out drawer* dengan tombol menu hamburger, ukuran tombol touch-friendly, dan tabel kartu adaptif.
- **Print / PDF Ready**: Halaman Transkrip Nilai mahasiswa dan Rekap Presensi telah dilengkapi CSS print media khusus (`@media print`) sehingga langsung rapi saat dicetak ke PDF atau printer fisik.

---

## 🗄️ Menghubungkan ke Supabase Cloud (Opsional)

Jika Anda ingin menyimpan data secara permanen di database PostgreSQL cloud Supabase:

1. Buat project baru di [https://supabase.com](https://supabase.com).
2. Buka menu **SQL Editor** di dashboard Supabase Anda.
3. Buka file [`backend/src/database/schema.sql`](backend/src/database/schema.sql), lalu salin seluruh kodenya dan klik **Run** di Supabase SQL Editor.
4. Salin **Project URL** dan **anon / service_role API Key** dari menu *Project Settings -> API*.
5. Buka file `backend/.env` dan perbarui nilainya:
   ```env
   SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
   JWT_SECRET=super_secret_jwt_key_edusmart_lms
   PORT=5000
   ```
6. Restart backend (`npm run dev`). Sistem akan otomatis terhubung ke cloud Supabase!

---

## 💻 Tech Stack Summary

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Axios.
- **Backend**: Express.js, TypeScript, Supabase JS Client, JsonWebToken, Bcrypt.js, Helmet, CORS, Express-Rate-Limit.
- **Database**: PostgreSQL / Supabase dengan Row Level Security (RLS) & Triggers.
