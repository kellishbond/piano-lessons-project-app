import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Lesson, Exercise } from '../types.js';
import { PianoKeyboard } from '../components/PianoKeyboard.js';
import { pianoAudio } from '../utils/audio.js';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Eye,
  Volume2,
  CheckCircle,
  HelpCircle,
  ClipboardList,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Trophy,
  Play,
  RotateCcw,
  Check,
  Award
} from 'lucide-react';

interface LessonViewProps {
  lessonId: string;
  onBack: () => void;
  onNextLesson?: (nextLessonId: string) => void;
}

export const LessonView: React.FC<LessonViewProps> = ({ lessonId, onBack, onNextLesson }) => {
  const { user, refreshUser } = useAuth();
  const [lesson, setLesson] = useState<(Lesson & { exercise?: Exercise | null }) | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<number>(1); // 1 to 8
  const [isPlayingDemo, setIsPlayingDemo] = useState<boolean>(false);

  // Practice state (Section 5)
  const [practiceNotesPlayed, setPracticeNotesPlayed] = useState<string[]>([]);
  const [practiceCompleted, setPracticeCompleted] = useState<boolean>(false);

  // Test Yourself state (Section 6)
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizResult, setQuizResult] = useState<{ correct: boolean; explanation: string } | null>(null);

  // Completion state (Section 8)
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [savingProgress, setSavingProgress] = useState<boolean>(false);

  useEffect(() => {
    const loadLesson = async () => {
      setLoading(true);
      try {
        const data = await api.getLesson(lessonId);
        setLesson(data);
        setActiveStep(1);
        setPracticeNotesPlayed([]);
        setPracticeCompleted(false);
        setSelectedOption('');
        setQuizSubmitted(false);
        setQuizResult(null);
        setIsCompleted(false);
      } catch (err) {
        console.error('Failed to load lesson', err);
      } finally {
        setLoading(false);
      }
    };
    loadLesson();
  }, [lessonId]);

  if (loading || !lesson) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-600 font-medium">Loading lesson curriculum...</p>
      </div>
    );
  }

  const sections = lesson.sections;

  // Audio demonstration helper
  const handlePlayAudioDemo = () => {
    if (isPlayingDemo || !sections.listen.notesToPlay) return;
    setIsPlayingDemo(true);
    const notes = sections.listen.notesToPlay;
    const bpm = sections.listen.bpm || 60;
    const intervalMs = (60 / bpm) * 1000;

    notes.forEach((note, idx) => {
      setTimeout(() => {
        pianoAudio.playNote(note, 1.2, 0.85);
        if (idx === notes.length - 1) {
          setTimeout(() => setIsPlayingDemo(false), 800);
        }
      }, idx * intervalMs);
    });
  };

  // Practice note handler
  const handlePracticeNotePlay = (note: string) => {
    if (practiceCompleted) return;
    const target = sections.practice.targetNotes;
    const nextPlayed = [...practiceNotesPlayed, note];
    setPracticeNotesPlayed(nextPlayed);

    // Check if the sequence matches
    if (nextPlayed.length >= target.length) {
      const match = target.every((tNote, i) => nextPlayed[i] === tNote);
      if (match) {
        setPracticeCompleted(true);
        pianoAudio.playSuccessChime();
      } else {
        // Reset after short delay
        setTimeout(() => {
          setPracticeNotesPlayed([]);
        }, 600);
      }
    }
  };

  // Quiz submission
  const handleQuizSubmit = async () => {
    if (!selectedOption || !lesson.exercise) return;
    try {
      const res = await api.submitExercise(lesson.exercise.id, selectedOption);
      setQuizSubmitted(true);
      setQuizResult({ correct: res.correct, explanation: res.explanation });
      if (res.correct) {
        pianoAudio.playSuccessChime();
      } else {
        pianoAudio.playErrorChime();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Complete lesson
  const handleFinalCompletion = async () => {
    if (!user) return;
    setSavingProgress(true);
    try {
      await api.completeLesson(lesson.id, user.id, 100);
      setIsCompleted(true);
      pianoAudio.playSuccessChime();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      await refreshUser();
    } catch (e) {
      console.error(e);
    } finally {
      setSavingProgress(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Learn', icon: BookOpen },
    { num: 2, label: 'Watch', icon: Eye },
    { num: 3, label: 'Listen', icon: Volume2 },
    { num: 4, label: 'See', icon: Eye },
    { num: 5, label: 'Practice', icon: Play },
    { num: 6, label: 'Test Yourself', icon: HelpCircle },
    { num: 7, label: 'Assignment', icon: ClipboardList },
    { num: 8, label: 'Completion', icon: Award },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          id="back-to-course-btn"
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-stone-600 hover:text-stone-900 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-2xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </button>

        <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-900 rounded-full border border-amber-200">
          Lesson {lesson.order} of Module
        </span>
      </div>

      {/* Lesson Title Banner */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block">
          Lesson {lesson.order}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1 font-serif">
          {lesson.title}
        </h1>
        <p className="text-stone-600 text-sm mt-1.5">{lesson.description}</p>

        {/* 8-Step Progress Stepper Navigation */}
        <div className="mt-6 pt-6 border-t border-stone-100">
          <div className="flex items-center justify-between overflow-x-auto pb-2 gap-1 sm:gap-2">
            {stepsList.map((step) => {
              const Icon = step.icon;
              const isCurrent = activeStep === step.num;
              const isPast = activeStep > step.num;

              return (
                <button
                  key={step.num}
                  id={`lesson-step-${step.num}-btn`}
                  onClick={() => setActiveStep(step.num)}
                  className={`flex flex-col items-center gap-1 min-w-[68px] sm:min-w-[80px] p-2 rounded-xl transition ${
                    isCurrent
                      ? 'bg-amber-50 border-2 border-amber-800 text-amber-950 font-bold shadow-2xs'
                      : isPast
                      ? 'text-stone-700 hover:bg-stone-50'
                      : 'text-stone-400 hover:bg-stone-50'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      isCurrent
                        ? 'bg-amber-800 text-white'
                        : isPast
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : step.num}
                  </div>
                  <span className="text-[11px] whitespace-nowrap">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Dynamic Content by Active Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm min-h-[420px]">
        {/* SECTION 1: LEARN */}
        {activeStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-amber-700" />
              Section 1 — Learn the Concept
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              {sections.learn.heading}
            </h2>

            <p className="text-stone-700 text-base leading-relaxed max-w-3xl">
              {sections.learn.text}
            </p>

            <div className="bg-stone-50 p-5 rounded-xl border border-stone-200">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
                Key Takeaways for Young Pianists:
              </h3>
              <ul className="space-y-2.5">
                {sections.learn.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm text-stone-700">
                    <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* SECTION 2: WATCH */}
        {activeStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <Eye className="w-4 h-4 text-amber-700" />
              Section 2 — Watch the Technique
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              {sections.watch.title}
            </h2>

            <p className="text-stone-600 text-sm">{sections.watch.description}</p>

            {/* Visual simulation stage */}
            <div className="p-6 bg-stone-900 text-stone-100 rounded-2xl flex flex-col items-center justify-center space-y-4 border border-stone-800">
              <div className="w-full max-w-lg bg-stone-800 p-4 rounded-xl border border-stone-700 text-center">
                <div className="text-4xl mb-2">🤲 🎹</div>
                <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                  Hand Position Guide
                </div>
                <p className="text-sm text-stone-300 mt-2">
                  {sections.watch.handPositionHint || 'Keep wrist level, fingers curved like a gentle dome.'}
                </p>
              </div>

              <div className="w-full">
                <PianoKeyboard
                  highlightKeys={sections.see.highlightKeys}
                  fingerGuides={sections.see.fingerGuides}
                  showLabels="fingers"
                  interactive={false}
                  heightClass="h-40"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: LISTEN */}
        {activeStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <Volume2 className="w-4 h-4 text-amber-700" />
              Section 3 — Listen to the Demonstration
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              {sections.listen.title}
            </h2>

            <p className="text-stone-600 text-sm">{sections.listen.description}</p>

            <div className="p-8 bg-amber-50/60 rounded-2xl border border-amber-200 text-center space-y-4 max-w-xl mx-auto">
              <div className="w-16 h-16 rounded-full bg-amber-800 text-white flex items-center justify-center mx-auto shadow-md">
                <Volume2 className={`w-8 h-8 ${isPlayingDemo ? 'animate-bounce' : ''}`} />
              </div>

              <div>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Target Melody / Notes:
                </span>
                <div className="flex items-center justify-center gap-2 mt-2">
                  {sections.listen.notesToPlay.map((note, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-lg bg-white border border-stone-200 font-mono font-bold text-stone-800 shadow-2xs text-base"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              <button
                id="listen-demo-btn"
                onClick={handlePlayAudioDemo}
                disabled={isPlayingDemo}
                className="px-6 py-3 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm flex items-center gap-2 mx-auto shadow transition disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" />
                {isPlayingDemo ? 'Playing Sound...' : 'Play Audio Demonstration'}
              </button>
            </div>
          </div>
        )}

        {/* SECTION 4: SEE */}
        {activeStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <Eye className="w-4 h-4 text-amber-700" />
              Section 4 — See the Keys & Fingering
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              {sections.see.title}
            </h2>

            <p className="text-stone-600 text-sm">{sections.see.description}</p>

            {/* Virtual piano with pinned keys */}
            <div className="w-full my-4">
              <PianoKeyboard
                highlightKeys={sections.see.highlightKeys}
                fingerGuides={sections.see.fingerGuides}
                showLabels="fingers"
                interactive={true}
              />
            </div>

            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs text-stone-700">
              <span className="font-bold text-stone-900">Fingering Reminder:</span> Amber badges on keys represent which finger number to press (1 = Thumb, 2 = Index, 3 = Middle, 4 = Ring, 5 = Pinky).
            </div>
          </div>
        )}

        {/* SECTION 5: PRACTICE */}
        {activeStep === 5 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <Play className="w-4 h-4 text-amber-700" />
              Section 5 — Practice on the Virtual Piano
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                  Interactive Practice Goal
                </h2>
                <p className="text-stone-600 text-sm mt-0.5">{sections.practice.instructions}</p>
              </div>

              {practiceCompleted && (
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Goal Met!
                </span>
              )}
            </div>

            {/* Target Sequence Display */}
            <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Play Target:</span>
              <div className="flex items-center gap-2">
                {sections.practice.targetNotes.map((note, idx) => {
                  const wasPlayed = idx < practiceNotesPlayed.length && practiceNotesPlayed[idx] === note;
                  return (
                    <div
                      key={idx}
                      className={`px-3 py-1.5 rounded-lg font-mono font-bold text-sm border transition ${
                        wasPlayed
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                          : 'bg-white text-stone-800 border-stone-200'
                      }`}
                    >
                      {note}
                    </div>
                  );
                })}
              </div>

              <button
                id="reset-practice-btn"
                onClick={() => {
                  setPracticeNotesPlayed([]);
                  setPracticeCompleted(false);
                }}
                className="ml-auto text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 font-semibold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>

            {/* Interactive Keyboard */}
            <PianoKeyboard
              highlightKeys={sections.see.highlightKeys}
              fingerGuides={sections.see.fingerGuides}
              onNotePlay={handlePracticeNotePlay}
              interactive={true}
            />
          </div>
        )}

        {/* SECTION 6: TEST YOURSELF */}
        {activeStep === 6 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-amber-700" />
              Section 6 — Test Yourself
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              {lesson.exercise?.title || 'Knowledge Check'}
            </h2>

            <p className="text-stone-700 text-base">
              {lesson.exercise?.question || 'Answer the exercise question to verify your understanding.'}
            </p>

            {/* Options list if multiple choice */}
            {lesson.exercise?.options && lesson.exercise.options.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
                {lesson.exercise.options.map((option, idx) => (
                  <button
                    key={idx}
                    id={`quiz-option-${idx}`}
                    onClick={() => {
                      if (!quizSubmitted) setSelectedOption(option);
                    }}
                    disabled={quizSubmitted}
                    className={`p-4 rounded-xl border text-left font-semibold text-sm transition ${
                      selectedOption === option
                        ? 'border-amber-800 bg-amber-50 text-amber-950 ring-2 ring-amber-800'
                        : 'border-stone-200 bg-white hover:border-stone-400 text-stone-800'
                    }`}
                  >
                    <span className="text-stone-400 mr-2 font-mono">{String.fromCharCode(65 + idx)}.</span>
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <PianoKeyboard
                  onNotePlay={(note) => {
                    if (!quizSubmitted) setSelectedOption(note);
                  }}
                  interactive={!quizSubmitted}
                  heightClass="h-44"
                />
                {selectedOption && (
                  <div className="text-sm font-semibold text-stone-800">
                    Selected key: <span className="font-mono bg-amber-100 px-2 py-0.5 rounded">{selectedOption}</span>
                  </div>
                )}
              </div>
            )}

            {/* Submit & Result */}
            {!quizSubmitted ? (
              <button
                id="submit-quiz-btn"
                onClick={handleQuizSubmit}
                disabled={!selectedOption}
                className="px-6 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm transition disabled:opacity-40"
              >
                Submit Answer
              </button>
            ) : (
              <div
                className={`p-4 rounded-xl border max-w-xl ${
                  quizResult?.correct
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                <div className="font-bold flex items-center gap-2">
                  {quizResult?.correct ? '🎉 Correct!' : '❌ Not quite.'}
                </div>
                <p className="text-sm mt-1">{quizResult?.explanation}</p>
                {!quizResult?.correct && (
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setQuizResult(null);
                      setSelectedOption('');
                    }}
                    className="mt-3 text-xs font-bold underline"
                  >
                    Try Again
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* SECTION 7: ASSIGNMENT */}
        {activeStep === 7 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <ClipboardList className="w-4 h-4 text-amber-700" />
              Section 7 — Take-Home Assignment
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              {sections.assignment.task}
            </h2>

            <div className="bg-amber-50/70 p-5 rounded-xl border border-amber-200/80 max-w-2xl">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs uppercase tracking-wider mb-2">
                Recommended Practice Time: {sections.assignment.recommendedMinutes} minutes
              </div>

              <h3 className="font-bold text-stone-900 text-sm mt-3 mb-2">Your Checklist:</h3>
              <ul className="space-y-2">
                {sections.assignment.checkpoints.map((cp, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-stone-700">
                    <CheckCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>{cp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* SECTION 8: COMPLETION */}
        {activeStep === 8 && (
          <div className="space-y-6 animate-in fade-in text-center max-w-xl mx-auto py-4">
            <div className="w-20 h-20 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
              <Trophy className="w-10 h-10 text-amber-800" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
              Lesson Complete!
            </h2>

            <p className="text-stone-600 text-sm leading-relaxed">
              Splendid work! You have finished all 8 sections of <strong>{lesson.title}</strong>. Your teacher will be notified of your progress.
            </p>

            {!isCompleted ? (
              <button
                id="mark-completed-btn"
                onClick={handleFinalCompletion}
                disabled={savingProgress}
                className="px-8 py-3.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm shadow-md transition disabled:opacity-50"
              >
                {savingProgress ? 'Saving...' : 'Mark as Completed & Record Score'}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-300 font-bold flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Recorded in Student Gradebook!
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    id="return-dashboard-btn"
                    onClick={onBack}
                    className="px-5 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-sm hover:bg-stone-800 transition"
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stepper Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <button
          id="prev-step-btn"
          onClick={() => setActiveStep(s => Math.max(1, s - 1))}
          disabled={activeStep === 1}
          className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 border border-stone-200 bg-white disabled:opacity-30 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Previous Section
        </button>

        <span className="text-xs font-semibold text-stone-500">
          Section {activeStep} of 8
        </span>

        <button
          id="next-step-btn"
          onClick={() => setActiveStep(s => Math.min(8, s + 1))}
          disabled={activeStep === 8}
          className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-800 hover:bg-amber-900 disabled:opacity-30 flex items-center gap-1.5 shadow-2xs transition"
        >
          Next Section
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
