import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Material, Assignment, Quiz, Attendance, Grade, Course } from '../types';
import { 
  materialApi, 
  assignmentApi, 
  quizApi, 
  attendanceApi, 
  gradeApi, 
  courseApi 
} from '../services/api';
import { useAuth } from './AuthContext';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface LMSContextType {
  materials: Material[];
  assignments: Assignment[];
  quizzes: Quiz[];
  attendances: Attendance[];
  grades: Grade[];
  courses: Course[];
  loading: boolean;
  toasts: ToastInfo[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  refreshAll: () => Promise<void>;
}

const LMSContext = createContext<LMSContextType | undefined>(undefined);

export const LMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastInfo[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = 'toast-' + Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const refreshAll = useCallback(async () => {
    if (!token && !user) return;
    setLoading(true);
    try {
      const [matData, tugData, quizData, absData, grdData, crsData] = await Promise.all([
        materialApi.getAll().catch(() => []),
        assignmentApi.getAll().catch(() => []),
        quizApi.getAll().catch(() => []),
        attendanceApi.getAll().catch(() => []),
        gradeApi.getAll().catch(() => []),
        courseApi.getAll().catch(() => [])
      ]);

      setMaterials(matData);
      setAssignments(tugData);
      setQuizzes(quizData);
      setAttendances(absData);
      setGrades(grdData);
      setCourses(crsData);
    } catch (err) {
      console.error('Error refreshing LMS data:', err);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  useEffect(() => {
    if (user) {
      refreshAll();
    }
  }, [user, refreshAll]);

  return (
    <LMSContext.Provider value={{
      materials,
      assignments,
      quizzes,
      attendances,
      grades,
      courses,
      loading,
      toasts,
      showToast,
      removeToast,
      refreshAll
    }}>
      {children}
    </LMSContext.Provider>
  );
};

export const useLMS = () => {
  const context = useContext(LMSContext);
  if (!context) {
    throw new Error('useLMS must be used within an LMSProvider');
  }
  return context;
};
