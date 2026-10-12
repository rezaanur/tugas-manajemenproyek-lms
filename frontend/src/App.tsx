import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LMSProvider } from './context/LMSContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';

// Page Views
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
import { AuthModal } from './components/modals/AuthModal';

import type { Assignment, Submission, Quiz, Grade } from './types';
import { LogIn, GraduationCap } from 'lucide-react';

const LMSMainApp: React.FC = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Modal Visibility States
  const [isMateriModalOpen, setIsMateriModalOpen] = useState<boolean>(false);
  const [isTugasModalOpen, setIsTugasModalOpen] = useState<boolean>(false);
  const [isKuisModalOpen, setIsKuisModalOpen] = useState<boolean>(false);
  const [isNilaiModalOpen, setIsNilaiModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

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
            {!user ? (
              /* Logged-out state */
              <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-800">Selamat Datang di EduSmart LMS</h2>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Silakan masuk untuk mengakses materi, pengumpulan tugas, kuis online, dan transkrip nilai.
                </p>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition inline-flex items-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Akun Sekarang</span>
                </button>
              </div>
            ) : (
              <>
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
              </>
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
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
