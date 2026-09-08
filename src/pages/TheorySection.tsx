import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, ArrowRight, RotateCcw, HelpCircle, Volume2 } from 'lucide-react';
import { pianoAudio } from '../utils/audio.js';
import confetti from 'canvas-confetti';

interface TheoryQuestion {
  id: string;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  audioNote?: string;
  visualDiagram?: string;
}

export const TheorySection: React.FC = () => {
  const theoryQuestions: TheoryQuestion[] = [
    {
      id: 'th-1',
      category: 'Musical Alphabet',
      question: 'What note comes immediately after C in the musical alphabet?',
      options: ['D', 'E', 'F', 'B'],
      correctIndex: 0,
      explanation: 'The musical alphabet ascends alphabetically: A, B, C, D, E, F, G, and repeats back to A. After C comes D!',
      audioNote: 'D4',
    },
    {
      id: 'th-2',
      category: 'Keyboard Landmarks',
      question: 'Where is Middle C located on the piano keyboard?',
      options: [
        'To the left of the two black keys near the center',
        'Between the three black keys',
        'To the right of the three black keys',
        'On a black key',
      ],
      correctIndex: 0,
      explanation: 'Middle C (C4) sits directly to the left of the pair of two black keys right in the center of the keyboard.',
      audioNote: 'C4',
    },
    {
      id: 'th-3',
      category: 'Finger Numbers',
      question: 'In standard piano fingering, which finger is designated as Finger 1 on both hands?',
      options: ['Thumb', 'Index finger', 'Middle finger', 'Pinky finger'],
      correctIndex: 0,
      explanation: 'Finger 1 is always the Thumb for both right and left hands. Pinky is Finger 5.',
    },
    {
      id: 'th-4',
      category: 'Rhythm & Meter',
      question: 'In 4/4 time, how many beats does a Quarter Note (♩) receive?',
      options: ['1 beat', '2 beats', '4 beats', 'Half a beat'],
      correctIndex: 0,
      explanation: 'A quarter note receives 1 full beat. A half note receives 2 beats, and a whole note receives 4 beats.',
    },
    {
      id: 'th-5',
      category: 'Chords & Triads',
      question: 'Which three notes make up the C Major triad chord?',
      options: ['C - E - G', 'C - D - E', 'C - F - G', 'D - F - A'],
      correctIndex: 0,
      explanation: 'C Major triad is formed by the root (C), major third (E), and perfect fifth (G).',
      audioNote: 'C4',
    },
    {
      id: 'th-6',
      category: 'Clefs & Staff',
      question: 'Which clef is primarily used for right-hand higher pitch piano music?',
      options: ['Treble Clef (G Clef)', 'Bass Clef (F Clef)', 'Alto Clef', 'Tenor Clef'],
      correctIndex: 0,
      explanation: 'The Treble Clef (also known as the G Clef) curls around the G line and is used for higher notes typically played by the right hand.',
    },
    {
      id: 'th-7',
      category: 'Scales & Intervals',
      question: 'How many different letter notes are in a full major scale octave (e.g. C to B)?',
      options: ['7 notes', '5 notes', '8 notes', '12 notes'],
      correctIndex: 0,
      explanation: 'There are 7 diatonic notes (C, D, E, F, G, A, B) before the eighth note completes the octave at C again.',
    }
  ];

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  const currentQ = theoryQuestions[currentIndex];

  const handleSelect = (idx: number) => {
    if (isSubmitted) return;
    setSelectedOption(idx);
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
    const isCorrect = selectedOption === currentQ.correctIndex;
    if (isCorrect) {
      setScore(s => s + 1);
      pianoAudio.playSuccessChime();
    } else {
      pianoAudio.playErrorChime();
    }
    if (currentQ.audioNote) {
      pianoAudio.playNote(currentQ.audioNote, 1.2);
    }
  };

  const handleNext = () => {
    if (currentIndex < theoryQuestions.length - 1) {
      setCurrentIndex(c => c + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      setQuizFinished(true);
      confetti({ particleCount: 70, spread: 60 });
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Award className="w-3.5 h-3.5 text-amber-700" />
            Interactive Music Theory
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
            Piano & Theory Explorer
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Master the musical alphabet, clefs, rhythms, and chords through interactive questions.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto bg-stone-50 px-4 py-2 rounded-xl border border-stone-200">
          <div>
            <span className="text-xs text-stone-500 font-medium block">Current Score</span>
            <span className="text-xl font-bold text-amber-800 font-mono">
              {score} / {theoryQuestions.length}
            </span>
          </div>
        </div>
      </div>

      {!quizFinished ? (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
          {/* Question Category & Counter */}
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full">
              {currentQ.category}
            </span>
            <span className="text-xs font-semibold text-stone-500">
              Question {currentIndex + 1} of {theoryQuestions.length}
            </span>
          </div>

          {/* Question Text */}
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 leading-snug">
            {currentQ.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correctIndex;

              let optionStyle = 'bg-stone-50 border-stone-200 text-stone-800 hover:border-amber-400';
              if (isSelected) {
                optionStyle = 'bg-amber-50 border-amber-800 text-amber-950 ring-2 ring-amber-800/40 font-bold';
              }
              if (isSubmitted) {
                if (isCorrect) {
                  optionStyle = 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-2 ring-emerald-400 font-bold';
                } else if (isSelected && !isCorrect) {
                  optionStyle = 'bg-rose-50 border-rose-400 text-rose-950 font-bold';
                }
              }

              return (
                <button
                  key={idx}
                  id={`theory-opt-${idx}`}
                  onClick={() => handleSelect(idx)}
                  disabled={isSubmitted}
                  className={`w-full p-4 rounded-xl border text-left flex items-center justify-between text-sm transition ${optionStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-white border border-stone-300 flex items-center justify-center font-bold text-xs text-stone-600 shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>

                  {isSubmitted && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  {isSubmitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isSubmitted && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-sm animate-in fade-in space-y-1">
              <span className="font-bold text-amber-900 block">Explanation:</span>
              <p className="text-stone-700 leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-end pt-2">
            {!isSubmitted ? (
              <button
                id="submit-theory-answer-btn"
                onClick={handleSubmit}
                disabled={selectedOption === null}
                className="px-6 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm rounded-xl transition disabled:opacity-40"
              >
                Submit Answer
              </button>
            ) : (
              <button
                id="next-theory-question-btn"
                onClick={handleNext}
                className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm rounded-xl flex items-center gap-1.5 transition"
              >
                {currentIndex < theoryQuestions.length - 1 ? 'Next Question' : 'Complete Quiz'}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Quiz Complete Card */
        <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm text-center space-y-6 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-stone-900 font-serif">Theory Quiz Complete!</h2>
          <p className="text-stone-600 text-sm">
            You scored <strong className="text-stone-900 font-mono text-lg">{score}</strong> out of{' '}
            <strong className="text-stone-900 font-mono text-lg">{theoryQuestions.length}</strong> questions!
          </p>

          <button
            id="retry-theory-quiz-btn"
            onClick={handleRestart}
            className="px-6 py-2.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 mx-auto transition"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};
