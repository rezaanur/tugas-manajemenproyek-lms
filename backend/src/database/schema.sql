-- ==============================================================================
-- EDUSMART LMS DATABASE SCHEMA FOR SUPABASE / POSTGRESQL
-- Eksekusi skrip ini di SQL Editor dashboard Supabase Anda
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUM TYPES
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('dosen', 'mahasiswa');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE material_type AS ENUM ('PDF', 'VIDEO', 'SLIDE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE attendance_status AS ENUM ('Hadir', 'Izin', 'Sakit', 'Alpa');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'mahasiswa', -- 'dosen' or 'mahasiswa'
  nim_nip VARCHAR(50) DEFAULT '',
  department VARCHAR(100) DEFAULT 'Teknik Informatika',
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COURSES (MATA KULIAH) TABLE
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  lecturer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  lecturer_name VARCHAR(255) DEFAULT '',
  color VARCHAR(50) DEFAULT 'indigo',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MATERIALS (MATERI PEMBELAJARAN) TABLE
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  course_name VARCHAR(255) DEFAULT '',
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  type VARCHAR(50) DEFAULT 'PDF', -- 'PDF', 'VIDEO', 'SLIDE'
  file_url TEXT DEFAULT '',
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name VARCHAR(255) DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ASSIGNMENTS (TUGAS) TABLE
CREATE TABLE IF NOT EXISTS assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  course_name VARCHAR(255) DEFAULT '',
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  deadline TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SUBMISSIONS (PENGUMPULAN TUGAS OLEH MAHASISWA) TABLE
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  student_name VARCHAR(255) DEFAULT '',
  student_nim VARCHAR(50) DEFAULT '',
  file_name VARCHAR(255) DEFAULT '',
  file_url TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  score NUMERIC(5,2) DEFAULT NULL,
  feedback TEXT DEFAULT '',
  status VARCHAR(50) DEFAULT 'Sudah Dikumpulkan', -- 'Sudah Dikumpulkan', 'Dinilai'
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  graded_at TIMESTAMPTZ DEFAULT NULL,
  UNIQUE(assignment_id, student_id)
);

-- 8. QUIZZES (KUIS) TABLE
CREATE TABLE IF NOT EXISTS quizzes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  course_name VARCHAR(255) DEFAULT '',
  title VARCHAR(255) NOT NULL,
  duration_minutes INT DEFAULT 5,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. QUIZ QUESTIONS (BANK SOAL KUIS) TABLE
CREATE TABLE IF NOT EXISTS quiz_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of string options: ["A", "B", "C", "D"]
  correct_index INT NOT NULL DEFAULT 0,
  explanation TEXT DEFAULT '',
  sort_order INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. QUIZ ATTEMPTS (HASIL PENGERJAAN KUIS OLEH MAHASISWA) TABLE
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  student_name VARCHAR(255) DEFAULT '',
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  user_answers JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. ATTENDANCES (PRESENSI & KEHADIRAN) TABLE
CREATE TABLE IF NOT EXISTS attendances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  course_name VARCHAR(255) NOT NULL,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  time_string VARCHAR(50) DEFAULT '08:00 WIB',
  status VARCHAR(50) NOT NULL DEFAULT 'Hadir', -- 'Hadir', 'Izin', 'Sakit', 'Alpa'
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. GRADES (REKAP NILAI / RAPOR MAHASISWA) TABLE
CREATE TABLE IF NOT EXISTS grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  course_name VARCHAR(255) NOT NULL,
  student_id UUID REFERENCES users(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  student_nim VARCHAR(50) DEFAULT '',
  lecturer_name VARCHAR(255) DEFAULT '',
  kkm INT DEFAULT 75,
  tugas_score NUMERIC(5,2) DEFAULT 0,
  kuis_score NUMERIC(5,2) DEFAULT 0,
  uts_score NUMERIC(5,2) DEFAULT 0,
  uas_score NUMERIC(5,2) DEFAULT 0,
  final_score NUMERIC(5,2) DEFAULT 0,
  grade_letter VARCHAR(5) DEFAULT 'D',
  status VARCHAR(50) DEFAULT 'Remedial', -- 'Tuntas' or 'Remedial'
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_materials_course ON materials(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_attendances_student ON attendances(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);

-- ENABLE ROW LEVEL SECURITY (RLS) FOR SUPABASE SAFETY
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- POLICIES: Allow full access via Express API backend (service_role or authenticated key)
CREATE POLICY "Allow service role full access users" ON users FOR ALL USING (true);
CREATE POLICY "Allow service role full access courses" ON courses FOR ALL USING (true);
CREATE POLICY "Allow service role full access materials" ON materials FOR ALL USING (true);
CREATE POLICY "Allow service role full access assignments" ON assignments FOR ALL USING (true);
CREATE POLICY "Allow service role full access submissions" ON submissions FOR ALL USING (true);
CREATE POLICY "Allow service role full access quizzes" ON quizzes FOR ALL USING (true);
CREATE POLICY "Allow service role full access quiz_questions" ON quiz_questions FOR ALL USING (true);
CREATE POLICY "Allow service role full access quiz_attempts" ON quiz_attempts FOR ALL USING (true);
CREATE POLICY "Allow service role full access attendances" ON attendances FOR ALL USING (true);
CREATE POLICY "Allow service role full access grades" ON grades FOR ALL USING (true);
