import axios from 'axios';
import type { 
  User, 
  Material, 
  Assignment, 
  Quiz, 
  Attendance, 
  Grade, 
  Course 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Authorization Bearer token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('edusmart_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401 response (session expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-clear on login attempts
      if (!error.config.url?.includes('/auth/login') && !error.config.url?.includes('/auth/register')) {
        localStorage.removeItem('edusmart_token');
        localStorage.removeItem('edusmart_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiClient.post<{ success: boolean; token: string; user: User; message: string }>('/auth/login', { email, password });
    return res.data;
  },
  register: async (payload: any) => {
    const res = await apiClient.post<{ success: boolean; token: string; user: User; message: string }>('/auth/register', payload);
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get<{ success: boolean; user: User }>('/auth/me');
    return res.data;
  }
};

// Course Endpoints
export const courseApi = {
  getAll: async () => {
    const res = await apiClient.get<{ success: boolean; data: Course[] }>('/courses');
    return res.data.data;
  },
  create: async (payload: any) => {
    const res = await apiClient.post<{ success: boolean; data: Course }>('/courses', payload);
    return res.data;
  }
};

// Materials Endpoints
export const materialApi = {
  getAll: async (courseId?: string) => {
    const res = await apiClient.get<{ success: boolean; data: Material[] }>('/materi', { params: { courseId } });
    return res.data.data;
  },
  create: async (payload: any) => {
    const res = await apiClient.post<{ success: boolean; data: Material; message: string }>('/materi', payload);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/materi/${id}`);
    return res.data;
  }
};

// Assignments Endpoints
export const assignmentApi = {
  getAll: async () => {
    const res = await apiClient.get<{ success: boolean; data: Assignment[] }>('/tugas');
    return res.data.data;
  },
  create: async (payload: any) => {
    const res = await apiClient.post<{ success: boolean; data: Assignment; message: string }>('/tugas', payload);
    return res.data;
  },
  submit: async (payload: { assignment_id: string; file_name: string; notes?: string }) => {
    const res = await apiClient.post<{ success: boolean; message: string }>('/tugas/submit', payload);
    return res.data;
  },
  grade: async (payload: { submission_id?: string; assignment_id: string; student_id: string; score: number; feedback?: string }) => {
    const res = await apiClient.post<{ success: boolean; message: string }>('/tugas/grade', payload);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/tugas/${id}`);
    return res.data;
  }
};

// Quiz Endpoints
export const quizApi = {
  getAll: async () => {
    const res = await apiClient.get<{ success: boolean; data: Quiz[] }>('/kuis');
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Quiz }>(`/kuis/${id}`);
    return res.data.data;
  },
  create: async (payload: any) => {
    const res = await apiClient.post<{ success: boolean; data: Quiz; message: string }>('/kuis', payload);
    return res.data;
  },
  submitAttempt: async (payload: { quiz_id: string; user_answers: Record<string, number> }) => {
    const res = await apiClient.post<{ success: boolean; message: string; score: number; correctCount: number; totalQuestions: number }>('/kuis/attempt', payload);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/kuis/${id}`);
    return res.data;
  }
};

// Attendance Endpoints
export const attendanceApi = {
  getAll: async () => {
    const res = await apiClient.get<{ success: boolean; data: Attendance[] }>('/absensi');
    return res.data.data;
  },
  record: async (payload: any) => {
    const res = await apiClient.post<{ success: boolean; data: Attendance; message: string }>('/absensi', payload);
    return res.data;
  },
  create: async (payload: any) => {
    const res = await apiClient.post<{ success: boolean; data: Attendance; message: string }>('/absensi', payload);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/absensi/${id}`);
    return res.data;
  }
};

// Grades Endpoints
export const gradeApi = {
  getAll: async () => {
    const res = await apiClient.get<{ success: boolean; data: Grade[] }>('/nilai');
    return res.data.data;
  },
  upsert: async (payload: any) => {
    const res = await apiClient.post<{ success: boolean; data: Grade; message: string }>('/nilai', payload);
    return res.data;
  },
  create: async (payload: any) => {
    const res = await apiClient.post<{ success: boolean; data: Grade; message: string }>('/nilai', payload);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/nilai/${id}`);
    return res.data;
  }
};
