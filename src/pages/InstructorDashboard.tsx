import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { Lesson, Assignment, InstructorFeedback } from '../types.js';
import {
  Users,
  Award,
  BookOpen,
  Send,
  PlusCircle,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  X,
  Flame,
  ChevronRight,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

export const InstructorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Selected student for detailed inspection
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<any>(null);

  // Forms
  const [showAssignmentModal, setShowAssignmentModal] = useState<boolean>(false);
  const [assignmentTitle, setAssignmentTitle] = useState<string>('');
  const [assignmentDesc, setAssignmentDesc] = useState<string>('');
  const [assignmentReqs, setAssignmentReqs] = useState<string>('Play 5 times\nPractice for 10 minutes\nKeep fingers curved');
  const [assignmentDueDate, setAssignmentDueDate] = useState<string>('Friday');
  const [assignmentStudentId, setAssignmentStudentId] = useState<string>('');

  // Feedback form
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackLessonTitle, setFeedbackLessonTitle] = useState<string>('C Major Scale Technique');
  const [feedbackSentSuccess, setFeedbackSentSuccess] = useState<boolean>(false);

  // Content Creator Form
  const [showAddLessonModal, setShowAddLessonModal] = useState<boolean>(false);
  const [newLessonTitle, setNewLessonTitle] = useState<string>('');
  const [newLessonDesc, setNewLessonDesc] = useState<string>('');
  const [newLessonModuleId, setNewLessonModuleId] = useState<string>('mod-1');

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sData, aData] = await Promise.all([
        api.getStudents(),
        api.getInstructorAnalytics(),
      ]);
      setStudents(sData);
      setAnalytics(aData);

      const activeStudentId = selectedStudentId || (sData.length > 0 ? sData[0].id : null);
      if (activeStudentId) {
        if (!selectedStudentId) {
          setSelectedStudentId(activeStudentId);
          setAssignmentStudentId(activeStudentId);
        }
        const details = await api.getStudentProgress(activeStudentId);
        setStudentDetails(details);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [selectedStudentId]);

  const handleSelectStudent = async (studentId: string) => {
    setSelectedStudentId(studentId);
    setAssignmentStudentId(studentId);
    try {
      const details = await api.getStudentProgress(studentId);
      setStudentDetails(details);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignmentTitle || !assignmentStudentId) return;

    try {
      const reqList = assignmentReqs
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

      await api.createAssignment({
        studentId: assignmentStudentId,
        title: assignmentTitle,
        description: assignmentDesc,
        requirements: reqList,
        dueDate: assignmentDueDate,
        playCountTarget: 5,
        practiceMinutesTarget: 10,
      });

      setShowAssignmentModal(false);
      setAssignmentTitle('');
      setAssignmentDesc('');
      await loadAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage || !selectedStudentId) return;

    try {
      await api.sendFeedback({
        studentId: selectedStudentId,
        lessonTitle: feedbackLessonTitle,
        message: feedbackMessage,
      });
      setFeedbackMessage('');
      setFeedbackSentSuccess(true);
      setTimeout(() => setFeedbackSentSuccess(false), 3000);
      await loadAll();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle) return;

    try {
      await api.createLesson({
        moduleId: newLessonModuleId,
        title: newLessonTitle,
        description: newLessonDesc,
        difficulty: 'Beginner',
      });
      setShowAddLessonModal(false);
      setNewLessonTitle('');
      setNewLessonDesc('');
      await loadAll();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Users className="w-3.5 h-3.5 text-amber-700" />
            Instructor Portal & Oversight
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
            Studio Master Dashboard
          </h1>
          <p className="text-stone-600 text-sm mt-1">
            Instructor: <span className="font-bold text-stone-900">{user?.name || 'Studio Instructor'}</span> • Monitor real-time student practice, assign targeted drills, and provide feedback.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            id="open-assignment-modal-btn"
            onClick={() => setShowAssignmentModal(true)}
            className="px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            Create Assignment
          </button>

          <button
            id="open-create-lesson-modal-btn"
            onClick={() => setShowAddLessonModal(true)}
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition"
          >
            <BookOpen className="w-4 h-4" />
            Add Lesson
          </button>
        </div>
      </div>

      {/* Analytics Summary Counters */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
              Active Students
            </span>
            <div className="text-3xl font-black text-stone-900 font-mono mt-1">
              {analytics.totalStudents}
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
              ● All practicing this week
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
              Avg Curriculum Progress
            </span>
            <div className="text-3xl font-black text-amber-800 font-mono mt-1">
              {analytics.avgProgress}%
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block">Across all 10 modules</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
              Total Practice Time
            </span>
            <div className="text-3xl font-black text-stone-900 font-mono mt-1">
              {Math.round(analytics.totalPracticeMinutes / 60)}h {analytics.totalPracticeMinutes % 60}m
            </div>
            <span className="text-[11px] text-stone-500 mt-1 block">Logged by students</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
              Pending Tasks
            </span>
            <div className="text-3xl font-black text-stone-900 font-mono mt-1">
              {analytics.activeAssignments}
            </div>
            <span className="text-[11px] text-amber-800 font-semibold mt-1 block">Awaiting review</span>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout: Students List + Selected Student Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Students List Column (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-700" />
              Student Roster (Click to Inspect)
            </h3>
            <span className="text-xs text-stone-500">{students.length} enrolled</span>
          </div>

          {students.map((student) => {
            const isSelected = selectedStudentId === student.id;

            return (
              <div
                key={student.id}
                id={`student-card-${student.id}`}
                onClick={() => handleSelectStudent(student.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition ${
                  isSelected
                    ? 'bg-amber-50/70 border-amber-500 ring-2 ring-amber-400/30 shadow-sm'
                    : 'bg-white border-stone-200 hover:border-stone-400 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-stone-900 text-base">{student.name}</h4>
                    <p className="text-xs text-stone-500">{student.email}</p>
                  </div>
                  <span className="text-lg font-black text-amber-800 font-mono">
                    {student.progress}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden my-3">
                  <div
                    className="bg-amber-800 h-full rounded-full transition-all"
                    style={{ width: `${student.progress}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-stone-600 pt-1">
                  <div>
                    <span className="text-stone-400 block">Current Lesson</span>
                    <span className="font-bold text-stone-800 truncate block">
                      {student.currentLesson}
                    </span>
                  </div>

                  <div>
                    <span className="text-stone-400 block">Last Practice</span>
                    <span className="font-bold text-stone-800 block">
                      {student.lastPractice}
                    </span>
                  </div>
                </div>

                {/* Weak areas badge */}
                {student.weakAreas && student.weakAreas.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded">
                      Attention: {student.weakAreas[0]}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Student Detailed Inspector (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {studentDetails ? (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
              {/* Top Banner of Selected Student */}
              <div className="flex items-start justify-between border-b border-stone-100 pb-4">
                <div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                    Student Profile Inspection
                  </div>
                  <h3 className="text-2xl font-bold text-stone-900 mt-0.5">
                    {studentDetails.student.name}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                    <span className="flex items-center gap-1 text-amber-800 font-bold">
                      <Flame className="w-3.5 h-3.5 fill-amber-500" />
                      {studentDetails.profile?.practiceStreakDays} Day Streak
                    </span>
                    <span>•</span>
                    <span>Total Practice: {studentDetails.profile?.totalPracticeMinutes} minutes</span>
                  </div>
                </div>

                <button
                  id="open-feedback-panel-btn"
                  onClick={() => {
                    const el = document.getElementById('feedback-form-box');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-lg border border-amber-200 flex items-center gap-1 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-amber-700" />
                  Leave Feedback
                </button>
              </div>

              {/* Module Progress Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
                  Curriculum Mastery by Module:
                </h4>
                <div className="space-y-2">
                  {studentDetails.moduleProgress?.map((mp: any) => (
                    <div key={mp.moduleId} className="p-3 bg-stone-50 rounded-xl border border-stone-200/80">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                        <span>{mp.moduleTitle}</span>
                        <span className="font-mono text-amber-800">{mp.percentage}%</span>
                      </div>
                      <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden mt-2">
                        <div
                          className="bg-amber-800 h-full rounded-full"
                          style={{ width: `${mp.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weak Topics to Watch */}
              <div>
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                  Identified Weak Technical Areas:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {studentDetails.profile?.weakAreas?.map((area: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full text-xs font-semibold flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3 text-amber-700" />
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Recent Practice History */}
              <div>
                <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
                  Recent Practice Sessions Log:
                </h4>
                <div className="space-y-2">
                  {studentDetails.practiceHistory?.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">No practice sessions logged yet.</p>
                  ) : (
                    studentDetails.practiceHistory?.slice(0, 3).map((ps: any) => (
                      <div
                        key={ps.id}
                        className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-stone-900">{ps.exerciseTitle}</div>
                          <div className="text-stone-500 text-[11px]">
                            {new Date(ps.completedAt).toLocaleString()} • {ps.notesPlayed} notes played
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-700 text-sm block">
                            {ps.accuracy}% accuracy
                          </span>
                          <span className="text-[11px] text-stone-500 font-medium">
                            {ps.durationMinutes} min
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Send Instructor Feedback Box */}
              <div id="feedback-form-box" className="p-5 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-amber-700" />
                    Send Personalized Feedback to {studentDetails.student.name}
                  </h4>
                  {feedbackSentSuccess && (
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Sent successfully!
                    </span>
                  )}
                </div>

                <form onSubmit={handleSendFeedback} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      Lesson Focus Tag:
                    </label>
                    <input
                      type="text"
                      value={feedbackLessonTitle}
                      onChange={(e) => setFeedbackLessonTitle(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
                      placeholder="e.g. C Major Scale, Hand Posture"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      Teacher Advice & Encouragement:
                    </label>
                    <textarea
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      rows={3}
                      className="w-full text-xs p-2.5 rounded-lg border border-stone-300 bg-white"
                      placeholder="e.g. Good work on the C Major scale. Your fingering is improving. Focus more on keeping an even rhythm..."
                    />
                  </div>

                  <button
                    id="send-feedback-submit-btn"
                    type="submit"
                    disabled={!feedbackMessage.trim()}
                    className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition disabled:opacity-40"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Deliver Feedback to Student Dashboard
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-400 text-sm">
              Select a student from the roster to view their detailed metrics.
            </div>
          )}
        </div>
      </div>

      {/* CREATE ASSIGNMENT MODAL */}
      {showAssignmentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 animate-in fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-amber-700" />
                Assign Practice Assignment
              </h3>
              <button onClick={() => setShowAssignmentModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Assign to Student:</label>
                <select
                  value={assignmentStudentId}
                  onChange={(e) => setAssignmentStudentId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.progress}% Progress)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Assignment Title:</label>
                <input
                  type="text"
                  value={assignmentTitle}
                  onChange={(e) => setAssignmentTitle(e.target.value)}
                  placeholder="e.g. Practice C Major Scale"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Instructions & Purpose:</label>
                <input
                  type="text"
                  value={assignmentDesc}
                  onChange={(e) => setAssignmentDesc(e.target.value)}
                  placeholder="e.g. Focus on keeping wrists level and fingertips arched."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Requirements (One per line):
                </label>
                <textarea
                  value={assignmentReqs}
                  onChange={(e) => setAssignmentReqs(e.target.value)}
                  rows={3}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Due Date:</label>
                <input
                  type="text"
                  value={assignmentDueDate}
                  onChange={(e) => setAssignmentDueDate(e.target.value)}
                  placeholder="e.g. Friday, Next Lesson"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE LESSON MODAL (ADMIN CONTENT MANAGEMENT) */}
      {showAddLessonModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-stone-200 animate-in fade-in space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-bold text-stone-900 text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-700" />
                Add New Lesson to Curriculum
              </h3>
              <button onClick={() => setShowAddLessonModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLesson} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Assign to Module:</label>
                <select
                  value={newLessonModuleId}
                  onChange={(e) => setNewLessonModuleId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300 bg-white"
                >
                  <option value="mod-1">Module 1 — Getting Started</option>
                  <option value="mod-2">Module 2 — Understanding the Keyboard</option>
                  <option value="mod-3">Module 3 — Finger Numbers</option>
                  <option value="mod-4">Module 4 — Basic Notes</option>
                  <option value="mod-5">Module 5 — Scales</option>
                  <option value="mod-6">Module 6 — Chords</option>
                  <option value="mod-7">Module 7 — Rhythm</option>
                  <option value="mod-8">Module 8 — Simple Songs</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Lesson Title:</label>
                <input
                  type="text"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="e.g. Finding Landmark G"
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Description:</label>
                <textarea
                  value={newLessonDesc}
                  onChange={(e) => setNewLessonDesc(e.target.value)}
                  rows={3}
                  placeholder="e.g. Locate the G landmark note using the 3-black-key group."
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-300"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold"
                >
                  Save Lesson to Database
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
