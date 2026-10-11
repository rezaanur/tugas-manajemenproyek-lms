/**
 * Core Application Logic for EduSmart LMS
 * Clean State Architecture: User-input friendly with LocalStorage persistence
 */

// Storage keys (v2 clean storage without mock clutter)
const STORAGE_KEYS = {
  CURRENT_USER: 'edusmart_clean_user',
  MAPEL: 'edusmart_clean_mapel',
  MATERI: 'edusmart_clean_materi',
  TUGAS: 'edusmart_clean_tugas',
  KUIS: 'edusmart_clean_kuis',
  ABSENSI: 'edusmart_clean_absensi',
  NILAI: 'edusmart_clean_nilai'
};

// Global App State
const state = {
  currentUser: null,
  currentView: 'dashboard',
  mapel: [],
  materi: [],
  tugas: [],
  kuis: [],
  absensi: [],
  nilai: [],
  activeQuizSession: null,
  quizTimerInterval: null
};

// Utility: LocalStorage Helpers
function loadStorage(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data !== null ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error loading ${key} from localStorage:`, e);
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

// Toast Notification
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bgColors = {
    success: 'bg-emerald-600 text-white',
    error: 'bg-rose-600 text-white',
    info: 'bg-indigo-600 text-white',
    warning: 'bg-amber-600 text-white'
  };
  const icons = {
    success: '<i class="bi bi-check-circle-fill text-lg"></i>',
    error: '<i class="bi bi-exclamation-triangle-fill text-lg"></i>',
    info: '<i class="bi bi-info-circle-fill text-lg"></i>',
    warning: '<i class="bi bi-bell-fill text-lg"></i>'
  };

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg shadow-slate-200/50 transform transition-all duration-300 ease-out translate-y-2 opacity-0 text-sm font-medium ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `
    <span>${icons[type] || icons.info}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Init State from Storage or Defaults (Clean empty arrays)
function initAppState() {
  state.mapel = loadStorage(STORAGE_KEYS.MAPEL, DEFAULT_MAPEL);
  state.materi = loadStorage(STORAGE_KEYS.MATERI, DEFAULT_MATERI);
  state.tugas = loadStorage(STORAGE_KEYS.TUGAS, DEFAULT_TUGAS);
  state.kuis = loadStorage(STORAGE_KEYS.KUIS, DEFAULT_KUIS);
  state.absensi = loadStorage(STORAGE_KEYS.ABSENSI, DEFAULT_ABSENSI);
  state.nilai = loadStorage(STORAGE_KEYS.NILAI, DEFAULT_NILAI);
  
  const savedUser = loadStorage(STORAGE_KEYS.CURRENT_USER, null);
  state.currentUser = savedUser || DEFAULT_USERS[0];
}

// Persist All Collections
function persistAll() {
  saveStorage(STORAGE_KEYS.MAPEL, state.mapel);
  saveStorage(STORAGE_KEYS.MATERI, state.materi);
  saveStorage(STORAGE_KEYS.TUGAS, state.tugas);
  saveStorage(STORAGE_KEYS.KUIS, state.kuis);
  saveStorage(STORAGE_KEYS.ABSENSI, state.absensi);
  saveStorage(STORAGE_KEYS.NILAI, state.nilai);
  saveStorage(STORAGE_KEYS.CURRENT_USER, state.currentUser);
}

// DOM Ready initialization
document.addEventListener('DOMContentLoaded', () => {
  initAppState();
  setupEventListeners();
  updateAuthUI();
  updateClock();
  setInterval(updateClock, 1000);
  navigateTo('dashboard');
});

// Real-time Clock in Navbar
function updateClock() {
  const clockEl = document.getElementById('navbar-clock');
  if (!clockEl) return;
  const now = new Date();
  const options = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
  clockEl.textContent = now.toLocaleDateString('id-ID', options) + ' WIB';
}

// Setup Event Listeners
function setupEventListeners() {
  // Navigation Links
  document.querySelectorAll('[data-view-target]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-view-target');
      navigateTo(target);
      closeMobileSidebar();
    });
  });

  // Mobile Sidebar Toggle
  const sidebarBtn = document.getElementById('btn-toggle-sidebar');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  if (sidebarBtn) {
    sidebarBtn.addEventListener('click', toggleMobileSidebar);
  }
  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', closeMobileSidebar);
  }

  // Quick Role Switcher
  const btnSwitchRole = document.getElementById('btn-switch-role');
  if (btnSwitchRole) {
    btnSwitchRole.addEventListener('click', () => {
      if (state.currentUser.role === 'siswa') {
        state.currentUser = DEFAULT_USERS[1]; // Switch to Guru
        showToast('Beralih ke mode akun: Guru / Dosen Pengajar', 'info');
      } else {
        state.currentUser = DEFAULT_USERS[0]; // Switch to Siswa
        showToast('Beralih ke mode akun: Siswa / Mahasiswa', 'info');
      }
      saveStorage(STORAGE_KEYS.CURRENT_USER, state.currentUser);
      updateAuthUI();
      navigateTo(state.currentView);
    });
  }

  // Edit Profil Trigger
  const btnEditProfil = document.getElementById('btn-edit-profil');
  if (btnEditProfil) {
    btnEditProfil.addEventListener('click', openModalEditProfil);
  }

  // Reset to default clean state
  const btnResetData = document.getElementById('btn-reset-data');
  if (btnResetData) {
    btnResetData.addEventListener('click', () => {
      if (confirm('Bersihkan semua data yang telah diinput dan mulai dari awal (kosong)?')) {
        localStorage.clear();
        state.materi = [];
        state.tugas = [];
        state.kuis = [];
        state.absensi = [];
        state.nilai = [];
        state.mapel = DEFAULT_MAPEL;
        state.currentUser = DEFAULT_USERS[0];
        persistAll();
        updateAuthUI();
        navigateTo('dashboard');
        showToast('Semua data berhasil dibersihkan! Silakan input data baru Anda.', 'info');
      }
    });
  }
}

function toggleMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  sidebar?.classList.toggle('-translate-x-full');
  backdrop?.classList.toggle('hidden');
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  sidebar?.classList.add('-translate-x-full');
  backdrop?.classList.add('hidden');
}

// Update User UI (Sidebar profile, badge, navbar)
function updateAuthUI() {
  const isGuru = state.currentUser.role === 'guru';

  // Sidebar profile
  const avatarEl = document.getElementById('user-avatar');
  const nameEl = document.getElementById('user-name');
  const roleEl = document.getElementById('user-role-badge');
  const subInfoEl = document.getElementById('user-subinfo');
  const schoolEl = document.getElementById('school-display-name');

  if (avatarEl) avatarEl.src = state.currentUser.avatar;
  if (nameEl) nameEl.textContent = state.currentUser.name;
  if (schoolEl && state.currentUser.sekolah) schoolEl.textContent = state.currentUser.sekolah;

  if (roleEl) {
    roleEl.textContent = isGuru ? 'Guru / Dosen' : 'Siswa / Mahasiswa';
    roleEl.className = isGuru 
      ? 'px-2 py-0.5 text-xs font-semibold rounded-full bg-violet-100 text-violet-700'
      : 'px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700';
  }
  if (subInfoEl) {
    subInfoEl.textContent = isGuru ? `NIP: ${state.currentUser.nip || '-'}` : `${state.currentUser.kelas} • NIS/NIM: ${state.currentUser.nis}`;
  }

  // Toggle role-specific action buttons visibility
  document.querySelectorAll('.guru-only').forEach(el => {
    if (isGuru) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });

  document.querySelectorAll('.siswa-only').forEach(el => {
    if (!isGuru) el.classList.remove('hidden');
    else el.classList.add('hidden');
  });
}

