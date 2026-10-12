import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('your-project') &&
  !supabaseUrl.includes('YOUR_SUPABASE') &&
  !supabaseUrl.includes('example') &&
  !supabaseKey.includes('your-supabase') &&
  supabaseUrl.startsWith('https://') &&
  supabaseKey.length > 30
);

let supabaseInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    console.log('✅ Supabase Client initialized successfully with remote cloud database.');
  } catch (err) {
    console.warn('⚠️ Gagal inisialisasi Supabase client:', err);
  }
} else {
  console.log('ℹ️ Menggunakan local store aktif (Supabase credentials belum diisi). Semua fitur langsung aktif tanpa hambatan.');
}

export const supabase = supabaseInstance;

// In-Memory / Local Fallback Store
export const localStore = {
  users: [] as any[],
  courses: [
    { id: 'crs-1', code: 'IF301', name: 'Pemrograman Web', lecturer_name: 'Dr. Siti Aminah, M.Kom', color: 'blue' },
    { id: 'crs-2', code: 'IF302', name: 'Manajemen Proyek Perangkat Lunak', lecturer_name: 'Dr. Siti Aminah, M.Kom', color: 'indigo' },
    { id: 'crs-3', code: 'IF303', name: 'Basis Data Lanjut', lecturer_name: 'Ahmad Fauzi, M.Kom', color: 'emerald' },
    { id: 'crs-4', code: 'IF304', name: 'Kecerdasan Buatan', lecturer_name: 'Prof. Bambang, Ph.D', color: 'violet' }
  ],
  materials: [] as any[],
  assignments: [] as any[],
  submissions: [] as any[],
  quizzes: [] as any[],
  quizQuestions: [] as any[],
  quizAttempts: [] as any[],
  attendances: [] as any[],
  grades: [] as any[]
};
