import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { PianoKeyboard } from '../components/PianoKeyboard.js';
import { Metronome } from '../components/Metronome.js';
import { pianoAudio } from '../utils/audio.js';
import confetti from 'canvas-confetti';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Flame,
  Activity,
  Award,
  Sparkles,
  HelpCircle,
  Volume2,
  AlertCircle
} from 'lucide-react';

interface PracticeModeProps {
  initialExerciseTitle?: string;
}

export const PracticeMode: React.FC<PracticeModeProps> = ({ initialExerciseTitle }) => {
  const { user, refreshUser } = useAuth();

  // Settings
  const [selectedDuration, setSelectedDuration] = useState<number>(10); // minutes
  const [selectedDrill, setSelectedDrill] = useState<
    'FREE_PLAY' | 'FIND_NOTE' | 'FOLLOW_NOTES' | 'CHORD_ID' | 'RHYTHM'
  >('FOLLOW_NOTES');

  // Session timer state
  const [isActive, setIsActive] = useState<boolean>(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(10 * 60);
  const [attempts, setAttempts] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [totalNotesPlayed, setTotalNotesPlayed] = useState<number>(0);
  const [sessionSaved, setSessionSaved] = useState<boolean>(false);
  const [isSavingSession, setIsSavingSession] = useState<boolean>(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Drill states
  // 1. Find Note
  const [targetFindNote, setTargetFindNote] = useState<string>('C4');
  const [findNoteFeedback, setFindNoteFeedback] = useState<string | null>(null);

  // 2. Follow Notes
  const followSequences = [
    { name: 'C Major 5-Finger', seq: ['C4', 'D4', 'E4', 'F4', 'G4'] },
    { name: 'Ode to Joy Motive', seq: ['E4', 'E4', 'F4', 'G4'] },
    { name: 'Chord Arpeggio', seq: ['C4', 'E4', 'G4'] },
    { name: 'Descending Step', seq: ['G4', 'F4', 'E4', 'D4', 'C4'] },
  ];
  const [currentSeqIndex, setCurrentSeqIndex] = useState<number>(0);
  const [sequenceProgress, setSequenceProgress] = useState<string[]>([]);
  const [sequenceCompleteMessage, setSequenceCompleteMessage] = useState<string | null>(null);

  // 3. Chord Identification
  const chordQuestions = [
    { chord: 'C - E - G', notes: ['C4', 'E4', 'G4'], correct: 'C Major', options: ['C Major', 'C Minor', 'G Major', 'F Major'] },
    { chord: 'G - B - D', notes: ['G4', 'B4', 'D5'], correct: 'G Major', options: ['G Major', 'C Major', 'D Major', 'A Minor'] },
    { chord: 'F - A - C', notes: ['F4', 'A4', 'C5'], correct: 'F Major', options: ['F Major', 'D Minor', 'Bb Major', 'C Major'] },
  ];
  const [chordQIndex, setChordQIndex] = useState<number>(0);
  const [chordFeedback, setChordFeedback] = useState<string | null>(null);

  // Timer countdown
  useEffect(() => {
    let interval: number | null = null;
    if (isActive && secondsRemaining > 0) {
      interval = window.setInterval(() => {
        setSecondsRemaining(prev => prev - 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isActive) {
      setIsActive(false);
      handleFinishSession();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsRemaining]);

  const handleStartSession = () => {
    setIsActive(true);
    setSessionSaved(false);
    setSessionError(null);
  };

  const handlePauseSession = () => {
    setIsActive(false);
  };

  const handleResetSession = () => {
    setIsActive(false);
    setSecondsRemaining(selectedDuration * 60);
    setAttempts(0);
    setCorrectCount(0);
    setTotalNotesPlayed(0);
    setSessionSaved(false);
    setIsSavingSession(false);
    setSessionError(null);
    setSequenceProgress([]);
    setSequenceCompleteMessage(null);
    setFindNoteFeedback(null);
  };

  const handleDurationSelect = (mins: number) => {
    if (!isActive) {
      setSelectedDuration(mins);
      setSecondsRemaining(mins * 60);
    }
  };

  // Keyboard note play handler in practice mode
  const handleNotePlay = (note: string) => {
    if (!isActive || sessionSaved || isSavingSession) return;
    setTotalNotesPlayed(p => p + 1);

    // If Drill is FIND_NOTE
    if (selectedDrill === 'FIND_NOTE') {
      setAttempts(a => a + 1);
      if (note === targetFindNote) {
        setCorrectCount(c => c + 1);
        pianoAudio.playSuccessChime();
        setFindNoteFeedback(`Correct! 🎉 You found ${targetFindNote}.`);
        // Pick next random note
        const notePool = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
        const next = notePool[Math.floor(Math.random() * notePool.length)];
        setTimeout(() => {
          setTargetFindNote(next);
          setFindNoteFeedback(null);
        }, 1200);
      } else {
        pianoAudio.playErrorChime();
        setFindNoteFeedback(`That was ${note}. Try finding ${targetFindNote}!`);
      }
    }

    // If Drill is FOLLOW_NOTES
    if (selectedDrill === 'FOLLOW_NOTES') {
      const activeSeq = followSequences[currentSeqIndex].seq;
      const nextProgress = [...sequenceProgress, note];
      setSequenceProgress(nextProgress);

      const targetIdx = nextProgress.length - 1;
      if (note === activeSeq[targetIdx]) {
        // Correct step
        if (nextProgress.length === activeSeq.length) {
          // Completed sequence!
          setAttempts(a => a + 1);
          setCorrectCount(c => c + 1);
          pianoAudio.playSuccessChime();
          setSequenceCompleteMessage('Sequence completed perfectly! 🎉');
          setTimeout(() => {
            setSequenceProgress([]);
            setSequenceCompleteMessage(null);
            setCurrentSeqIndex(i => (i + 1) % followSequences.length);
          }, 1500);
        }
      } else {
        // Wrong step in sequence
        pianoAudio.playErrorChime();
        setAttempts(a => a + 1);
        setTimeout(() => {
          setSequenceProgress([]);
        }, 600);
      }
    }
  };

  // Chord Option click
  const handleChordSelect = (option: string) => {
    if (!isActive || sessionSaved || isSavingSession) return;
    const q = chordQuestions[chordQIndex];
    setAttempts(a => a + 1);
    if (option === q.correct) {
      setCorrectCount(c => c + 1);
      pianoAudio.playSuccessChime();
      setChordFeedback('Correct! 🎉 ' + q.chord + ' is ' + q.correct);
      setTimeout(() => {
        setChordFeedback(null);
        setChordQIndex(i => (i + 1) % chordQuestions.length);
      }, 1400);
    } else {
      pianoAudio.playErrorChime();
      setChordFeedback('Try again! Listen to the harmony.');
    }
  };

  // Play chord demonstration
  const handlePlayActiveChord = () => {
    const q = chordQuestions[chordQIndex];
    q.notes.forEach((n, idx) => {
      setTimeout(() => {
        pianoAudio.playNote(n, 1.6, 0.8);
      }, idx * 120);
    });
  };

  // Finish and save practice session
  const handleFinishSession = async () => {
    if (!user || sessionSaved || isSavingSession) return;
    const elapsedSeconds = selectedDuration * 60 - secondsRemaining;
    if (elapsedSeconds < 30) {
      setSessionError('Practice for at least 30 seconds before recording a session.');
      return;
    }
    if (totalNotesPlayed === 0) {
      setSessionError('Play at least one note before recording your practice.');
      return;
    }

    const durationSpent = Math.max(1, Math.round(elapsedSeconds / 60));
    const accuracy = attempts > 0 ? Math.round((correctCount / attempts) * 100) : 0;

    setIsSavingSession(true);
    setSessionError(null);
    try {
      await api.recordPractice({
        studentId: user.id,
        exerciseTitle: `${selectedDrill.replace('_', ' ')} Drill`,
        durationMinutes: durationSpent,
        accuracy,
        notesPlayed: totalNotesPlayed,
      });
      setSessionSaved(true);
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      await refreshUser();
    } catch (e) {
      console.error('Failed to save practice', e);
      setSessionError(e instanceof Error ? e.message : 'Your practice session could not be saved.');
    } finally {
      setIsSavingSession(false);
    }
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  const accuracy = attempts > 0 ? Math.round((correctCount / attempts) * 100) : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Activity className="w-3.5 h-3.5 text-amber-700" />
            Dedicated Practice Room
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
            Piano Practice & Drills
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Build finger strength, muscle memory, and rhythmic accuracy in a focused environment.
          </p>
        </div>

        {/* Timer Box */}
        <div className="flex flex-col items-center bg-stone-900 text-white p-4 rounded-xl shadow-inner min-w-[140px]">
          <span className="text-xs font-medium text-stone-400 uppercase tracking-widest flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-400" />
            Timer
          </span>
          <span className="text-3xl font-extrabold font-mono mt-1 text-amber-100">
            {timeFormatted}
          </span>
          <div className="flex items-center gap-2 mt-2">
            {!isActive ? (
              <button
                id="practice-timer-start-btn"
                onClick={handleStartSession}
                className="p-1.5 bg-amber-600 hover:bg-amber-500 rounded text-white transition"
                title="Start Practice Timer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
              </button>
            ) : (
              <button
                id="practice-timer-pause-btn"
                onClick={handlePauseSession}
                className="p-1.5 bg-stone-700 hover:bg-stone-600 rounded text-white transition"
                title="Pause Timer"
              >
                <Pause className="w-3.5 h-3.5 fill-current" />
              </button>
            )}
            <button
              id="practice-timer-reset-btn"
              onClick={handleResetSession}
              className="p-1.5 bg-stone-800 hover:bg-stone-700 rounded text-stone-300 transition"
              title="Reset Timer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Select Duration & Exercise Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Practice Duration Selector */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-3">
            1. Select Practice Duration:
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[5, 10, 15, 20, 30].map((mins) => (
              <button
                key={mins}
                id={`duration-${mins}-btn`}
                onClick={() => handleDurationSelect(mins)}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  selectedDuration === mins
                    ? 'bg-amber-800 text-white border-amber-800 shadow-2xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>

        {/* Drill Type Selector */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-3">
            2. Select Practice Focus:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'FOLLOW_NOTES', label: 'Follow Notes' },
              { id: 'FIND_NOTE', label: 'Find Note' },
              { id: 'CHORD_ID', label: 'Chords' },
              { id: 'FREE_PLAY', label: 'Free Play' },
            ].map((drill) => (
              <button
                key={drill.id}
                id={`drill-${drill.id}-btn`}
                onClick={() => {
                  setSelectedDrill(drill.id as typeof selectedDrill);
                  setSequenceProgress([]);
                }}
                className={`py-2 px-2 text-center rounded-xl text-xs font-bold border transition ${
                  selectedDrill === drill.id
                    ? 'bg-amber-800 text-white border-amber-800 shadow-2xs'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                {drill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drill Active Prompt Box */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        {/* FIND THE NOTE */}
        {selectedDrill === 'FIND_NOTE' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Exercise: Find The Note
                </span>
                <h3 className="text-2xl font-bold text-stone-900 mt-1">
                  Find <span className="text-amber-800 font-mono underline">{targetFindNote}</span> on the keyboard!
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-500">Accuracy</span>
                <div className="text-xl font-mono font-bold text-emerald-700">{accuracy === null ? '—' : `${accuracy}%`}</div>
              </div>
            </div>

            {findNoteFeedback && (
              <div className="p-3 bg-amber-50 text-amber-950 rounded-xl border border-amber-200 text-sm font-bold animate-in fade-in">
                {findNoteFeedback}
              </div>
            )}
          </div>
        )}

        {/* FOLLOW THE NOTES */}
        {selectedDrill === 'FOLLOW_NOTES' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Exercise: Follow The Sequence
                </span>
                <h3 className="text-xl font-bold text-stone-900 mt-0.5">
                  {followSequences[currentSeqIndex].name}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-500">Streak / Attempts</span>
                <div className="text-xl font-mono font-bold text-stone-800">
                  {correctCount}/{attempts}
                </div>
              </div>
            </div>

            {/* Sequence Pills */}
            <div className="flex items-center gap-2 pt-2">
              {followSequences[currentSeqIndex].seq.map((note, idx) => {
                const isPlayed = idx < sequenceProgress.length && sequenceProgress[idx] === note;
                const isCurrent = idx === sequenceProgress.length;

                return (
                  <div
                    key={idx}
                    className={`px-4 py-2 rounded-xl font-mono font-bold text-base border transition ${
                      isPlayed
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : isCurrent
                        ? 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-400 animate-pulse'
                        : 'bg-stone-50 text-stone-600 border-stone-200'
                    }`}
                  >
                    {note}
                  </div>
                );
              })}
            </div>

            {sequenceCompleteMessage && (
              <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-300 text-sm font-bold">
                {sequenceCompleteMessage}
              </div>
            )}
          </div>
        )}

        {/* CHORD IDENTIFICATION */}
        {selectedDrill === 'CHORD_ID' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Exercise: Chord Identification
                </span>
                <h3 className="text-2xl font-bold text-stone-900 mt-1">
                  What chord is this? <span className="font-mono text-amber-800 font-bold ml-2">"{chordQuestions[chordQIndex].chord}"</span>
                </h3>
              </div>
              <button
                onClick={handlePlayActiveChord}
                className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Listen to Chord
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {chordQuestions[chordQIndex].options.map((opt, i) => (
                <button
                  key={i}
                  id={`chord-opt-${i}`}
                  onClick={() => handleChordSelect(opt)}
                  className="p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-amber-50 hover:border-amber-400 font-bold text-stone-800 text-sm transition"
                >
                  {opt}
                </button>
              ))}
            </div>

            {chordFeedback && (
              <div className="p-3 bg-amber-50 text-amber-950 rounded-xl border border-amber-200 text-sm font-bold animate-in fade-in">
                {chordFeedback}
              </div>
            )}
          </div>
        )}

        {/* FREE PLAY */}
        {selectedDrill === 'FREE_PLAY' && (
          <div className="animate-in fade-in">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Free Keyboard Exploration
            </span>
            <h3 className="text-xl font-bold text-stone-900 mt-1">
              Play freely with the metronome or try your own melodies.
            </h3>
            <p className="text-stone-500 text-xs mt-1">
              Notes played in this session: <span className="font-bold text-stone-800">{totalNotesPlayed}</span>
            </p>
          </div>
        )}

        {/* Interactive Piano Keyboard */}
        <div className="pt-4">
          <PianoKeyboard
            onNotePlay={handleNotePlay}
            highlightKeys={selectedDrill === 'CHORD_ID' ? chordQuestions[chordQIndex].notes : []}
            interactive={true}
          />
        </div>
      </div>

      {/* Bottom Tools & Session Recorder */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Metronome Tool */}
        <Metronome initialBpm={70} />

        {/* Practice Stats & Save Card */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-700" />
            Current Session Telemetry
          </h3>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
              <span className="text-[11px] text-stone-500 block">Attempts</span>
              <span className="text-xl font-bold text-stone-900 font-mono">{attempts}</span>
            </div>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
              <span className="text-[11px] text-stone-500 block">Accuracy</span>
              <span className="text-xl font-bold text-emerald-700 font-mono">{accuracy === null ? '—' : `${accuracy}%`}</span>
            </div>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
              <span className="text-[11px] text-stone-500 block">Notes Struck</span>
              <span className="text-xl font-bold text-amber-800 font-mono">{totalNotesPlayed}</span>
            </div>
          </div>

          {sessionError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{sessionError}</span>
            </div>
          )}

          <button
            id="finish-practice-session-btn"
            onClick={handleFinishSession}
            disabled={sessionSaved || isSavingSession}
            className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition ${
              sessionSaved
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 cursor-default'
                : 'bg-amber-800 hover:bg-amber-900 text-white shadow-sm'
            }`}
          >
            {sessionSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                Practice Session Recorded!
              </>
            ) : isSavingSession ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving Practice Session...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Finish Practice & Record to Gradebook
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