// View Router
function navigateTo(viewId) {
  state.currentView = viewId;

  document.querySelectorAll('.app-view').forEach(view => {
    view.classList.add('hidden');
  });

  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) {
    targetView.classList.remove('hidden');
  }

  // Update navigation active states
  document.querySelectorAll('[data-view-target]').forEach(link => {
    const isCurrent = link.getAttribute('data-view-target') === viewId;
    if (isCurrent) {
      link.classList.add('bg-indigo-50', 'text-indigo-600', 'font-semibold');
      link.classList.remove('text-slate-600', 'hover:bg-slate-50');
      link.querySelector('i')?.classList.add('text-indigo-600');
    } else {
      link.classList.remove('bg-indigo-50', 'text-indigo-600', 'font-semibold');
      link.classList.add('text-slate-600', 'hover:bg-slate-50');
      link.querySelector('i')?.classList.remove('text-indigo-600');
    }
  });

  // Breadcrumb / Title
  const breadcrumb = document.getElementById('view-title-breadcrumb');
  const titles = {
    dashboard: 'Dashboard Utama',
    materi: 'Materi Pembelajaran',
    tugas: 'Tugas & Evaluasi',
    kuis: 'Kuis & Latihan Soal',
    absensi: 'Presensi & Kehadiran',
    nilai: 'Rekap Nilai / Rapor'
  };
  if (breadcrumb) {
    breadcrumb.textContent = titles[viewId] || 'EduSmart LMS';
  }

  switch (viewId) {
    case 'dashboard':
      renderDashboard();
      break;
    case 'materi':
      renderMateri();
      break;
    case 'tugas':
      renderTugas();
      break;
    case 'kuis':
      renderKuis();
      break;
    case 'absensi':
      renderAbsensi();
      break;
    case 'nilai':
      renderNilai();
      break;
  }
}

// -------------------------------------------------------------
// 1. DASHBOARD VIEW
// -------------------------------------------------------------
function renderDashboard() {
  const isGuru = state.currentUser.role === 'guru';

  const greetingEl = document.getElementById('dash-greeting-name');
  if (greetingEl) greetingEl.textContent = state.currentUser.name;

  const greetingRoleEl = document.getElementById('dash-greeting-role');
  if (greetingRoleEl) greetingRoleEl.textContent = isGuru ? 'Panel Guru / Dosen' : 'Portal Pembelajaran Siswa / Mahasiswa';

  // Stat Counters
  const countMateri = state.materi.length;
  const countTugas = isGuru 
    ? state.tugas.length 
    : state.tugas.filter(t => t.status === 'Belum Selesai').length;
  
  // Calculate average grade
  let avgNilai = '0';
  if (state.nilai.length > 0) {
    const totalNilaiAkhir = state.nilai.reduce((acc, curr) => {
      const na = (curr.tugas * 0.3) + (curr.kuis * 0.2) + (curr.uts * 0.25) + (curr.uas * 0.25);
      return acc + na;
    }, 0);
    avgNilai = (totalNilaiAkhir / state.nilai.length).toFixed(1);
  }

  // Calculate attendance rate
  let attendanceRate = 0;
  if (state.absensi.length > 0) {
    const hadirCount = state.absensi.filter(a => a.status === 'Hadir').length;
    attendanceRate = Math.round((hadirCount / state.absensi.length) * 100);
  }

  document.getElementById('stat-materi-count').textContent = countMateri;
  document.getElementById('stat-tugas-count').textContent = countTugas;
  document.getElementById('stat-tugas-label').textContent = isGuru ? 'Total Tugas Aktif' : 'Tugas Perlu Dikerjakan';
  document.getElementById('stat-nilai-avg').textContent = avgNilai;
  document.getElementById('stat-absensi-rate').textContent = `${attendanceRate}%`;

  // Upcoming Tasks Widget
  const upcomingTugasContainer = document.getElementById('dash-upcoming-tugas');
  if (upcomingTugasContainer) {
    if (state.tugas.length === 0) {
      upcomingTugasContainer.innerHTML = `
        <div class="py-6 text-center">
          <i class="bi bi-inbox text-3xl text-slate-300 mb-1 block"></i>
          <p class="text-xs text-slate-400">Belum ada tugas.</p>
          <button onclick="openModalTambahTugas()" class="mt-2 text-xs font-semibold text-indigo-600 hover:underline">
            + Tambah Tugas Baru
          </button>
        </div>
      `;
    } else {
      const upcoming = state.tugas.slice(0, 3);
      upcomingTugasContainer.innerHTML = upcoming.map(t => {
        const badgeColors = {
          'Belum Selesai': 'bg-amber-100 text-amber-700',
          'Sudah Dikumpulkan': 'bg-blue-100 text-blue-700',
          'Dinilai': 'bg-emerald-100 text-emerald-700'
        };
        return `
          <div class="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:shadow-sm transition">
            <div class="flex items-start gap-3">
              <div class="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 text-sm font-bold">
                <i class="bi bi-journal-text"></i>
              </div>
              <div>
                <h4 class="text-sm font-semibold text-slate-800 line-clamp-1">${t.title}</h4>
                <p class="text-xs text-slate-500">${t.mapelName} • Batas: ${formatDateTime(t.deadline)}</p>
              </div>
            </div>
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColors[t.status] || 'bg-slate-100 text-slate-600'}">
              ${t.status}
            </span>
          </div>
        `;
      }).join('');
    }
  }

  // Today's schedule widget
  const scheduleContainer = document.getElementById('dash-today-schedule');
  if (scheduleContainer) {
    if (state.mapel.length === 0) {
      scheduleContainer.innerHTML = `
        <div class="py-8 text-center text-xs text-slate-400">
          Belum ada jadwal mata pelajaran. Tambahkan mata pelajaran untuk memulai.
        </div>
      `;
    } else {
      scheduleContainer.innerHTML = state.mapel.slice(0, 3).map((item, idx) => {
        const times = ['08:00 - 09:30 WIB', '09:45 - 11:15 WIB', '12:30 - 14:00 WIB'];
        return `
          <div class="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition">
            <div class="flex items-center gap-3">
              <div class="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold text-center leading-tight">
                ${times[idx] || '08:00 WIB'}
              </div>
              <div>
                <div class="text-sm font-semibold text-slate-800">${item.name}</div>
                <div class="text-xs text-slate-500">${item.guru || 'Dosen Pengampu'}</div>
              </div>
            </div>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
              Terjadwal
            </span>
          </div>
        `;
      }).join('');
    }
  }
}

