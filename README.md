# EduSmart LMS (Learning Management System)
> **Tugas Mata Kuliah: Manajemen Proyek / Pemrograman Web**  
> Prototipe Antarmuka Sistem Pembelajaran Sekolah Berbasis Web (Frontend-Only dengan LocalStorage)

---

## 📌 Ringkasan Proyek
**EduSmart LMS** adalah aplikasi web modern yang dirancang untuk kebutuhan sekolah (SMA / Universitas) dalam mengelola aktivitas akademik digital. Aplikasi ini berfokus pada antarmuka pengguna (UI/UX) yang intuitif, responsif, dan kaya fitur tanpa memerlukan instalasi database server yang rumit. Seluruh data interaktif (seperti materi baru, pengumpulan tugas, pengerjaan kuis, presensi harian, dan nilai) tersimpan secara persisten di peramban menggunakan **Web Storage API (`localStorage`)**.

---

## 🚀 Fitur Utama

### 1. 🔐 Simulasi Autentikasi & Multi-Peran (Siswa & Guru)
* **Mode Siswa (Budi Pratama - XII MIPA 1)**: Mempelajari materi, mengumpulkan tugas dengan lampiran file & catatan, mengerjakan kuis interaktif berwaktu, mengisi presensi harian, serta melihat transkrip nilai/rapor.
* **Mode Guru (Dra. Siti Aminah, M.Pd)**: Mengunggah modul/bahan ajar baru, mengevaluasi berkas tugas siswa, memberikan nilai & umpan balik (feedback) yang langsung tersinkron ke rapor siswa.
* **Quick Role Switcher**: Tombol pergantian peran instan di pojok kiri atas/sidebar tanpa perlu reload.

### 2. 📊 Dashboard Interaktif
* Kartu sambutan dinamis dengan penanda peran dan jam digital *real-time* (WIB).
* 4 Indikator metrik utama: Total Materi, Tugas yang Perlu Dikerjakan, Rata-rata Nilai Rapor, dan Persentase Kehadiran.
* Widget **Jadwal Pelajaran Hari Ini** (status sesi aktif, ruang kelas, pengajar).
* Widget **Tugas Mendatang** dengan indikator batas tenggat waktu (*deadline*).

### 3. 📚 Materi Pembelajaran (Bahan Ajar)
* Katalog materi dalam berbagai format: **Dokumen (PDF)**, **Video Pembelajaran**, dan **Slide Presentasi (PPT)**.
* Filter pencarian cepat berdasarkan kata kunci judul dan dropdown mata pelajaran (Matematika, Pemrograman Web, Fisika, Bahasa Inggris, Bahasa Indonesia).
* **Modal Preview Materi**: Pemutar video terintegrasi atau pratinjau dokumen dengan simulasi unduh berkas.
* Form penambahan materi baru khusus untuk Guru pengajar.

### 4. 📝 Tugas & Evaluasi (Assignments)
* Tab kategori tugas: *Semua*, *Belum Selesai*, *Sudah Dikumpulkan*, dan *Dinilai*.
* **Siswa**: Modal formulir pengumpulan tugas lengkap dengan *file upload* dan catatan untuk guru.
* **Guru**: Modal evaluasi untuk memeriksa kiriman berkas siswa, memberikan skor nilai (0-100), dan menulis catatan evaluasi.

### 5. ⏱️ Kuis Interaktif Berwaktu (Interactive Quiz Engine)
* Simulasi pengerjaan kuis pilihan ganda interaktif dengan hitung mundur (*countdown timer*).
* Navigasi pertanyaan dengan bilah kemajuan (*progress bar*) dan pemilihan opsi A/B/C/D.
* Evaluasi skor otomatis secara *real-time*.
* **Review Hasil Kuis**: Analisis jawaban benar/salah lengkap dengan kunci jawaban dan pembahasan materi.
* Skor kuis otomatis terintegrasi ke dalam komponen nilai rapor siswa.

### 6. 📅 Presensi & Absensi Mandiri
* Formulir presensi harian: pilihan status **Hadir**, **Izin**, **Sakit**, dan **Alpa** disertai kolom catatan/keterangan.
* Kartu rekapitulasi persentase kehadiran semester dengan indikator syarat kehadiran UAS (minimal 75%).
* Tabel riwayat kehadiran lengkap dengan tanggal dan waktu presensi.

### 7. 🎓 Rekapitulasi Nilai & Rapor Digital
* Transkrip nilai mata pelajaran dengan formula pembobotan akademik:
  $$\text{Nilai Akhir} = (\text{Tugas} \times 30\%) + (\text{Kuis} \times 20\%) + (\text{UTS} \times 25\%) + (\text{UAS} \times 25\%)$$
* Penentuan otomatis **Predikat (A, B, C, D)** dan status kelulusan KKM (Tuntas / Remedial).
* Perhitungan rata-rata nilai akhir keseluruhan.
* Tombol **Cetak Rapor** yang sudah dioptimalkan untuk tampilan cetak/PDF (`window.print()`).

---

## 🛠️ Teknologi yang Digunakan
* **HTML5**: Struktur semantik modern (`<aside>`, `<header>`, `<main>`, `<section>`, `<nav>`).
* **Tailwind CSS (via CDN)**: Desain antarmuka *clean*, tipografi modern, palette warna kontras lembut, dan tata letak responsif.
* **Bootstrap Icons**: Ikonografi antarmuka yang lengkap dan elegan.
* **Vanilla JavaScript (ES6+)**: Logika aplikasi murni tanpa framework JS berat (DOM manipulation, LocalStorage sync, timer engine, event listeners).
* **CSS Custom (`css/style.css`)**: Kustomisasi *scrollbar*, efek *glassmorphism*, animasi *fade-in*, serta format cetak lembar rapor.

---

## 📂 Struktur Berkas
```text
Codingan LMS/
│
├── index.html          # Halaman utama aplikasi (Single Page Layout)
├── server.js           # Server lokal Node.js ringan (zero-dependency)
├── README.md           # Dokumentasi lengkap proyek
│
├── css/
│   └── style.css       # Styling tambahan, animasi, dan optimasi print
│
└── js/
    ├── data.js         # Inisialisasi data awal (mock seed data)
    └── app.js          # Logika aplikasi, router tab, engine kuis, & localStorage
```

---

## 💻 Cara Menjalankan Aplikasi

Aplikasi ini dapat dijalankan dengan 2 cara yang sangat mudah:

### Cara 1: Buka Langsung di Browser (Paling Praktis)
1. Buka folder proyek di File Explorer.
2. Klik ganda (double click) pada file `index.html`.
3. Aplikasi akan langsung terbuka dan berjalan sempurna di Google Chrome, Microsoft Edge, Mozilla Firefox, atau peramban lainnya.

### Cara 2: Menggunakan Local Server Node.js
Jika Node.js sudah terpasang di komputer:
1. Buka terminal/PowerShell di folder proyek.
2. Jalankan perintah:
   ```bash
   node server.js
   ```
3. Buka browser dan kunjungi alamat:
   ```
   http://localhost:8080/
   ```

---

## 🔄 Mereset Data ke Kondisi Awal
Jika Anda ingin mengembalikan data ke kondisi semula setelah mencoba menambah materi, mengisi absensi, atau menyelesaikan tugas:
* Klik tombol **"Reset Data Demo"** di bagian bawah menu navigasi sebelah kiri.
* Konfirmasi dialog reset, dan data akan kembali ke setelan default awal.
