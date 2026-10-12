import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LMSProvider } from './context/LMSContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';

// Page Views
import { AuthPortal } from './pages/AuthPortal';
import { DashboardView } from './pages/DashboardView';
import { MateriView } from './pages/MateriView';
import { TugasView } from './pages/TugasView';
import { KuisView } from './pages/KuisView';
import { AbsensiView } from './pages/AbsensiView';
import { NilaiView } from './pages/NilaiView';

// Modals
import { MateriModal } from './components/modals/MateriModal';
import { TugasModal } from './components/modals/TugasModal';
import { SubmitTugasModal } from './components/modals/SubmitTugasModal';
import { GradeTugasModal } from './components/modals/GradeTugasModal';
import { KuisModal } from './components/modals/KuisModal';
import { QuizRunnerModal } from './components/modals/QuizRunnerModal';
import { NilaiModal } from './components/modals/NilaiModal';
import { LogoutModal } from './components/modals/LogoutModal';

import type { Assignment, Submission, Quiz, Grade } from './types';
import { GraduationCap } from 'lucide-react';

const LMSMainApp: React.FC = () => {
  const { user, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Modal Visibility States
  const [isMateriModalOpen, setIsMateriModalOpen] = useState<boolean>(false);
  const [isTugasModalOpen, setIsTugasModalOpen] = useState<boolean>(false);
  const [isKuisModalOpen, setIsKuisModalOpen] = useState<boolean>(false);
  const [isNilaiModalOpen, setIsNilaiModalOpen] = useState<boolean>(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState<boolean>(false);

  // Assignment Submit & Grade states
  const [submitAssignment, setSubmitAssignment] = useState<Assignment | null>(null);
  const [gradeAssignment, setGradeAssignment] = useState<Assignment | null>(null);
  const [gradeSubmission, setGradeSubmission] = useState<Submission | null>(null);

  // Quiz Runner state
  const [runnerQuiz, setRunnerQuiz] = useState<Quiz | null>(null);

  // Nilai edit state
  const [editingGrade, setEditingGrade] = useState<Grade | undefined>(undefined);

  // Handlers for modal actions
  const handleOpenSubmitTugas = (assignment: Assignment) => {
    setSubmitAssignment(assignment);
  };

  const handleOpenGradeTugas = (assignment: Assignment, submission: Submission) => {
    setGradeAssignment(assignment);
    setGradeSubmission(submission);
  };

  const handleStartQuiz = (quiz: Quiz) => {
    setRunnerQuiz(quiz);
  };

  const handleOpenNilai = (gradeToEdit?: Grade) => {
    setEditingGrade(gradeToEdit);
    setIsNilaiModalOpen(true);
  };

  // Loading Screen while verifying JWT session
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/30 animate-pulse">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold">EduSmart LMS</h2>
        <p className="text-xs text-slate-400 mt-1">Memuat portal perkuliahan...</p>
      </div>
    );
  }

  // Unauthenticated: Show Campus Auth Portal (No internal LMS visible)
  if (!user) {
    return (
      <>
        <ToastContainer />
        <AuthPortal />
      </>
    );
  }

  // Authenticated: Show Full LMS Application
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased text-slate-800">
      {/* Toast Notification Layer */}
      <ToastContainer />

      {/* Main Layout Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpenMobile={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
          {/* Header Bar */}
          <Header
            activeTab={activeTab}
            onOpenMobile={() => setMobileMenuOpen(true)}
          />

          {/* Page Content Body */}
          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
            {activeTab === 'dashboard' && (
              <DashboardView
                onNavigate={setActiveTab}
                onOpenMateriModal={() => setIsMateriModalOpen(true)}
                onOpenTugasModal={() => setIsTugasModalOpen(true)}
                onOpenKuisModal={() => setIsKuisModalOpen(true)}
                onOpenNilaiModal={() => handleOpenNilai()}
              />
            )}

            {activeTab === 'materi' && (
              <MateriView
                onOpenCreateModal={() => setIsMateriModalOpen(true)}
              />
            )}

            {activeTab === 'tugas' && (
              <TugasView
                onOpenCreateModal={() => setIsTugasModalOpen(true)}
                onOpenSubmitModal={handleOpenSubmitTugas}
                onOpenGradeModal={handleOpenGradeTugas}
              />
            )}

            {activeTab === 'kuis' && (
              <KuisView
                onOpenCreateModal={() => setIsKuisModalOpen(true)}
                onStartQuiz={handleStartQuiz}
              />
            )}

            {activeTab === 'absensi' && (
              <AbsensiView />
            )}

            {activeTab === 'nilai' && (
              <NilaiView
                onOpenCreateModal={handleOpenNilai}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modals Layer */}
      <MateriModal
        isOpen={isMateriModalOpen}
        onClose={() => setIsMateriModalOpen(false)}
      />

      <TugasModal
        isOpen={isTugasModalOpen}
        onClose={() => setIsTugasModalOpen(false)}
      />

      {submitAssignment && (
        <SubmitTugasModal
          onClose={() => setSubmitAssignment(null)}
          assignment={submitAssignment}
        />
      )}

      {gradeAssignment && gradeSubmission && (
        <GradeTugasModal
          onClose={() => {
            setGradeAssignment(null);
            setGradeSubmission(null);
          }}
          assignment={gradeAssignment}
          submission={gradeSubmission}
        />
      )}

      <KuisModal
        isOpen={isKuisModalOpen}
        onClose={() => setIsKuisModalOpen(false)}
      />

      {runnerQuiz && (
        <QuizRunnerModal
          onClose={() => setRunnerQuiz(null)}
          quiz={runnerQuiz}
        />
      )}

      <NilaiModal
        isOpen={isNilaiModalOpen}
        onClose={() => {
          setIsNilaiModalOpen(false);
          setEditingGrade(undefined);
        }}
        existingGrade={editingGrade}
      />

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <LMSProvider>
        <LMSMainApp />
      </LMSProvider>
    </AuthProvider>
  );
}
