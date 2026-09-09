import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Course, Module, Lesson } from '../types.js';
import {
  CheckCircle2,
  Lock,
  Play,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  BookOpen,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface CourseCurriculumProps {
  onSelectLesson: (lessonId: string) => void;
}

export const CourseCurriculum: React.FC<CourseCurriculumProps> = ({ onSelectLesson }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [cData, lData] = await Promise.all([
        api.getCourses(),
        api.getLessons(user?.id),
      ]);
      setCourses(cData);
      setLessons(lData);
    } catch (err) {
      console.error(err);
      setLoadError(err instanceof Error ? err.message : 'The curriculum could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user]);

  const modulesList = [
    { id: 'mod-1', num: 1, title: 'Getting Started', desc: 'Proper posture, seating, and holding an imaginary bubble.' },
    { id: 'mod-2', num: 2, title: 'Understanding the Keyboard', desc: 'Black keys, white keys, groups of 2 and 3, and Middle C.' },
    { id: 'mod-3', num: 3, title: 'Finger Numbers', desc: 'Fingers 1 to 5, curved hands, and relaxed wrists.' },
    { id: 'mod-4', num: 4, title: 'Basic Notes', desc: 'The Musical Alphabet: C, D, E, F, G, A, B on the keyboard.' },
    { id: 'mod-5', num: 5, title: 'Scales', desc: 'The C Major 5-finger pattern and 1-octave scale.' },
    { id: 'mod-6', num: 6, title: 'Chords', desc: 'Triads, root notes, the C Major and G Major chords.' },
    { id: 'mod-7', num: 7, title: 'Rhythm', desc: 'Quarter notes, half notes, whole notes, and 4/4 time.' },
    { id: 'mod-8', num: 8, title: 'Simple Songs', desc: 'Putting it all together with Ode to Joy and Amazing Grace.' },
    { id: 'mod-9', num: 9, title: 'Playing With Both Hands', desc: 'Left hand chord foundations with right hand melody.' },
    { id: 'mod-10', num: 10, title: 'Advanced Beginner Skills', desc: 'Dynamic expression (piano, forte) and tempo phrasing.' },
  ];

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-700 font-semibold">Loading your curriculum...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-stone-900">Curriculum unavailable</h1>
        <p className="text-stone-600 text-sm mt-2">{loadError}</p>
        <button
          onClick={load}
          className="mt-5 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-sm font-bold inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in">
      {/* Course Header */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            Official Curriculum
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
            Beginner Piano: The Classical & Modern Journey
          </h1>
          <p className="text-stone-600 text-sm max-w-2xl leading-relaxed">
            A 10-module structured progression designed to guide students from their first keyboard touch to independent musicality.
          </p>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-6 shrink-0">
          <div>
            <span className="text-2xl font-bold text-stone-900 block font-mono">10</span>
            <span className="text-xs text-stone-500 font-medium">Sequential Modules</span>
          </div>
          <div className="h-8 w-px bg-stone-200" />
          <div>
            <span className="text-2xl font-bold text-amber-800 block font-mono">8</span>
            <span className="text-xs text-stone-500 font-medium">Steps Per Lesson</span>
          </div>
        </div>
      </div>

      {/* 10 Structured Modules List */}
      <div className="space-y-4">
        {modulesList.map((mod) => {
          const modLessons = lessons.filter(l => l.moduleId === mod.id);
          const hasLessons = modLessons.length > 0;
          const isCompleted = modLessons.length > 0 && modLessons.every(l => l.status === 'COMPLETED');
          const isCurrent = modLessons.some(l => l.status === 'CURRENT');

          return (
            <div
              key={mod.id}
              className={`rounded-2xl border transition overflow-hidden bg-white ${
                isCurrent
                  ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
                  : isCompleted
                  ? 'border-emerald-200 bg-emerald-50/10'
                  : 'border-stone-200'
              }`}
            >
              {/* Module Header Bar */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCurrent
                        ? 'bg-amber-800 text-white'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : `M${mod.num}`}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                      Module {mod.num} — {mod.title}
                      {isCurrent && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full">
                          Current Focus
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">{mod.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-xs font-semibold text-stone-500">
                    {modLessons.length} {modLessons.length === 1 ? 'lesson' : 'lessons'}
                  </span>
                </div>
              </div>

              {/* Module Lessons Items */}
              {hasLessons ? (
                <div className="divide-y divide-stone-100">
                  {modLessons.map((les) => (
                    <div
                      key={les.id}
                      className="p-4 sm:px-6 flex items-center justify-between hover:bg-stone-50/80 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            les.status === 'COMPLETED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : les.status === 'CURRENT'
                              ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-400'
                              : 'bg-stone-100 text-stone-400'
                          }`}
                        >
                          {les.status === 'COMPLETED' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : les.status === 'LOCKED' ? (
                            <Lock className="w-3.5 h-3.5" />
                          ) : (
                            les.order
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-stone-900 group-hover:text-amber-900 transition">
                            {les.title}
                          </h4>
                          <p className="text-xs text-stone-500 line-clamp-1">{les.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            les.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : les.status === 'CURRENT'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-400'
                          }`}
                        >
                          {les.status === 'COMPLETED'
                            ? 'Completed'
                            : les.status === 'CURRENT'
                            ? 'Ready to Start'
                            : 'Locked'}
                        </span>

                        <button
                          id={`start-lesson-${les.id}`}
                          onClick={() => onSelectLesson(les.id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                            les.status === 'CURRENT'
                              ? 'bg-amber-800 hover:bg-amber-900 text-white shadow-2xs'
                              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                          }`}
                        >
                          <span>{les.status === 'COMPLETED' ? 'Review' : 'Open'}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-xs text-stone-400 italic bg-stone-50/50 flex items-center justify-between">
                  <span>Advanced module unlocking upon completion of prerequisite foundations.</span>
                  <span className="flex items-center gap-1 font-medium text-stone-500">
                    <Lock className="w-3 h-3" /> Sequenced
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
