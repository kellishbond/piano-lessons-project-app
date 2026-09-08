/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Navbar } from './components/Navbar.js';
import { StudentDashboard } from './pages/StudentDashboard.js';
import { LessonView } from './pages/LessonView.js';
import { CourseCurriculum } from './pages/CourseCurriculum.js';
import { PracticeMode } from './pages/PracticeMode.js';
import { TheorySection } from './pages/TheorySection.js';
import { SongLibrary } from './pages/SongLibrary.js';
import { InstructorDashboard } from './pages/InstructorDashboard.js';
import { LoginPage } from './pages/LoginPage.js';
import { Music } from 'lucide-react';

type ActiveTab = 'dashboard' | 'lessons' | 'practice' | 'theory' | 'songs' | 'instructor';

function MainApp() {
  const { user, isInstructor, loading } = useAuth();
  const [currentTab, setCurrentTab] = useState<ActiveTab>('dashboard');
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [practiceExerciseTitle, setPracticeExerciseTitle] = useState<string | undefined>(undefined);

  // Synchronize tab with user role upon login
  useEffect(() => {
    if (user) {
      if (isInstructor) {
        setCurrentTab('instructor');
      } else {
        // Students are restricted to their student views
        setCurrentTab('dashboard');
      }
    }
  }, [user?.id, isInstructor]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-900 text-amber-200 flex items-center justify-center mx-auto mb-3 animate-bounce">
            <Music className="w-6 h-6" />
          </div>
          <div className="text-stone-700 font-semibold text-sm">Loading Piano Studio...</div>
        </div>
      </div>
    );
  }

  // Not authenticated: Show dedicated LoginPage
  if (!user) {
    return <LoginPage />;
  }

  const handleStartLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setCurrentTab('lessons');
  };

  const handleStartPractice = (exerciseTitle?: string) => {
    setPracticeExerciseTitle(exerciseTitle);
    setCurrentTab('practice');
  };

  const handleExploreSongs = () => {
    setCurrentTab('songs');
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          // Safeguard: non-instructors cannot access instructor tab
          if (tab === 'instructor' && !isInstructor) {
            setCurrentTab('dashboard');
            return;
          }
          setCurrentTab(tab);
          if (tab !== 'lessons') {
            setActiveLessonId(null);
          }
        }}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-16">
        {/* Student views */}
        {currentTab === 'dashboard' && !isInstructor && (
          <StudentDashboard
            onStartLesson={handleStartLesson}
            onStartPractice={handleStartPractice}
            onExploreSongs={handleExploreSongs}
          />
        )}

        {currentTab === 'lessons' && (
          activeLessonId ? (
            <LessonView
              lessonId={activeLessonId}
              onBack={() => setActiveLessonId(null)}
              onNextLesson={(nextId) => setActiveLessonId(nextId)}
            />
          ) : (
            <CourseCurriculum
              onSelectLesson={(lessonId) => setActiveLessonId(lessonId)}
            />
          )
        )}

        {currentTab === 'practice' && (
          <PracticeMode initialExerciseTitle={practiceExerciseTitle} />
        )}

        {currentTab === 'theory' && (
          <TheorySection />
        )}

        {currentTab === 'songs' && (
          <SongLibrary />
        )}

        {/* Instructor Portal - Strictly accessible only when isInstructor is true */}
        {currentTab === 'instructor' && isInstructor && (
          <InstructorDashboard />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-stone-200 py-6 bg-white text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Digital Piano Teacher • Structured PC & Laptop Learning Studio</span>
          <span className="text-stone-400">
            {isInstructor ? 'Instructor Admin Mode' : `Signed in as ${user.name}`}
          </span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