// -------------------------------------------------------------
// 2. MATERI VIEW
// -------------------------------------------------------------
function renderMateri() {
  const container = document.getElementById('materi-grid');
  const filterSelect = document.getElementById('materi-filter-mapel');
  const searchInput = document.getElementById('materi-search');

  // Populate filter mapel dropdown
  if (filterSelect) {
    filterSelect.innerHTML = '<option value="all">Semua Mata Pelajaran</option>';
    state.mapel.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      filterSelect.appendChild(opt);
    });
  }

  function filterAndDisplay() {
    const selectedMapel = filterSelect?.value || 'all';
    const query = (searchInput?.value || '').toLowerCase().trim();

    const filtered = state.materi.filter(m => {
      const matchMapel = selectedMapel === 'all' || m.mapelId === selectedMapel;
      const matchQuery = m.title.toLowerCase().includes(query) || 
                         m.desc.toLowerCase().includes(query) || 
                         m.mapelName.toLowerCase().includes(query);
      return matchMapel && matchQuery;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
          <i class="bi bi-file-earmark-plus text-4xl text-slate-300 mb-2 block"></i>
          <h4 class="text-base font-semibold text-slate-700">Belum ada materi pembelajaran</h4>
          <p class="text-xs text-slate-400 mb-4">Mulai isi materi modul dokumen (PDF), slide, atau video pembelajaran sendiri.</p>
          <button onclick="openModalTambahMateri()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm">
            <i class="bi bi-plus-lg"></i> Tambah Materi Sekarang
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(m => {
      const typeIcons = {
        PDF: { icon: 'bi-file-earmark-pdf-fill', color: 'text-rose-500 bg-rose-50' },
        VIDEO: { icon: 'bi-play-circle-fill', color: 'text-indigo-500 bg-indigo-50' },
        SLIDE: { icon: 'bi-file-earmark-slides-fill', color: 'text-amber-500 bg-amber-50' }
      };
      const typeStyle = typeIcons[m.type] || { icon: 'bi-file-earmark-text', color: 'text-blue-500 bg-blue-50' };

      return `
        <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-3">
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                ${m.mapelName}
              </span>
              <div class="flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-lg ${typeStyle.color}">
                <i class="bi ${typeStyle.icon}"></i> ${m.type}
              </div>
            </div>

            <h3 class="text-base font-bold text-slate-800 mb-2 line-clamp-2 hover:text-indigo-600 transition cursor-pointer" onclick="openPreviewMateri('${m.id}')">
              ${m.title}
            </h3>
            <p class="text-xs text-slate-500 mb-4 line-clamp-3 leading-relaxed">
              ${m.desc}
            </p>
          </div>

          <div class="pt-4 border-t border-slate-100">
            <div class="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span><i class="bi bi-person mr-1"></i>${m.author}</span>
              <span><i class="bi bi-clock mr-1"></i>${m.size || 'Dokumen'}</span>
            </div>
            
            <div class="flex items-center gap-2">
              <button onclick="openPreviewMateri('${m.id}')" class="flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold transition flex items-center justify-center gap-1.5">
                <i class="bi bi-eye"></i> Baca / Tonton
              </button>
              <button onclick="downloadSimulation('${m.title}')" class="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs transition" title="Unduh Berkas">
                <i class="bi bi-download"></i>
              </button>
              <button onclick="deleteMateri('${m.id}')" class="p-2 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 text-xs transition" title="Hapus Materi">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  if (filterSelect && !filterSelect.dataset.bound) {
    filterSelect.addEventListener('change', filterAndDisplay);
    filterSelect.dataset.bound = 'true';
  }
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.addEventListener('input', filterAndDisplay);
    searchInput.dataset.bound = 'true';
  }

  filterAndDisplay();
}

// Modal Preview Materi
window.openPreviewMateri = function(id) {
  const materi = state.materi.find(m => m.id === id);
  if (!materi) return;

  const modal = document.getElementById('modal-preview-materi');
  document.getElementById('preview-materi-title').textContent = materi.title;
  document.getElementById('preview-materi-mapel').textContent = `${materi.mapelName} • ${materi.type}`;
  document.getElementById('preview-materi-author').textContent = `Diupload oleh: ${materi.author} (${materi.date})`;

  const body = document.getElementById('preview-materi-body');
  if (body) {
    if (materi.type === 'VIDEO') {
      const videoSrc = materi.url.includes('youtube') ? materi.url : 'https://www.youtube.com/embed/dQw4w9WgXcQ';
      body.innerHTML = `
        <div class="aspect-video bg-black rounded-xl overflow-hidden mb-4">
          <iframe class="w-full h-full" src="${videoSrc}" title="${materi.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
        </div>
        <p class="text-sm text-slate-600 leading-relaxed">${materi.desc}</p>
      `;
    } else {
      body.innerHTML = `
        <div class="p-6 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-center">
          <div class="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl mx-auto mb-3">
            <i class="bi bi-file-earmark-pdf"></i>
          </div>
          <h4 class="text-base font-bold text-slate-800 mb-1">${materi.title}</h4>
          <p class="text-xs text-slate-500 mb-4">Format Dokumen digital siap dibaca (${materi.size || 'Modul'})</p>
          <div class="max-w-md mx-auto text-left text-xs bg-white p-4 rounded-lg border border-slate-200 text-slate-600 mb-4 leading-relaxed">
            <p class="font-semibold text-slate-700 mb-1">Ringkasan Dokumen:</p>
            ${materi.desc}
          </div>
          <button onclick="downloadSimulation('${materi.title}')" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-sm transition">
            <i class="bi bi-download"></i> Unduh Dokumen Lengkap
          </button>
        </div>
      `;
    }
  }

  modal?.classList.remove('hidden');
};

window.closePreviewMateri = function() {
  document.getElementById('modal-preview-materi')?.classList.add('hidden');
};

window.downloadSimulation = function(title) {
  showToast(`Mengunduh berkas: "${title}"...`, 'info');
};

// Modal Tambah Materi
window.openModalTambahMateri = function() {
  const modal = document.getElementById('modal-tambah-materi');
  const select = document.getElementById('tambah-materi-mapel');
  if (select) {
    select.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';
    state.mapel.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      select.appendChild(opt);
    });
  }
  modal?.classList.remove('hidden');
};

window.closeModalTambahMateri = function() {
  document.getElementById('modal-tambah-materi')?.classList.add('hidden');
};

window.submitTambahMateri = function(e) {
  e.preventDefault();
  const mapelId = document.getElementById('tambah-materi-mapel').value;
  const title = document.getElementById('tambah-materi-title').value.trim();
  const type = document.getElementById('tambah-materi-type').value;
  const desc = document.getElementById('tambah-materi-desc').value.trim();

  if (!mapelId || !title || !desc) {
    showToast('Mohon lengkapi semua kolom materi!', 'warning');
    return;
  }

  const mapelObj = state.mapel.find(m => m.id === mapelId);
  const newMateri = {
    id: 'mat-' + Date.now(),
    mapelId: mapelId,
    mapelName: mapelObj ? mapelObj.name : 'Mata Pelajaran',
    title: title,
    desc: desc,
    type: type,
    size: type === 'VIDEO' ? '15 Menit' : '2.4 MB',
    date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    author: state.currentUser.name,
    url: '#'
  };

  state.materi.unshift(newMateri);
  persistAll();
  closeModalTambahMateri();
  renderMateri();
  showToast('Materi baru berhasil ditambahkan!');
};

window.deleteMateri = function(id) {
  if (confirm('Hapus materi ini?')) {
    state.materi = state.materi.filter(m => m.id !== id);
    persistAll();
    renderMateri();
    showToast('Materi berhasil dihapus!', 'info');
  }
};

// -------------------------------------------------------------
// 3. TUGAS VIEW
// -------------------------------------------------------------
let currentTugasTab = 'all';

function renderTugas() {
  const container = document.getElementById('tugas-list-container');
  const isGuru = state.currentUser.role === 'guru';

  document.querySelectorAll('[data-tugas-tab]').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('[data-tugas-tab]').forEach(b => {
        b.classList.remove('bg-indigo-600', 'text-white');
        b.classList.add('bg-white', 'text-slate-600', 'border', 'border-slate-200');
      });
      btn.classList.add('bg-indigo-600', 'text-white');
      btn.classList.remove('bg-white', 'text-slate-600', 'border', 'border-slate-200');
      currentTugasTab = btn.getAttribute('data-tugas-tab');
      renderTugas();
    };
  });

  const filtered = state.tugas.filter(t => {
    if (currentTugasTab === 'all') return true;
    if (currentTugasTab === 'pending') return t.status === 'Belum Selesai';
    if (currentTugasTab === 'submitted') return t.status === 'Sudah Dikumpulkan';
    if (currentTugasTab === 'graded') return t.status === 'Dinilai';
    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="py-12 text-center bg-white rounded-2xl border border-slate-200">
        <i class="bi bi-journal-plus text-4xl text-slate-300 mb-2 block"></i>
        <h4 class="text-base font-semibold text-slate-700">Belum ada tugas</h4>
        <p class="text-xs text-slate-400 mb-4">Tambahkan tugas baru untuk menguji fitur pengumpulan dan penilaian tugas.</p>
        <button onclick="openModalTambahTugas()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm">
          <i class="bi bi-plus-lg"></i> Tambah Tugas Baru
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(t => {
    const badgeColors = {
      'Belum Selesai': 'bg-amber-100 text-amber-800 border-amber-200',
      'Sudah Dikumpulkan': 'bg-blue-100 text-blue-800 border-blue-200',
      'Dinilai': 'bg-emerald-100 text-emerald-800 border-emerald-200'
    };

    return `
      <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2 mb-1.5 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                ${t.mapelName}
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColors[t.status]}">
                ${t.status}
              </span>
              ${t.score !== null ? `
                <span class="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white">
                  Nilai: ${t.score} / 100
                </span>
              ` : ''}
            </div>
            <h3 class="text-lg font-bold text-slate-800">${t.title}</h3>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            ${!isGuru ? `
              ${t.status === 'Belum Selesai' ? `
                <button onclick="openModalSubmitTugas('${t.id}')" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm">
                  <i class="bi bi-upload"></i> Kumpulkan Tugas
                </button>
              ` : `
                <button onclick="openModalSubmitTugas('${t.id}')" class="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5">
                  <i class="bi bi-eye"></i> Detail Pengumpulan
                </button>
              `}
            ` : `
              <button onclick="openModalNilaiTugasGuru('${t.id}')" class="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-sm">
                <i class="bi bi-pencil-square"></i> Beri Nilai
              </button>
            `}
            <button onclick="deleteTugas('${t.id}')" class="p-2 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 text-xs transition" title="Hapus Tugas">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>

        <div class="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div class="md:col-span-2">
            <p class="text-slate-600 leading-relaxed mb-3">${t.desc}</p>
            ${t.submittedFile ? `
              <div class="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <i class="bi bi-paperclip text-lg text-indigo-600"></i>
                <div class="flex-1 truncate">
                  <div class="font-semibold text-slate-700 truncate">${t.submittedFile}</div>
                  <div class="text-[11px] text-slate-400">Dikumpulkan pada: ${t.submittedAt || '-'}</div>
                </div>
              </div>
            ` : ''}
            ${t.feedback ? `
              <div class="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                <span class="font-semibold">Catatan Guru:</span> ${t.feedback}
              </div>
            ` : ''}
          </div>

          <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex flex-col justify-center space-y-2">
            <div class="flex items-center justify-between text-slate-500">
              <span>Batas Waktu:</span>
              <span class="font-semibold text-rose-600">${formatDateTime(t.deadline)}</span>
            </div>
            <div class="flex items-center justify-between text-slate-500">
              <span>Status:</span>
              <span class="font-semibold text-slate-700">${t.status}</span>
            </div>
            <div class="flex items-center justify-between text-slate-500">
              <span>Pengumpulan:</span>
              <span class="font-semibold text-slate-700">${t.submittedAt ? 'Tepat Waktu' : 'Menunggu'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Modal Tambah Tugas Baru
window.openModalTambahTugas = function() {
  const modal = document.getElementById('modal-tambah-tugas');
  const select = document.getElementById('tambah-tugas-mapel');
  if (select) {
    select.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';
    state.mapel.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      select.appendChild(opt);
    });
  }

  // Set default deadline tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 3);
  const deadlineInput = document.getElementById('tambah-tugas-deadline');
  if (deadlineInput) {
    deadlineInput.value = tomorrow.toISOString().slice(0, 16);
  }

  modal?.classList.remove('hidden');
};

window.closeModalTambahTugas = function() {
  document.getElementById('modal-tambah-tugas')?.classList.add('hidden');
};

window.submitTambahTugas = function(e) {
  e.preventDefault();
  const mapelId = document.getElementById('tambah-tugas-mapel').value;
  const title = document.getElementById('tambah-tugas-title').value.trim();
  const deadline = document.getElementById('tambah-tugas-deadline').value;
  const desc = document.getElementById('tambah-tugas-desc').value.trim();

  if (!mapelId || !title || !desc) {
    showToast('Mohon lengkapi semua kolom tugas!', 'warning');
    return;
  }

  const mapelObj = state.mapel.find(m => m.id === mapelId);
  const newTugas = {
    id: 'tug-' + Date.now(),
    mapelId: mapelId,
    mapelName: mapelObj ? mapelObj.name : 'Mata Pelajaran',
    title: title,
    desc: desc,
    deadline: deadline,
    status: 'Belum Selesai',
    submittedAt: null,
    submittedFile: null,
    submittedNote: '',
    score: null,
    feedback: null
  };

  state.tugas.unshift(newTugas);
  persistAll();
  closeModalTambahTugas();
  renderTugas();
  showToast('Tugas baru berhasil dibuat!');
};

window.deleteTugas = function(id) {
  if (confirm('Hapus tugas ini?')) {
    state.tugas = state.tugas.filter(t => t.id !== id);
    persistAll();
    renderTugas();
    showToast('Tugas berhasil dihapus!', 'info');
  }
};

// Modal Kumpulkan Tugas (Siswa)
let activeSubmittingTugasId = null;

window.openModalSubmitTugas = function(id) {
  activeSubmittingTugasId = id;
  const tugas = state.tugas.find(t => t.id === id);
  if (!tugas) return;

  const modal = document.getElementById('modal-submit-tugas');
  document.getElementById('submit-tugas-title').textContent = tugas.title;
  document.getElementById('submit-tugas-mapel').textContent = `${tugas.mapelName} • Batas: ${formatDateTime(tugas.deadline)}`;
  document.getElementById('submit-tugas-instructions').textContent = tugas.desc;

  const noteInput = document.getElementById('submit-tugas-note');
  if (noteInput) noteInput.value = tugas.submittedNote || '';

  const fileInfo = document.getElementById('submit-tugas-prev-file');
  if (fileInfo) {
    if (tugas.submittedFile) {
      fileInfo.innerHTML = `
        <div class="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-xs flex items-center justify-between">
          <span><i class="bi bi-file-earmark-check mr-1"></i> File terunggah: <strong>${tugas.submittedFile}</strong></span>
          <span class="text-[11px]">${tugas.submittedAt}</span>
        </div>
      `;
    } else {
      fileInfo.innerHTML = '';
    }
  }

  modal?.classList.remove('hidden');
};

window.closeModalSubmitTugas = function() {
  document.getElementById('modal-submit-tugas')?.classList.add('hidden');
};

window.saveTugasSubmission = function(e) {
  e.preventDefault();
  const tugas = state.tugas.find(t => t.id === activeSubmittingTugasId);
  if (!tugas) return;

  const fileInput = document.getElementById('submit-tugas-file');
  const noteInput = document.getElementById('submit-tugas-note');

  let fileName = tugas.submittedFile;
  if (fileInput && fileInput.files && fileInput.files[0]) {
    fileName = fileInput.files[0].name;
  } else if (!fileName) {
    fileName = `Tugas_${tugas.mapelName.replace(/\s+/g, '')}_${state.currentUser.name.replace(/\s+/g, '')}.pdf`;
  }

  const now = new Date();
  tugas.status = 'Sudah Dikumpulkan';
  tugas.submittedAt = now.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB';
  tugas.submittedFile = fileName;
  tugas.submittedNote = noteInput?.value.trim() || 'Tugas telah dikumpulkan';

  persistAll();
  closeModalSubmitTugas();
  renderTugas();
  showToast('Tugas Anda berhasil dikirim ke guru!');
};

// Modal Guru: Nilai Tugas
let activeGradingTugasId = null;

window.openModalNilaiTugasGuru = function(id) {
  activeGradingTugasId = id;
  const tugas = state.tugas.find(t => t.id === id);
  if (!tugas) return;

  const modal = document.getElementById('modal-nilai-guru');
  document.getElementById('nilai-guru-title').textContent = tugas.title;
  document.getElementById('nilai-guru-student').textContent = `Siswa: ${state.currentUser.name}`;
  document.getElementById('nilai-guru-file').textContent = tugas.submittedFile || 'Belum ada file terlampir';
  document.getElementById('nilai-guru-note').textContent = tugas.submittedNote || '-';

  const scoreInput = document.getElementById('nilai-guru-score');
  const feedbackInput = document.getElementById('nilai-guru-feedback');

  if (scoreInput) scoreInput.value = tugas.score !== null ? tugas.score : '';
  if (feedbackInput) feedbackInput.value = tugas.feedback || '';

  modal?.classList.remove('hidden');
};

window.closeModalNilaiGuru = function() {
  document.getElementById('modal-nilai-guru')?.classList.add('hidden');
};

window.saveNilaiGuru = function(e) {
  e.preventDefault();
  const tugas = state.tugas.find(t => t.id === activeGradingTugasId);
  if (!tugas) return;

  const scoreInput = document.getElementById('nilai-guru-score');
  const feedbackInput = document.getElementById('nilai-guru-feedback');

  const score = parseInt(scoreInput.value, 10);
  if (isNaN(score) || score < 0 || score > 100) {
    showToast('Masukkan nilai yang valid (rentang 0 - 100)', 'warning');
    return;
  }

  tugas.score = score;
  tugas.feedback = feedbackInput.value.trim() || 'Telah dievaluasi oleh guru.';
  tugas.status = 'Dinilai';

  // Sinkronkan ke tabel nilai siswa jika mapel cocok
  const nilaiRecord = state.nilai.find(n => n.mapelId === tugas.mapelId);
  if (nilaiRecord) {
    nilaiRecord.tugas = score;
  }

  persistAll();
  closeModalNilaiGuru();
  renderTugas();
  showToast(`Nilai ${score} berhasil disimpan dan disinkronkan ke rapor!`);
};

// -------------------------------------------------------------
// 4. KUIS VIEW & INTERACTIVE QUIZ ENGINE
// -------------------------------------------------------------
function renderKuis() {
  const container = document.getElementById('kuis-list-container');
  if (!container) return;

  if (state.kuis.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200">
        <i class="bi bi-patch-question text-4xl text-slate-300 mb-2 block"></i>
        <h4 class="text-base font-semibold text-slate-700">Belum ada kuis interaktif</h4>
        <p class="text-xs text-slate-400 mb-4">Buat kuis latihan sendiri dengan pertanyaan pilihan ganda, timer hitung mundur, dan pembahasan otomatis.</p>
        <button onclick="openModalBuatKuis()" class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition inline-flex items-center gap-1.5 shadow-sm">
          <i class="bi bi-plus-lg"></i> Buat Kuis Baru
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = state.kuis.map(q => {
    const isCompleted = q.status === 'Sudah Dikerjakan' && q.lastScore !== null;
    return `
      <div class="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
              ${q.mapelName}
            </span>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold ${isCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">
                ${q.status}
              </span>
              <button onclick="deleteKuis('${q.id}')" class="text-slate-400 hover:text-rose-600 text-xs transition p-1" title="Hapus Kuis">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>

          <h3 class="text-base font-bold text-slate-800 mb-2">${q.title}</h3>
          
          <div class="flex items-center gap-4 text-xs text-slate-500 mb-4">
            <span><i class="bi bi-clock mr-1 text-slate-400"></i> ${q.durationMinutes} Menit</span>
            <span><i class="bi bi-question-circle mr-1 text-slate-400"></i> ${q.questions?.length || 0} Soal Pilihan Ganda</span>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-100">
          ${isCompleted ? `
            <div class="flex items-center justify-between mb-3 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-xs">
              <span class="text-emerald-800 font-semibold">Skor Terakhir:</span>
              <span class="text-base font-extrabold text-emerald-700">${q.lastScore} / 100</span>
            </div>
            <button onclick="startQuizRunner('${q.id}')" class="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition flex items-center justify-center gap-1.5">
              <i class="bi bi-arrow-repeat"></i> Kerjakan Ulang Kuis
            </button>
          ` : `
            <button onclick="startQuizRunner('${q.id}')" class="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-sm">
              <i class="bi bi-play-fill text-base"></i> Mulai Kerjakan Sekarang
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

// Modal Buat Kuis Baru
window.openModalBuatKuis = function() {
  const modal = document.getElementById('modal-buat-kuis');
  const select = document.getElementById('buat-kuis-mapel');
  if (select) {
    select.innerHTML = '<option value="">Pilih Mata Pelajaran</option>';
    state.mapel.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.id;
      opt.textContent = m.name;
      select.appendChild(opt);
    });
  }
  modal?.classList.remove('hidden');
};

window.closeModalBuatKuis = function() {
  document.getElementById('modal-buat-kuis')?.classList.add('hidden');
};

window.submitBuatKuis = function(e) {
  e.preventDefault();
  const mapelId = document.getElementById('buat-kuis-mapel').value;
  const title = document.getElementById('buat-kuis-title').value.trim();
  const duration = parseInt(document.getElementById('buat-kuis-duration').value, 10) || 5;

  const q1Text = document.getElementById('buat-kuis-q1-text').value.trim();
  const q1OptA = document.getElementById('buat-kuis-q1-optA').value.trim();
  const q1OptB = document.getElementById('buat-kuis-q1-optB').value.trim();
  const q1OptC = document.getElementById('buat-kuis-q1-optC').value.trim();
  const q1OptD = document.getElementById('buat-kuis-q1-optD').value.trim();
  const q1Correct = parseInt(document.getElementById('buat-kuis-q1-correct').value, 10);
  const q1Exp = document.getElementById('buat-kuis-q1-exp').value.trim();

  if (!mapelId || !title || !q1Text || !q1OptA || !q1OptB) {
    showToast('Mohon lengkapi judul kuis dan minimal pertanyaan pertama!', 'warning');
    return;
  }

  const mapelObj = state.mapel.find(m => m.id === mapelId);
  const questions = [
    {
      id: 1,
      question: q1Text,
      options: [q1OptA, q1OptB, q1OptC, q1OptD],
      correctIndex: q1Correct,
      explanation: q1Exp || 'Jawaban telah diverifikasi oleh pembuat kuis.'
    }
  ];

  // Optional Q2 check
  const q2Text = document.getElementById('buat-kuis-q2-text')?.value.trim();
  if (q2Text) {
    const q2OptA = document.getElementById('buat-kuis-q2-optA').value.trim();
    const q2OptB = document.getElementById('buat-kuis-q2-optB').value.trim();
    const q2OptC = document.getElementById('buat-kuis-q2-optC').value.trim();
    const q2OptD = document.getElementById('buat-kuis-q2-optD').value.trim();
    const q2Correct = parseInt(document.getElementById('buat-kuis-q2-correct').value, 10);
    const q2Exp = document.getElementById('buat-kuis-q2-exp').value.trim();

    questions.push({
      id: 2,
      question: q2Text,
      options: [q2OptA, q2OptB, q2OptC, q2OptD],
      correctIndex: q2Correct,
      explanation: q2Exp || 'Kunci jawaban nomor 2.'
    });
  }

  const newKuis = {
    id: 'quiz-' + Date.now(),
    mapelId: mapelId,
    mapelName: mapelObj ? mapelObj.name : 'Mata Pelajaran',
    title: title,
    durationMinutes: duration,
    questionsCount: questions.length,
    status: 'Tersedia',
    lastScore: null,
    lastCompletedAt: null,
    questions: questions
  };

  state.kuis.unshift(newKuis);
  persistAll();
  closeModalBuatKuis();
  renderKuis();
  showToast('Kuis baru berhasil dibuat dan siap dikerjakan!');
};

window.deleteKuis = function(id) {
  if (confirm('Hapus kuis ini?')) {
    state.kuis = state.kuis.filter(q => q.id !== id);
    persistAll();
    renderKuis();
    showToast('Kuis berhasil dihapus!', 'info');
  }
};

// Interactive Quiz Runner Engine
window.startQuizRunner = function(quizId) {
  const quiz = state.kuis.find(q => q.id === quizId);
  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    showToast('Soal kuis tidak ditemukan!', 'error');
    return;
  }

  state.activeQuizSession = {
    quizId: quizId,
    quizTitle: quiz.title,
    questions: quiz.questions,
    currentIndex: 0,
    userAnswers: {},
    timeRemainingSeconds: quiz.durationMinutes * 60
  };

  const modal = document.getElementById('modal-quiz-runner');
  document.getElementById('quiz-runner-title').textContent = quiz.title;
  modal?.classList.remove('hidden');

  renderQuizQuestion();
  startQuizTimer();
};

function renderQuizQuestion() {
  const session = state.activeQuizSession;
  if (!session) return;

  const q = session.questions[session.currentIndex];
  const total = session.questions.length;

  document.getElementById('quiz-progress-text').textContent = `Soal ${session.currentIndex + 1} dari ${total}`;
  const progressPercent = ((session.currentIndex + 1) / total) * 100;
  document.getElementById('quiz-progress-bar').style.width = `${progressPercent}%`;

  const questionBox = document.getElementById('quiz-question-box');
  if (!questionBox) return;

  const currentAnswer = session.userAnswers[q.id];

  questionBox.innerHTML = `
    <div class="mb-5">
      <span class="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1 block">Pertanyaan #${session.currentIndex + 1}</span>
      <h3 class="text-base md:text-lg font-bold text-slate-800 leading-snug">${q.question}</h3>
    </div>

    <div class="space-y-3">
      ${q.options.map((opt, idx) => {
        const isSelected = currentAnswer === idx;
        const letter = String.fromCharCode(65 + idx);
        return `
          <div onclick="selectQuizAnswer(${q.id}, ${idx})" class="p-3.5 rounded-xl border cursor-pointer transition flex items-center gap-3 ${
            isSelected 
              ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-semibold ring-2 ring-indigo-600/20' 
              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
          }">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
              isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
            }">
              ${letter}
            </div>
            <div class="text-sm">${opt}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  const btnPrev = document.getElementById('quiz-btn-prev');
  const btnNext = document.getElementById('quiz-btn-next');
  const btnSubmit = document.getElementById('quiz-btn-submit');

  if (btnPrev) {
    btnPrev.disabled = session.currentIndex === 0;
    btnPrev.className = session.currentIndex === 0 
      ? 'px-4 py-2 rounded-xl text-slate-300 cursor-not-allowed text-xs font-semibold' 
      : 'px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold';
  }

  if (session.currentIndex === total - 1) {
    btnNext?.classList.add('hidden');
    btnSubmit?.classList.remove('hidden');
  } else {
    btnNext?.classList.remove('hidden');
    btnSubmit?.classList.add('hidden');
  }
}

window.selectQuizAnswer = function(questionId, optionIndex) {
  if (!state.activeQuizSession) return;
  state.activeQuizSession.userAnswers[questionId] = optionIndex;
  renderQuizQuestion();
};

window.quizNavNext = function() {
  if (!state.activeQuizSession) return;
  if (state.activeQuizSession.currentIndex < state.activeQuizSession.questions.length - 1) {
    state.activeQuizSession.currentIndex++;
    renderQuizQuestion();
  }
};

window.quizNavPrev = function() {
  if (!state.activeQuizSession) return;
  if (state.activeQuizSession.currentIndex > 0) {
    state.activeQuizSession.currentIndex--;
    renderQuizQuestion();
  }
};

function startQuizTimer() {
  clearInterval(state.quizTimerInterval);
  const timerEl = document.getElementById('quiz-timer-display');

  state.quizTimerInterval = setInterval(() => {
    if (!state.activeQuizSession) {
      clearInterval(state.quizTimerInterval);
      return;
    }

    state.activeQuizSession.timeRemainingSeconds--;
    const mins = Math.floor(state.activeQuizSession.timeRemainingSeconds / 60);
    const secs = state.activeQuizSession.timeRemainingSeconds % 60;
    
    if (timerEl) {
      timerEl.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    if (state.activeQuizSession.timeRemainingSeconds <= 0) {
      clearInterval(state.quizTimerInterval);
      alert('Waktu pengerjaan kuis telah habis!');
      finishQuiz();
    }
  }, 1000);
}

window.finishQuiz = function() {
  clearInterval(state.quizTimerInterval);
  const session = state.activeQuizSession;
  if (!session) return;

  let correctCount = 0;
  session.questions.forEach(q => {
    if (session.userAnswers[q.id] === q.correctIndex) {
      correctCount++;
    }
  });

  const finalScore = Math.round((correctCount / session.questions.length) * 100);

  const targetQuiz = state.kuis.find(q => q.id === session.quizId);
  if (targetQuiz) {
    targetQuiz.status = 'Sudah Dikerjakan';
    targetQuiz.lastScore = finalScore;
    targetQuiz.lastCompletedAt = new Date().toLocaleDateString('id-ID');

    // Update grade in Nilai table if mapel matches
    const targetNilai = state.nilai.find(n => n.mapelId === targetQuiz.mapelId);
    if (targetNilai) {
      targetNilai.kuis = finalScore;
    }
  }

  persistAll();
  document.getElementById('modal-quiz-runner')?.classList.add('hidden');
  showQuizResultModal(session, correctCount, finalScore);
  renderKuis();
};

function showQuizResultModal(session, correctCount, score) {
  const modal = document.getElementById('modal-quiz-result');
  document.getElementById('result-quiz-title').textContent = session.quizTitle;
  document.getElementById('result-score-val').textContent = `${score}`;
  document.getElementById('result-correct-info').textContent = `${correctCount} dari ${session.questions.length} Soal Terjawab Benar`;

  const reviewBox = document.getElementById('result-quiz-review');
  if (reviewBox) {
    reviewBox.innerHTML = session.questions.map((q, idx) => {
      const userChoice = session.userAnswers[q.id];
      const isCorrect = userChoice === q.correctIndex;
      return `
        <div class="p-3.5 rounded-xl border ${isCorrect ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/50'} text-xs">
          <div class="flex items-center justify-between mb-1 font-semibold">
            <span class="text-slate-800">Soal #${idx + 1}</span>
            <span class="${isCorrect ? 'text-emerald-700' : 'text-rose-700'}">
              <i class="bi ${isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i> ${isCorrect ? 'Benar' : 'Kurang Tepat'}
            </span>
          </div>
          <p class="text-slate-700 mb-2">${q.question}</p>
          <div class="text-[11px] text-slate-500 mb-1">
            Jawaban Anda: <strong class="${isCorrect ? 'text-emerald-700' : 'text-rose-700'}">${userChoice !== undefined ? q.options[userChoice] : '(Tidak dijawab)'}</strong>
          </div>
          ${!isCorrect ? `
            <div class="text-[11px] text-emerald-700 mb-1">
              Kunci Jawaban: <strong>${q.options[q.correctIndex]}</strong>
            </div>
          ` : ''}
          <div class="mt-1 text-[11px] text-slate-500 bg-white/70 p-2 rounded border border-slate-200">
            <em>Penjelasan:</em> ${q.explanation}
          </div>
        </div>
      `;
    }).join('');
  }

  modal?.classList.remove('hidden');
}

window.closeQuizResult = function() {
  document.getElementById('modal-quiz-result')?.classList.add('hidden');
  state.activeQuizSession = null;
};

// -------------------------------------------------------------
// 5. ABSENSI VIEW
// -------------------------------------------------------------
function renderAbsensi() {
  const container = document.getElementById('absensi-table-body');
  const selectMapel = document.getElementById('absen-mapel');

  if (selectMapel) {
    selectMapel.innerHTML = '';
    state.mapel.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.name;
      opt.textContent = `${m.name} (${m.guru || 'Sesi Kelas'})`;
      selectMapel.appendChild(opt);
    });
  }

  const total = state.absensi.length;
  const hadir = state.absensi.filter(a => a.status === 'Hadir').length;
  const izin = state.absensi.filter(a => a.status === 'Izin').length;
  const sakit = state.absensi.filter(a => a.status === 'Sakit').length;
  const alpa = state.absensi.filter(a => a.status === 'Alpa').length;

  const rate = total ? Math.round((hadir / total) * 100) : 0;

  document.getElementById('absensi-stat-rate').textContent = `${rate}%`;
  document.getElementById('absensi-stat-hadir').textContent = hadir;
  document.getElementById('absensi-stat-izin').textContent = izin;
  document.getElementById('absensi-stat-sakit').textContent = sakit;
  document.getElementById('absensi-stat-alpa').textContent = alpa;

  if (state.absensi.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-xs text-slate-400">
          Belum ada catatan presensi. Gunakan formulir di sebelah kiri untuk mengisi presensi mandiri Anda hari ini.
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = state.absensi.map(row => {
    const statusBadges = {
      Hadir: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      Izin: 'bg-blue-100 text-blue-800 border-blue-200',
      Sakit: 'bg-amber-100 text-amber-800 border-amber-200',
      Alpa: 'bg-rose-100 text-rose-800 border-rose-200'
    };

    return `
      <tr class="hover:bg-slate-50 transition border-b border-slate-100">
        <td class="py-3 px-4 text-xs font-medium text-slate-800">${formatDateIndo(row.date)}</td>
        <td class="py-3 px-4 text-xs font-semibold text-slate-800">${row.mapel}</td>
        <td class="py-3 px-4 text-xs text-slate-500">${row.waktu || '08:00 WIB'}</td>
        <td class="py-3 px-4 text-xs">
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusBadges[row.status] || 'bg-slate-100'}">
            ${row.status}
          </span>
        </td>
        <td class="py-3 px-4 text-xs text-slate-500">${row.keterangan || '-'}</td>
        <td class="py-3 px-2 text-xs text-right">
          <button onclick="deleteAbsensi('${row.id}')" class="text-slate-400 hover:text-rose-600 p-1" title="Hapus Presensi">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

window.submitAbsensiHariIni = function(e) {
  e.preventDefault();
  const mapel = document.getElementById('absen-mapel').value;
  const status = document.querySelector('input[name="absen-status"]:checked')?.value || 'Hadir';
  const keterangan = document.getElementById('absen-keterangan').value.trim() || 'Presensi digital mandiri';

  if (!mapel) {
    showToast('Pilih mata pelajaran untuk presensi!', 'warning');
    return;
  }

  const todayStr = new Date().toISOString().split('T')[0];

  const newAbsen = {
    id: 'abs-' + Date.now(),
    date: todayStr,
    mapel: mapel,
    waktu: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    status: status,
    keterangan: keterangan
  };

  state.absensi.unshift(newAbsen);
  persistAll();
  renderAbsensi();
  showToast(`Presensi (${status}) untuk ${mapel} berhasil disimpan!`);
};

window.deleteAbsensi = function(id) {
  if (confirm('Hapus riwayat presensi ini?')) {
    state.absensi = state.absensi.filter(a => a.id !== id);
    persistAll();
    renderAbsensi();
    showToast('Presensi berhasil dihapus!', 'info');
  }
};

// -------------------------------------------------------------
// 6. NILAI / RAPOR VIEW
// -------------------------------------------------------------
function renderNilai() {
  const container = document.getElementById('nilai-table-body');
  if (!container) return;

  // Student header update
  const studentNameEl = document.getElementById('rapor-student-name');
  const studentInfoEl = document.getElementById('rapor-student-info');
  if (studentNameEl) studentNameEl.textContent = state.currentUser.name;
  if (studentInfoEl) studentInfoEl.textContent = `NIS/NIM: ${state.currentUser.nis} • ${state.currentUser.kelas} • ${state.currentUser.sekolah || 'SMA/Kampus'}`;

  if (state.nilai.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="11" class="py-10 text-center text-xs text-slate-400">
          Belum ada rekap nilai mata pelajaran. Klik tombol <strong>"Input Nilai Baru"</strong> di atas untuk memasukkan nilai sendiri.
        </td>
      </tr>
    `;
    document.getElementById('rapor-avg-score').textContent = '0';
    document.getElementById('rapor-avg-grade').textContent = '-';
    return;
  }

  let sumNilaiAkhir = 0;

  container.innerHTML = state.nilai.map((n, idx) => {
    const nilaiAkhir = Math.round((n.tugas * 0.3) + (n.kuis * 0.2) + (n.uts * 0.25) + (n.uas * 0.25));
    sumNilaiAkhir += nilaiAkhir;

    let predikat = 'D';
    let statusBadge = 'bg-rose-100 text-rose-800';

    if (nilaiAkhir >= 88) {
      predikat = 'A';
      statusBadge = 'bg-emerald-100 text-emerald-800 font-bold';
    } else if (nilaiAkhir >= 78) {
      predikat = 'B';
      statusBadge = 'bg-blue-100 text-blue-800 font-bold';
    } else if (nilaiAkhir >= 70) {
      predikat = 'C';
      statusBadge = 'bg-amber-100 text-amber-800 font-bold';
    }

    const tuntas = nilaiAkhir >= n.kkm;

    return `
      <tr class="hover:bg-slate-50 transition border-b border-slate-100">
        <td class="py-3 px-3 text-xs text-center text-slate-400 font-medium">${idx + 1}</td>
        <td class="py-3 px-4 text-xs font-bold text-slate-800">
          <div>${n.mapelName}</div>
          <div class="text-[11px] font-normal text-slate-400">${n.guru || 'Guru Pengampu'}</div>
        </td>
        <td class="py-3 px-3 text-xs text-center font-semibold text-slate-600">${n.kkm}</td>
        <td class="py-3 px-3 text-xs text-center font-semibold text-slate-700">${n.tugas}</td>
        <td class="py-3 px-3 text-xs text-center font-semibold text-slate-700">${n.kuis}</td>
        <td class="py-3 px-3 text-xs text-center font-semibold text-slate-700">${n.uts}</td>
        <td class="py-3 px-3 text-xs text-center font-semibold text-slate-700">${n.uas}</td>
        <td class="py-3 px-3 text-xs text-center font-extrabold text-indigo-700 text-sm">${nilaiAkhir}</td>
        <td class="py-3 px-3 text-xs text-center">
          <span class="px-2.5 py-0.5 rounded-full text-xs ${statusBadge}">
            ${predikat}
          </span>
        </td>
        <td class="py-3 px-3 text-xs text-center">
          <span class="px-2 py-0.5 rounded-full text-[11px] font-semibold ${tuntas ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}">
            ${tuntas ? 'Tuntas' : 'Remedial'}
          </span>
        </td>
        <td class="py-3 px-2 text-xs text-right">
          <button onclick="deleteNilai('${n.id}')" class="text-slate-400 hover:text-rose-600 p-1" title="Hapus Nilai">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  const avg = (sumNilaiAkhir / state.nilai.length).toFixed(1);
  document.getElementById('rapor-avg-score').textContent = avg;
  
  let gradeLetter = 'B';
  if (avg >= 88) gradeLetter = 'A (Sangat Baik)';
  else if (avg >= 80) gradeLetter = 'B (Baik)';
  else if (avg >= 70) gradeLetter = 'C (Cukup)';
  else gradeLetter = 'D (Kurang)';

  document.getElementById('rapor-avg-grade').textContent = gradeLetter;
}

// Modal Input Nilai Baru
window.openModalInputNilai = function() {
  const modal = document.getElementById('modal-input-nilai');
  const select = document.getElementById('input-nilai-mapel');
  if (select) {
    select.innerHTML = '<option value="">Pilih / Ketik Mata Pelajaran</option>';
    state.mapel.forEach(m => {
      const opt = document.createElement('option');
      opt.value = m.name;
      opt.textContent = m.name;
      select.appendChild(opt);
    });
  }
  modal?.classList.remove('hidden');
};

window.closeModalInputNilai = function() {
  document.getElementById('modal-input-nilai')?.classList.add('hidden');
};

window.submitInputNilai = function(e) {
  e.preventDefault();
  let mapelName = document.getElementById('input-nilai-mapel').value;
  const customMapel = document.getElementById('input-nilai-mapel-custom').value.trim();
  if (customMapel) mapelName = customMapel;

  const guru = document.getElementById('input-nilai-guru').value.trim() || 'Dosen / Guru Pengampu';
  const kkm = parseInt(document.getElementById('input-nilai-kkm').value, 10) || 75;
  const tugas = parseInt(document.getElementById('input-nilai-tugas').value, 10) || 0;
  const kuis = parseInt(document.getElementById('input-nilai-kuis').value, 10) || 0;
  const uts = parseInt(document.getElementById('input-nilai-uts').value, 10) || 0;
  const uas = parseInt(document.getElementById('input-nilai-uas').value, 10) || 0;

  if (!mapelName) {
    showToast('Tentukan nama mata pelajaran!', 'warning');
    return;
  }

  // Also add to mapel list if not present
  if (!state.mapel.some(m => m.name.toLowerCase() === mapelName.toLowerCase())) {
    state.mapel.push({
      id: 'MP-' + Date.now(),
      name: mapelName,
      guru: guru,
      color: 'indigo',
      icon: 'book'
    });
  }

  const newNilai = {
    id: 'nil-' + Date.now(),
    mapelId: 'MP-' + Date.now(),
    mapelName: mapelName,
    guru: guru,
    kkm: kkm,
    tugas: tugas,
    kuis: kuis,
    uts: uts,
    uas: uas
  };

  state.nilai.push(newNilai);
  persistAll();
  closeModalInputNilai();
  renderNilai();
  showToast(`Nilai mata pelajaran "${mapelName}" berhasil ditambahkan ke rapor!`);
};

window.deleteNilai = function(id) {
  if (confirm('Hapus baris nilai mata pelajaran ini?')) {
    state.nilai = state.nilai.filter(n => n.id !== id);
    persistAll();
    renderNilai();
    showToast('Nilai berhasil dihapus dari rapor!', 'info');
  }
};

window.printRapor = function() {
  window.print();
};

// -------------------------------------------------------------
// 7. EDIT PROFIL MODAL
// -------------------------------------------------------------
window.openModalEditProfil = function() {
  const modal = document.getElementById('modal-edit-profil');
  document.getElementById('edit-profil-name').value = state.currentUser.name || '';
  document.getElementById('edit-profil-nis').value = state.currentUser.nis || '';
  document.getElementById('edit-profil-kelas').value = state.currentUser.kelas || '';
  document.getElementById('edit-profil-sekolah').value = state.currentUser.sekolah || '';
  modal?.classList.remove('hidden');
};

window.closeModalEditProfil = function() {
  document.getElementById('modal-edit-profil')?.classList.add('hidden');
};

window.saveEditProfil = function(e) {
  e.preventDefault();
  const name = document.getElementById('edit-profil-name').value.trim();
  const nis = document.getElementById('edit-profil-nis').value.trim();
  const kelas = document.getElementById('edit-profil-kelas').value.trim();
  const sekolah = document.getElementById('edit-profil-sekolah').value.trim();

  if (!name) {
    showToast('Nama pengguna tidak boleh kosong!', 'warning');
    return;
  }

  state.currentUser.name = name;
  state.currentUser.nis = nis;
  state.currentUser.kelas = kelas;
  state.currentUser.sekolah = sekolah;

  persistAll();
  updateAuthUI();
  closeModalEditProfil();
  navigateTo(state.currentView);
  showToast('Profil pengguna berhasil diperbarui!');
};

// -------------------------------------------------------------
// HELPER FORMATTERS
// -------------------------------------------------------------
function formatDateTime(isoString) {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + ' WIB';
  } catch (e) {
    return isoString;
  }
}

function formatDateIndo(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}
