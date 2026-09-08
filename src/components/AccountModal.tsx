import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { UserRole } from '../types.js';
import {
  UserPlus,
  LogIn,
  UserCheck,
  Sparkles,
  Award,
  BookOpen,
  Edit3,
  Check,
  X,
  Flame,
  Clock,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'create' | 'switch' | 'edit';
}

const AVATAR_OPTIONS = ['🎹', '👩‍🎓', '🎼', '🎶', '👩‍🏫', '🌟', '🎧', '✨'];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'create',
}) => {
  const { user, profile, allUsers, switchUser, register, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'create' | 'switch' | 'edit'>(initialTab);

  // Form states for creating account
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [learningGoal, setLearningGoal] = useState('Master Keyboard Landmarks & Chords');
  const [avatar, setAvatar] = useState('🎹');
  const [bio, setBio] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit current profile state
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || '🎹');
  const [editSkillLevel, setEditSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(
    (user?.skillLevel as any) || 'Beginner'
  );
  const [editGoal, setEditGoal] = useState(user?.learningGoal || 'Master Keyboard Landmarks & Chords');
  const [editSuccess, setEditSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        role,
        avatar,
        skillLevel,
        learningGoal,
        bio: bio.trim(),
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await updateProfile({
        name: editName.trim(),
        email: editEmail.trim(),
        avatar: editAvatar,
        skillLevel: editSkillLevel,
        learningGoal: editGoal,
      });
      setEditSuccess(true);
      setTimeout(() => {
        setEditSuccess(false);
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSwitch = async (userId: string) => {
    setIsSubmitting(true);
    try {
      await switchUser(userId);
      onClose();
    } catch (err: any) {
      setError('Failed to switch user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-lg">
              {activeTab === 'create' ? <UserPlus className="w-5 h-5 text-amber-800" /> :
               activeTab === 'switch' ? <UserCheck className="w-5 h-5 text-amber-800" /> :
               <Edit3 className="w-5 h-5 text-amber-800" />}
            </div>
            <div>
              <h3 className="font-serif font-bold text-stone-900 text-lg sm:text-xl">
                {activeTab === 'create' ? 'Create New Account' :
                 activeTab === 'switch' ? 'Switch User Profile' :
                 'Edit Your Profile'}
              </h3>
              <p className="text-xs text-stone-500">
                {activeTab === 'create' ? 'Set up a personalized piano student or instructor account' :
                 activeTab === 'switch' ? 'Select from active piano students or instructors' :
                 'Update your learning goals and personal details'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => { setActiveTab('create'); setError(null); }}
            className={`pb-2.5 px-2 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Create Account
          </button>
          <button
            onClick={() => { setActiveTab('switch'); setError(null); }}
            className={`pb-2.5 px-2 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'switch'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            All Accounts ({allUsers.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('edit');
              setError(null);
              setEditName(user?.name || '');
              setEditEmail(user?.email || '');
              setEditAvatar(user?.avatar || '🎹');
              setEditSkillLevel((user?.skillLevel as any) || 'Beginner');
              setEditGoal(user?.learningGoal || 'Master Keyboard Landmarks & Chords');
            }}
            className={`pb-2.5 px-2 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'edit'
                ? 'border-amber-800 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            Edit Profile
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          {editSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              Profile updated successfully!
            </div>
          )}

          {/* TAB 1: CREATE ACCOUNT */}
          {activeTab === 'create' && (
            <form onSubmit={handleCreateAccount} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin or Alex Morgan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800 text-stone-900 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@pianostudio.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800 text-stone-900 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800 text-stone-900 font-medium"
                  >
                    <option value="STUDENT">Piano Student</option>
                    <option value="INSTRUCTOR">Instructor / Teacher</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                    Skill Level
                  </label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800 text-stone-900 font-medium"
                  >
                    <option value="Beginner">Beginner (New to Keys)</option>
                    <option value="Intermediate">Intermediate (1+ Years)</option>
                    <option value="Advanced">Advanced Pianist</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Primary Learning Goal
                </label>
                <select
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800 text-stone-900 font-medium"
                >
                  <option value="Master Keyboard Landmarks & Chords">Master Keyboard Landmarks & Chords</option>
                  <option value="Learn Classical Sheet Music & Repertoire">Learn Classical Sheet Music & Repertoire</option>
                  <option value="Daily Practice Routine & Fast Sight Reading">Daily Practice Routine & Fast Sight Reading</option>
                  <option value="Ear Training, Harmony & Improvisation">Ear Training, Harmony & Improvisation</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Choose Avatar
                </label>
                <div className="flex items-center gap-2">
                  {AVATAR_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setAvatar(em)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition ${
                        avatar === em
                          ? 'bg-amber-100 border-amber-800 ring-2 ring-amber-400 scale-105'
                          : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  {isSubmitting ? 'Creating Profile...' : 'Complete Registration & Start Playing'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SWITCH ACCOUNTS */}
          {activeTab === 'switch' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-600">
                All registered student and instructor profiles loaded live from database:
              </p>
              <div className="space-y-2">
                {allUsers.map((u) => {
                  const isCurrent = user?.id === u.id;
                  const profileData = u.profile;

                  return (
                    <div
                      key={u.id}
                      onClick={() => !isCurrent && handleSwitch(u.id)}
                      className={`p-3.5 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-300'
                          : 'bg-stone-50 hover:bg-white hover:border-stone-300 border-stone-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 shadow-2xs flex items-center justify-center text-xl shrink-0">
                          {u.avatar || (u.role === 'INSTRUCTOR' ? '👩‍🏫' : '🎹')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-stone-900 text-sm">
                              {u.name}
                            </h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'INSTRUCTOR'
                                ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                : 'bg-amber-100 text-amber-900 border border-amber-200'
                            }`}>
                              {u.role === 'INSTRUCTOR' ? 'Instructor' : 'Student'}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500">{u.email}</p>
                          {profileData && (
                            <div className="flex items-center gap-3 mt-1 text-[11px] text-stone-600 font-medium">
                              <span className="flex items-center gap-1">
                                <GraduationCap className="w-3 h-3 text-amber-700" />
                                {profileData.overallProgress}% progress
                              </span>
                              <span className="flex items-center gap-1">
                                <Flame className="w-3 h-3 text-amber-600" />
                                {profileData.practiceStreakDays}d streak
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 bg-amber-200/70 px-2.5 py-1 rounded-lg">
                            <Check className="w-3.5 h-3.5" />
                            Active
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="text-xs font-bold text-stone-600 hover:text-stone-900 px-2.5 py-1 rounded-lg bg-white border border-stone-200 shadow-2xs hover:bg-stone-100 transition"
                          >
                            Switch
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: EDIT PROFILE */}
          {activeTab === 'edit' && user && (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800 text-stone-900 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800 text-stone-900 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Current Skill Level
                </label>
                <select
                  value={editSkillLevel}
                  onChange={(e) => setEditSkillLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800 text-stone-900 font-medium"
                >
                  <option value="Beginner">Beginner (Foundations)</option>
                  <option value="Intermediate">Intermediate (Sonatinas & Scales)</option>
                  <option value="Advanced">Advanced (Concert Repertoire)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Primary Learning Goal
                </label>
                <input
                  type="text"
                  value={editGoal}
                  onChange={(e) => setEditGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-800 text-stone-900 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase tracking-wider mb-1">
                  Avatar
                </label>
                <div className="flex items-center gap-2">
                  {AVATAR_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEditAvatar(em)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border transition ${
                        editAvatar === em
                          ? 'bg-amber-100 border-amber-800 ring-2 ring-amber-400 scale-105'
                          : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
