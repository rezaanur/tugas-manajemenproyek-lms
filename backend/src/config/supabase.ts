import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  !supabaseUrl.includes('YOUR_SUPABASE') &&
  supabaseUrl.startsWith('https://')
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
  console.log('ℹ️ Supabase credentials belum diisi di .env. Menggunakan Data Store lokal sementara agar aplikasi tetap langsung jalan ("terima jadi").');
}

export const supabase = supabaseInstance;

// In-Memory / Local Fallback Store jika Supabase belum diisi .env
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
