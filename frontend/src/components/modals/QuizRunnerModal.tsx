import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useLMS } from '../../context/LMSContext';
import { quizApi } from '../../services/api';
import type { Quiz, QuizQuestion } from '../../types';
import { Clock, CheckCircle2, XCircle, Award } from 'lucide-react';

interface QuizRunnerModalProps {
  quiz: Quiz | null;
  onClose: () => void;
  isOpen?: boolean;
}

export const QuizRunnerModal: React.FC<QuizRunnerModalProps> = ({ quiz, onClose }) => {
  const { showToast, refreshAll } = useLMS();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(300);
  const [isFinished, setIsFinished] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; correctCount: number } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (quiz) {
      setIsFinished(false);
      setScoreResult(null);
      setCurrentIndex(0);
      setUserAnswers({});
      const duration = quiz.durationMinutes || quiz.duration_minutes || 15;
      setTimeLeft(duration * 60);

      const fetchQuestions = async () => {
        try {
          const detailed = await quizApi.getById(quiz.id);
          setQuestions(detailed.questions || []);
        } catch {
          setQuestions([]);
        }
      };

      fetchQuestions();
    }
  }, [quiz]);

  useEffect(() => {
    if (!quiz || isFinished || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quiz, isFinished, timeLeft]);

  if (!quiz) return null;

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;

  const handleFinish = async () => {
    if (!quiz || isFinished) return;
    setLoading(true);

    try {
      const res = await quizApi.submitAttempt({
        quiz_id: quiz.id,
        user_answers: userAnswers
      });

      setIsFinished(true);
      setScoreResult({
        score: res.score,
        correctCount: res.correctCount
      });
      showToast(`Kuis selesai! Skor perolehan: ${res.score}/100`);
      refreshAll();
    } catch (err: any) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const courseName = quiz.courseName || quiz.course_name || 'Mata Kuliah';

  return (
    <Modal
      isOpen={Boolean(quiz)}
      onClose={onClose}
      title={isFinished ? 'Hasil Evaluasi Kuis' : quiz.title}
      subtitle={isFinished ? 'Review jawaban dan pembahasan materi' : courseName}
      maxWidth="max-w-2xl"
    >
      {!isFinished ? (
        <div className="space-y-4">
          {/* Header Bar with Timer & Progress */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-xs font-bold text-indigo-700">
              Soal {currentIndex + 1} dari {totalQ}
            </span>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold">
              <Clock className="w-4 h-4" />
              <span>{timeFormatted}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${totalQ > 0 ? ((currentIndex + 1) / totalQ) * 100 : 0}%` }}
            />
          </div>

          {/* Question Box */}
          {currentQ ? (
            <div className="space-y-4 pt-2">
              <h4 className="text-sm md:text-base font-bold text-slate-800 leading-snug">
                {currentQ.question_text}
              </h4>

              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = userAnswers[currentQ.id] === idx;
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setUserAnswers(prev => ({ ...prev, [currentQ.id]: idx }))}
                      className={`w-full p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold ring-2 ring-indigo-600/20'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {letter}
                      </span>
                      <span className="text-xs md:text-sm">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400">
              Memuat butir pertanyaan...
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold disabled:opacity-40"
            >
              Sebelumnya
            </button>

            {currentIndex < totalQ - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
              >
                Selanjutnya
              </button>
            ) : (
              <button
                type="button"
                disabled={loading}
                onClick={handleFinish}
                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
              >
                {loading ? 'Menghitung...' : 'Selesaikan Kuis'}
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-5 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Skor Akhir Anda</span>
            <div className="text-5xl font-black text-emerald-600">{scoreResult?.score || 0}</div>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              {scoreResult?.correctCount} dari {totalQ} Soal Dijawab Benar
            </p>
          </div>

          <div className="text-left space-y-3 max-h-60 overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const userChoice = userAnswers[q.id];
              const isCorrect = userChoice === q.correct_index;
              return (
                <div key={q.id} className={`p-3 rounded-2xl border text-xs ${isCorrect ? 'border-emerald-200 bg-emerald-50/50' : 'border-rose-200 bg-rose-50/50'}`}>
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>Soal #{idx + 1}</span>
                    <span className={isCorrect ? 'text-emerald-700 flex items-center gap-1' : 'text-rose-700 flex items-center gap-1'}>
                      {isCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {isCorrect ? 'Benar' : 'Salah'}
                    </span>
                  </div>
                  <p className="text-slate-700 mb-1.5">{q.question_text}</p>
                  <p className="text-[11px] text-slate-500">
                    Kunci Jawaban: <strong className="text-emerald-800">{q.options[q.correct_index]}</strong>
                  </p>
                  {q.explanation && (
                    <p className="mt-1 text-[11px] text-slate-500 italic bg-white/70 p-2 rounded-xl">
                      Pembahasan: {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
            >
              Kembali ke Menu Kuis
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};
