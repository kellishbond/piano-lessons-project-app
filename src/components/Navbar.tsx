import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { pianoAudio } from '../utils/audio.js';
import { AccountModal } from './AccountModal.js';
import { StudioUpdatesModal } from './StudioUpdatesModal.js';
import {
  Music,
  BookOpen,
  PlayCircle,
  Award,
  Users,
  Volume2,
  VolumeX,
  Flame,
  Library,
  ChevronDown,
  Settings,
  Bell,
  Sparkles,
  LogOut,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'dashboard' | 'lessons' | 'practice' | 'theory' | 'songs' | 'instructor';
  onSelectTab: (tab: 'dashboard' | 'lessons' | 'practice' | 'theory' | 'songs' | 'instructor') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, profile, logout, isInstructor } = useAuth();
  const [isMuted, setIsMuted] = useState<boolean>(pianoAudio.getMuted());
  const [showUserMenu, setShowUserMenu] = useState<boolean>(false);
  const [showAccountModal, setShowAccountModal] = useState<boolean>(false);
  const [accountModalMode, setAccountModalMode] = useState<'create' | 'edit' | 'switch'>('edit');
  const [showUpdatesModal, setShowUpdatesModal] = useState<boolean>(false);

  const toggleMute = () => {
    const muted = pianoAudio.toggleMute();
    setIsMuted(muted);
  };

  const openAccountModal = (mode: 'create' | 'edit' | 'switch') => {
    setAccountModalMode(mode);
    setShowAccountModal(true);
    setShowUserMenu(false);
  };

  const handleLogout = async () => {
    setShowUserMenu(false);
    await logout();
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-16">
          {/* Brand / Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="brand-logo-btn"
              onClick={() => onSelectTab('dashboard')}
              className="flex items-center gap-2 text-left group"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-800 text-white flex items-center justify-center shadow-xs group-hover:bg-amber-900 transition shrink-0">
                <Music className="w-5 h-5 text-amber-200" />
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold tracking-tight text-stone-900 block leading-tight font-serif">
                  Digital Piano Teacher
                </span>
                <span className="text-[10px] sm:text-[11px] text-amber-800 font-semibold tracking-wide block">
                  Structured Learning Studio
                </span>
              </div>
            </button>
          </div>

          {/* Navigation Tabs (Desktop / Tablet) */}
          <nav className="hidden lg:flex items-center gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200/80">
            <button
              id="nav-dashboard-btn"
              onClick={() => onSelectTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                currentTab === 'dashboard'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              Dashboard
            </button>

            <button
              id="nav-lessons-btn"
              onClick={() => onSelectTab('lessons')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                currentTab === 'lessons'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Library className="w-3.5 h-3.5 text-amber-700" />
              Course & Lessons
            </button>

            <button
              id="nav-practice-btn"
              onClick={() => onSelectTab('practice')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                currentTab === 'practice'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5 text-amber-700" />
              Practice Mode
            </button>

            <button
              id="nav-theory-btn"
              onClick={() => onSelectTab('theory')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                currentTab === 'theory'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-700" />
              Music Theory
            </button>

            <button
              id="nav-songs-btn"
              onClick={() => onSelectTab('songs')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                currentTab === 'songs'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
              }`}
            >
              <Music className="w-3.5 h-3.5 text-amber-700" />
              Song Library
            </button>

            {/* Instructor Portal Tab - Strictly visible ONLY to Instructor / Admin */}
            {isInstructor && (
              <button
                id="nav-instructor-btn"
                onClick={() => onSelectTab('instructor')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  currentTab === 'instructor'
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'text-stone-700 hover:bg-stone-200/70'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
                Instructor Admin
              </button>
            )}
          </nav>

          {/* Right Section: Updates, Streak, Audio Mute, and User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {/* Updates Announcement Button */}
            <button
              id="studio-updates-btn"
              onClick={() => setShowUpdatesModal(true)}
              aria-label="Studio Updates"
              className="relative p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition border border-stone-200 flex items-center justify-center"
              title="Studio Updates & Announcements"
            >
              <Bell className="w-4 h-4 text-stone-700" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-600 animate-pulse" />
            </button>

            {/* Practice Streak Badge (Student only) */}
            {profile && !isInstructor && (
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-full border border-amber-200 text-xs font-bold"
                title={`${profile.practiceStreakDays} day practice streak!`}
              >
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                <span>{profile.practiceStreakDays}d streak</span>
              </div>
            )}

            {/* Mute Button */}
            <button
              id="toggle-audio-mute-btn"
              onClick={toggleMute}
              aria-label="Toggle sound"
              className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition border border-stone-200"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-600" /> : <Volume2 className="w-4 h-4 text-stone-700" />}
            </button>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                id="user-menu-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-2.5 sm:pr-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 transition bg-white text-left"
              >
                <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-sm font-semibold text-amber-900">
                  {user?.avatar || (isInstructor ? '👨‍🏫' : '🎹')}
                </div>
                <div className="hidden md:block max-w-[130px] truncate">
                  <div className="text-xs font-bold text-stone-800 leading-none truncate">{user?.name}</div>
                  <div className="text-[10px] text-stone-500 leading-none mt-0.5 capitalize">
                    {isInstructor ? 'Studio Instructor' : 'Piano Student'}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 ml-0.5" />
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div
                  id="user-profile-dropdown"
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 py-3 px-3 z-50 animate-in fade-in"
                >
                  <div className="flex items-start gap-3 pb-3 border-b border-stone-100">
                    <div className="w-11 h-11 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl shrink-0">
                      {user?.avatar || (isInstructor ? '👨‍🏫' : '🎹')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-sm text-stone-900 truncate">{user?.name}</div>
                      <div className="text-xs text-stone-500 truncate">{user?.email}</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          isInstructor
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {isInstructor ? <ShieldCheck className="w-2.5 h-2.5" /> : <GraduationCap className="w-2.5 h-2.5" />}
                          {isInstructor ? 'Instructor Admin' : 'Enrolled Student'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Student Goal / Level Info */}
                  {!isInstructor && (
                    <div className="py-2.5 border-b border-stone-100 space-y-1.5 text-xs text-stone-600">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-400 font-medium">Skill Level:</span>
                        <span className="font-semibold text-stone-800">{user?.skillLevel || 'Beginner'}</span>
                      </div>
                      {user?.learningGoal && (
                        <div>
                          <span className="text-stone-400 font-medium block text-[11px]">Primary Goal:</span>
                          <span className="font-medium text-stone-700 line-clamp-1">{user.learningGoal}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="pt-2 space-y-1">
                    {!isInstructor && (
                      <button
                        onClick={() => openAccountModal('edit')}
                        className="w-full px-2.5 py-2 rounded-xl text-left text-xs text-stone-700 hover:bg-stone-100 font-medium flex items-center gap-2 transition"
                      >
                        <Settings className="w-3.5 h-3.5 text-stone-500" />
                        Edit My Profile & Goals
                      </button>
                    )}
                    <button
                      id="logout-btn"
                      onClick={handleLogout}
                      className="w-full px-2.5 py-2 rounded-xl text-left text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2 transition"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile & Tablet navigation tab bar */}
        <div className="flex lg:hidden border-t border-stone-200 px-2 py-1.5 bg-stone-50 overflow-x-auto gap-1.5 scrollbar-none">
          {!isInstructor && (
            <>
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1 min-h-[36px] ${
                  currentTab === 'dashboard' ? 'bg-amber-800 text-white shadow-2xs' : 'text-stone-600 bg-white border border-stone-200'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                Dashboard
              </button>
              <button
                onClick={() => onSelectTab('lessons')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1 min-h-[36px] ${
                  currentTab === 'lessons' ? 'bg-amber-800 text-white shadow-2xs' : 'text-stone-600 bg-white border border-stone-200'
                }`}
              >
                <Library className="w-3 h-3" />
                Lessons
              </button>
              <button
                onClick={() => onSelectTab('practice')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1 min-h-[36px] ${
                  currentTab === 'practice' ? 'bg-amber-800 text-white shadow-2xs' : 'text-stone-600 bg-white border border-stone-200'
                }`}
              >
                <PlayCircle className="w-3 h-3" />
                Practice
              </button>
              <button
                onClick={() => onSelectTab('theory')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1 min-h-[36px] ${
                  currentTab === 'theory' ? 'bg-amber-800 text-white shadow-2xs' : 'text-stone-600 bg-white border border-stone-200'
                }`}
              >
                <Award className="w-3 h-3" />
                Theory
              </button>
              <button
                onClick={() => onSelectTab('songs')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1 min-h-[36px] ${
                  currentTab === 'songs' ? 'bg-amber-800 text-white shadow-2xs' : 'text-stone-600 bg-white border border-stone-200'
                }`}
              >
                <Music className="w-3 h-3" />
                Songs
              </button>
            </>
          )}

          {isInstructor && (
            <>
              <button
                onClick={() => onSelectTab('instructor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1 min-h-[36px] ${
                  currentTab === 'instructor' ? 'bg-stone-900 text-white shadow-2xs' : 'text-stone-700 bg-white border border-stone-200'
                }`}
              >
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                Admin Overview
              </button>
              <button
                onClick={() => onSelectTab('lessons')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1 min-h-[36px] ${
                  currentTab === 'lessons' ? 'bg-amber-800 text-white shadow-2xs' : 'text-stone-600 bg-white border border-stone-200'
                }`}
              >
                <Library className="w-3 h-3" />
                Curriculum
              </button>
              <button
                onClick={() => onSelectTab('practice')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1 min-h-[36px] ${
                  currentTab === 'practice' ? 'bg-amber-800 text-white shadow-2xs' : 'text-stone-600 bg-white border border-stone-200'
                }`}
              >
                <PlayCircle className="w-3 h-3" />
                Piano Room
              </button>
            </>
          )}

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition flex items-center gap-1 bg-stone-100 text-rose-600 border border-stone-200 min-h-[36px] ml-auto"
          >
            <LogOut className="w-3 h-3" />
            Sign Out
          </button>
        </div>
      </header>

      {/* Account Creation & Profile Modal */}
      <AccountModal
        isOpen={showAccountModal}
        initialMode={accountModalMode}
        onClose={() => setShowAccountModal(false)}
      />

      {/* Studio Updates & Announcements Modal */}
      <StudioUpdatesModal
        isOpen={showUpdatesModal}
        onClose={() => setShowUpdatesModal(false)}
      />
    </>
  );
};
