import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { Lesson, Assignment, InstructorFeedback, Achievement as AchievementType } from '../types.js';
import { Achievement } from '../components/Achievement.js';
import {
  Play,
  ArrowRight,
  CheckCircle2,
  Clock,
  MessageSquare,
  Award,
  Sparkles,
  BookOpen,
  Calendar,
  Flame,
  Music,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface StudentDashboardProps {
  onStartLesson: (lessonId: string) => void;
  onStartPractice: (exerciseTitle?: string) => void;
  onExploreSongs: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onStartLesson,
  onStartPractice,
  onExploreSongs,
}) => {
  const { user, profile } = useAuth();
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [feedbacks, setFeedbacks] = useState<InstructorFeedback[]>([]);
  const [achievements, setAchievements] = useState<AchievementType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [lessonsData, asgnData, fbData] = await Promise.all([
        api.getLessons(user.id),
        api.getStudentAssignments(user.id),
        api.getStudentFeedback(user.id),
      ]);

      const curr = lessonsData.find(l => l.id === profile?.currentLessonId) || lessonsData[0];
      setCurrentLesson(curr);
      setAssignments(asgnData);
      setFeedbacks(fbData);

      const fullProg = await api.getStudentProgress(user.id);
      if (fullProg?.achievementsList) {
        setAchievements(fullProg.achievementsList);
      }
    } catch (err) {
      console.error('Error loading dashboard data', err);
      setLoadError(err instanceof Error ? err.message : 'Your dashboard could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, profile?.currentLessonId]);

  const handleToggleAssignment = async (id: string) => {
    try {
      const updated = await api.toggleAssignment(id);
      setAssignments(prev => prev.map(a => (a.id === id ? updated : a)));
    } catch (err) {
      console.error(err);
    }
  };

  const progressPercent = profile?.overallProgress || 0;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-amber-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-stone-700 font-semibold">Loading your piano journey...</p>
        <p className="text-stone-500 text-sm mt-1">Preparing today&apos;s lesson, practice, and feedback.</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-stone-900">Your dashboard is unavailable</h1>
        <p className="text-stone-600 text-sm mt-2">{loadError}</p>
        <button
          onClick={loadData}
          className="mt-5 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-sm font-bold inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in">
      {/* 1. Welcome & Primary Orientation Banner */}
      <section className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-700/60 text-amber-200 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Piano Journey
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif">
            Welcome back, {user?.name.split(' ')[0] || 'Pianist'}!
          </h1>
          <p className="mt-2 text-amber-100 text-sm sm:text-base leading-relaxed">
            Ready to play today? You are making consistent progress on your posture and chord foundations.
          </p>

          {/* Quick Answers to the 3 Core Questions: */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-amber-700/50 text-xs">
            <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-700/30">
              <span className="text-amber-300 font-medium block text-[11px]">1. What am I learning?</span>
              <span className="font-bold text-white text-sm mt-0.5 block truncate">
                {currentLesson?.title || 'Keyboard Basics'}
              </span>
            </div>

            <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-700/30">
              <span className="text-amber-300 font-medium block text-[11px]">2. What should I do now?</span>
              <span className="font-bold text-white text-sm mt-0.5 block">
                {currentLesson ? 'Continue Lesson' : 'Practice Keys'}
              </span>
            </div>

            <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-700/30">
              <span className="text-amber-300 font-medium block text-[11px]">3. What comes next?</span>
              <span className="font-bold text-white text-sm mt-0.5 block">
                Two-Handed Repertoire
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Today's Core Action Cards: Continue Lesson + Start Practice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Lesson Card */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between hover:border-amber-400/80 transition-colors">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-700" />
                Today's Lesson
              </span>
              <span className="px-2 py-0.5 bg-amber-50 rounded-full font-bold">
                {currentLesson?.difficulty || 'Beginner'}
              </span>
            </div>

            <h2 className="text-xl font-bold text-stone-900 mt-1">
              {currentLesson?.title || 'Introduction to C Major'}
            </h2>
            <p className="text-stone-600 text-sm mt-2 leading-relaxed line-clamp-2">
              {currentLesson?.description || 'Learn hand position and strike your first landmark notes.'}
            </p>

            <div className="mt-4 flex items-center gap-3 text-xs text-stone-500 font-medium">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 8 Structured Steps
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">Active & Ready</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">Step-by-step guidance</span>
            <button
              id="continue-lesson-btn"
              onClick={() => currentLesson && onStartLesson(currentLesson.id)}
              className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-sm flex items-center gap-2 shadow-sm transition"
            >
              Continue Lesson
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Practice Environment Card */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between hover:border-amber-400/80 transition-colors">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-stone-600 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Play className="w-4 h-4 text-amber-700" />
                Free Practice & Exercises
              </span>
              <span className="flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                <Flame className="w-3.5 h-3.5 fill-amber-500" />
                Streak: {profile?.practiceStreakDays || 0}d
              </span>
            </div>

            <h2 className="text-xl font-bold text-stone-900 mt-1">
              Interactive Practice Room
            </h2>
            <p className="text-stone-600 text-sm mt-2 leading-relaxed">
              Warm up with interactive drills: Find the Note, Follow Sequences, Chord Identification, or practice songs with the metronome.
            </p>

            <div className="mt-4 flex items-center gap-2 text-xs text-stone-500 font-medium">
              <span className="bg-stone-100 px-2 py-1 rounded">5 - 30 min timers</span>
              <span className="bg-stone-100 px-2 py-1 rounded">Accuracy analysis</span>
              <span className="bg-stone-100 px-2 py-1 rounded">Metronome</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
            <button
              id="explore-songs-btn"
              onClick={onExploreSongs}
              className="text-xs text-stone-600 hover:text-stone-900 font-semibold flex items-center gap-1"
            >
              <Music className="w-3.5 h-3.5 text-amber-700" />
              Song Library
            </button>
            <button
              id="start-practice-btn"
              onClick={() => onStartPractice()}
              className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm flex items-center gap-2 shadow-sm transition"
            >
              Start Practice
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Progress & Goal Strip (Exact Spec Match) */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-stone-900">Overall Course Progress</h3>
            <p className="text-xs text-stone-500 mt-0.5">Beginner Piano: Classical & Modern Journey</p>
          </div>
          <span className="text-2xl font-black text-amber-800 font-mono">
            {progressPercent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-100 h-3.5 rounded-full overflow-hidden p-0.5 border border-stone-200/80">
          <div
            className="bg-gradient-to-r from-amber-700 to-amber-900 h-full rounded-full transition-all duration-700 shadow-inner"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-stone-100 text-xs">
          <div>
            <span className="text-stone-400 font-medium block">Current Lesson</span>
            <span className="font-bold text-stone-800 text-sm mt-0.5 block truncate">
              {currentLesson?.title || 'Lesson 1 — Keyboard Foundations'}
            </span>
          </div>

          <div>
            <span className="text-stone-400 font-medium block">Next Goal</span>
            <span className="font-bold text-stone-800 text-sm mt-0.5 block truncate">
              {user?.learningGoal || 'Master Keyboard Foundations'}
            </span>
          </div>

          <div>
            <span className="text-stone-400 font-medium block">Recent Milestone</span>
            <span className="font-bold text-amber-900 text-sm mt-0.5 flex items-center gap-1.5 truncate">
              {achievements.length > 0 ? (
                <>
                  <span>{achievements[0].icon || '🏆'}</span> {achievements[0].title}
                </>
              ) : (
                <span className="text-stone-500 font-normal">Complete first lesson to earn badges</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Two Columns: Teacher Feedback & Active Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teacher Feedback */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-stone-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-700" />
                Instructor Feedback
              </h3>
              <span className="text-xs font-semibold text-stone-500">
                {feedbacks[0]?.instructorName || 'Studio Instructor'}
              </span>
            </div>

            {feedbacks.length === 0 ? (
              <p className="text-xs text-stone-400 py-4 italic">No new feedback messages yet.</p>
            ) : (
              <div className="space-y-3">
                {feedbacks.slice(0, 2).map((fb) => (
                  <div key={fb.id} className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/60">
                    <div className="flex items-center justify-between text-[11px] text-amber-900 font-bold mb-1">
                      <span>{fb.lessonTitle || 'Lesson Review'}</span>
                      <span className="text-stone-400 font-normal">
                        {new Date(fb.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed italic">
                      "{fb.message}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-400">
            Keep practicing diligently; your instructor checks your notes regularly!
          </div>
        </div>

        {/* Assignments */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-stone-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-700" />
              Assigned Tasks
            </h3>
            <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
              {assignments.filter(a => !a.completed).length} pending
            </span>
          </div>

          {assignments.length === 0 ? (
            <p className="text-xs text-stone-400 py-4 italic">No assignments assigned right now.</p>
          ) : (
            <div className="space-y-3">
              {assignments.slice(0, 3).map((asg) => (
                <div
                  key={asg.id}
                  className={`p-3.5 rounded-xl border transition ${
                    asg.completed ? 'bg-stone-50 border-stone-200 opacity-70' : 'bg-white border-stone-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <button
                        onClick={() => handleToggleAssignment(asg.id)}
                        className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition ${
                          asg.completed ? 'bg-emerald-600 text-white' : 'border border-stone-300 hover:border-amber-600'
                        }`}
                        title={asg.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        {asg.completed && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <div>
                        <h4 className={`text-xs font-bold ${asg.completed ? 'line-through text-stone-500' : 'text-stone-900'}`}>
                          {asg.title}
                        </h4>
                        <p className="text-[11px] text-stone-500 mt-0.5">{asg.description}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-semibold bg-stone-100 text-stone-600 px-2 py-0.5 rounded shrink-0">
                      Due {asg.dueDate}
                    </span>
                  </div>

                  {asg.requirements && asg.requirements.length > 0 && (
                    <ul className="mt-2 text-[11px] text-stone-500 pl-7 space-y-0.5 list-disc">
                      {asg.requirements.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Interactive Achievements & Badges System */}
      <Achievement
        achievements={achievements}
        onNavigateToPractice={() => onStartPractice()}
        onNavigateToLessons={() => onStartLesson(currentLesson?.id || 'les-1-1')}
        onNavigateToSongs={onExploreSongs}
      />
    </div>
  );
};
