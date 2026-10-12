export type UserRole = 'dosen' | 'mahasiswa';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  nimNip?: string;
  department?: string;
  avatarUrl?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  description?: string;
  lecturer_name?: string;
  lecturerName?: string;
  color?: string;
}

export interface Material {
  id: string;
  course_id?: string;
  courseId?: string;
  course_name?: string;
  courseName?: string;
  title: string;
  description: string;
  type?: 'PDF' | 'VIDEO' | 'SLIDE';
  file_url?: string;
  fileUrl?: string;
  author_name?: string;
  uploadedBy?: string;
  created_at?: string;
  createdAt?: string;
}

export interface Assignment {
  id: string;
  course_id?: string;
  courseId?: string;
  course_name?: string;
  courseName?: string;
  title: string;
  description: string;
  deadline?: string;
  dueDate?: string;
  max_points?: number;
  maxPoints?: number;
  userSubmission?: Submission | null;
  allSubmissions?: Submission[];
  submissions?: Submission[];
}

export interface Submission {
  id: string;
  assignment_id?: string;
  assignmentId?: string;
  student_id?: string;
  studentId?: string;
  student_name?: string;
  studentName?: string;
  student_nim?: string;
  studentNim?: string;
  file_name?: string;
  file_url?: string;
  fileUrl?: string;
  notes?: string;
  score?: number | null;
  grade?: number | null;
  feedback?: string;
  status?: string;
  submitted_at?: string;
  submittedAt?: string;
  graded_at?: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id?: string;
  quizId?: string;
  question_text: string;
  options: string[];
  correct_index: number;
  explanation?: string;
  sort_order?: number;
}

export interface QuizAttempt {
  id?: string;
  quizId?: string;
  studentId?: string;
  studentName?: string;
  studentNim?: string;
  score: number;
  completedAt: string;
}

export interface Quiz {
  id: string;
  course_id?: string;
  courseId?: string;
  course_name?: string;
  courseName?: string;
  title: string;
  description?: string;
  duration_minutes?: number;
  durationMinutes?: number;
  passing_score?: number;
  passingScore?: number;
  questions_count?: number;
  created_at?: string;
  createdAt?: string;
  isCompleted?: boolean;
  userAttempt?: {
    id: string;
    score: number;
    completed_at: string;
  } | null;
  questions?: QuizQuestion[];
  attempts?: QuizAttempt[];
}

export interface Attendance {
  id: string;
  course_id?: string;
  courseId?: string;
  course_name?: string;
  courseName?: string;
  student_id?: string;
  studentId?: string;
  student_name?: string;
  studentName?: string;
  student_nim?: string;
  studentNim?: string;
  date: string;
  time_string?: string;
  status: 'HADIR' | 'IZIN' | 'SAKIT' | 'ALPA' | 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';
  notes?: string;
  created_at?: string;
}

export interface Grade {
  id: string;
  course_id?: string;
  courseId?: string;
  course_name?: string;
  courseName?: string;
  student_id?: string;
  studentId?: string;
  student_name?: string;
  studentName?: string;
  student_nim?: string;
  studentNim?: string;
  lecturer_name?: string;
  kkm?: number;
  tugas_score?: number;
  tugasScore?: number;
  kuis_score?: number;
  kuisScore?: number;
  attendance_score?: number;
  attendanceScore?: number;
  uts_score?: number;
  uas_score?: number;
  final_score?: number;
  finalGrade?: number;
  grade_letter?: string;
  letterGrade?: string;
  status?: string;
  updated_at?: string;
}
