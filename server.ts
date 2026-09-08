import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.js';
import { Lesson, Assignment, InstructorFeedback, PracticeSession } from './src/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Active user session state (null when not logged in)
  let currentUserId: string | null = null;

  // Helper to compute achievements and milestones dynamically based on real student performance
  function computeStudentAchievements(studentId: string): import('./src/types.js').Achievement[] {
    const profile = db.studentProfiles.get(studentId);
    const completedLessons = db.lessonProgress.filter(p => p.studentId === studentId && p.status === 'COMPLETED');
    const sessions = db.practiceSessions.filter(p => p.studentId === studentId);
    const totalNotes = sessions.reduce((acc, s) => acc + (s.notesPlayed || 0), 0);
    const totalPracticeMins = profile?.totalPracticeMinutes || sessions.reduce((acc, s) => acc + s.durationMinutes, 0);
    const streak = profile?.practiceStreakDays || 0;
    const progress = profile?.overallProgress || 0;
    const assignmentsDone = db.assignments.filter(a => a.studentId === studentId && a.completed).length;

    const milestones: import('./src/types.js').Achievement[] = [
      {
        id: 'ach-first-key',
        title: 'First Key Strike',
        description: 'Play your first notes on the virtual piano.',
        icon: '🎹',
        category: 'Technique',
        tier: 'bronze',
        targetValue: 1,
        currentValue: Math.min(1, totalNotes > 0 ? 1 : (completedLessons.length > 0 ? 1 : 0)),
        unit: 'note',
        unlocked: totalNotes > 0 || completedLessons.length > 0,
        unlockedAt: 'Orientation Day',
      },
      {
        id: 'ach-first-lesson',
        title: 'Curriculum Explorer',
        description: 'Successfully finish your first piano lesson.',
        icon: '📖',
        category: 'Technique',
        tier: 'bronze',
        targetValue: 1,
        currentValue: Math.min(1, completedLessons.length),
        unit: 'lesson',
        unlocked: completedLessons.length >= 1,
        unlockedAt: completedLessons[0]?.completedAt || 'Module 1',
      },
      {
        id: 'ach-streak-3',
        title: 'Rhythm of Habit',
        description: 'Maintain a 3-day consecutive practice streak.',
        icon: '🔥',
        category: 'Practice',
        tier: 'bronze',
        targetValue: 3,
        currentValue: Math.min(3, streak),
        unit: 'days',
        unlocked: streak >= 3,
        unlockedAt: streak >= 3 ? 'Day 3' : undefined,
      },
      {
        id: 'ach-practice-30',
        title: 'Practice Pioneer',
        description: 'Log 30 minutes of focused piano practice.',
        icon: '⏱️',
        category: 'Practice',
        tier: 'silver',
        targetValue: 30,
        currentValue: Math.min(30, totalPracticeMins),
        unit: 'minutes',
        unlocked: totalPracticeMins >= 30,
        unlockedAt: totalPracticeMins >= 30 ? 'Practice Room' : undefined,
      },
      {
        id: 'ach-lessons-3',
        title: 'Scale Apprentice',
        description: 'Complete 3 structured curriculum lessons.',
        icon: '🎼',
        category: 'Technique',
        tier: 'silver',
        targetValue: 3,
        currentValue: Math.min(3, completedLessons.length),
        unit: 'lessons',
        unlocked: completedLessons.length >= 3,
        unlockedAt: completedLessons.length >= 3 ? (completedLessons[2]?.completedAt || 'Module 2') : undefined,
      },
      {
        id: 'ach-chord-triad',
        title: 'Triad Architect',
        description: 'Master major and minor root-position triads.',
        icon: '🎶',
        category: 'Theory',
        tier: 'silver',
        targetValue: 1,
        currentValue: completedLessons.some(l => l.lessonId === 'les-3-1' || l.lessonId === 'les-6-1') || progress >= 40 ? 1 : 0,
        unit: 'triad',
        unlocked: completedLessons.some(l => l.lessonId === 'les-3-1' || l.lessonId === 'les-6-1') || progress >= 40,
        unlockedAt: progress >= 40 ? 'Chord Module' : undefined,
      },
      {
        id: 'ach-streak-7',
        title: 'Iron Metronome',
        description: 'Sustain a 7-day uninterrupted practice streak.',
        icon: '⚡',
        category: 'Practice',
        tier: 'gold',
        targetValue: 7,
        currentValue: Math.min(7, streak),
        unit: 'days',
        unlocked: streak >= 7,
        unlockedAt: streak >= 7 ? 'Week 1' : undefined,
      },
      {
        id: 'ach-practice-120',
        title: 'Virtuoso in Progress',
        description: 'Accumulate over 2 hours (120 min) of practice telemetry.',
        icon: '🏆',
        category: 'Practice',
        tier: 'gold',
        targetValue: 120,
        currentValue: Math.min(120, totalPracticeMins),
        unit: 'minutes',
        unlocked: totalPracticeMins >= 120,
        unlockedAt: totalPracticeMins >= 120 ? 'Studio Hall' : undefined,
      },
      {
        id: 'ach-assignments-2',
        title: 'Dedicated Scholar',
        description: 'Complete 2 instructor assignments on time.',
        icon: '📋',
        category: 'Theory',
        tier: 'silver',
        targetValue: 2,
        currentValue: Math.min(2, assignmentsDone),
        unit: 'assignments',
        unlocked: assignmentsDone >= 2,
        unlockedAt: assignmentsDone >= 2 ? 'Studio Check' : undefined,
      },
      {
        id: 'ach-progress-50',
        title: 'Halfway Maestro',
        description: 'Reach 50% overall completion in the piano curriculum.',
        icon: '⭐',
        category: 'Technique',
        tier: 'gold',
        targetValue: 50,
        currentValue: Math.min(50, progress),
        unit: '%',
        unlocked: progress >= 50,
        unlockedAt: progress >= 50 ? 'Course Midpoint' : undefined,
      },
      {
        id: 'ach-song-recital',
        title: 'Debut Recital',
        description: 'Perform a complete repertoire piece in the Song Library.',
        icon: '🌟',
        category: 'Repertoire',
        tier: 'gold',
        targetValue: 1,
        currentValue: progress >= 60 || sessions.some(s => s.exerciseTitle?.includes('Song') || s.exerciseTitle?.includes('Joy')) ? 1 : 0,
        unit: 'song',
        unlocked: progress >= 60 || sessions.some(s => s.exerciseTitle?.includes('Song') || s.exerciseTitle?.includes('Joy')),
        unlockedAt: 'Song Library Stage',
      },
      {
        id: 'ach-grand-virtuoso',
        title: 'Grand Concert Pianist',
        description: 'Reach 90%+ course mastery and comprehensive musicianship.',
        icon: '👑',
        category: 'Repertoire',
        tier: 'platinum',
        targetValue: 90,
        currentValue: Math.min(90, progress),
        unit: '%',
        unlocked: progress >= 90,
        unlockedAt: progress >= 90 ? 'Mastery Milestone' : undefined,
      },
    ];

    return milestones;
  }

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Users: List all users dynamically (no hardcoded names)
  app.get('/api/users', (req: Request, res: Response) => {
    const list = db.users.map(u => {
      const profile = db.studentProfiles.get(u.id);
      return {
        ...u,
        profile: profile || null,
      };
    });
    res.json(list);
  });

  // Users: Update profile and user details
  app.put('/api/users/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, email, avatar, skillLevel, learningGoal, bio } = req.body;
    const user = db.users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (name) user.name = name;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;
    if (skillLevel) user.skillLevel = skillLevel;
    if (learningGoal) user.learningGoal = learningGoal;
    if (bio !== undefined) user.bio = bio;

    const profile = db.studentProfiles.get(id);
    if (profile) {
      if (skillLevel) profile.skillLevel = skillLevel;
      if (learningGoal) profile.learningGoal = learningGoal;
    }

    res.json({ user, profile });
  });

  // Auth: Get current user
  app.get('/api/auth/me', (req: Request, res: Response) => {
    if (!currentUserId) {
      return res.json({ user: null, profile: null });
    }
    const user = db.users.find(u => u.id === currentUserId);
    if (!user) {
      currentUserId = null;
      return res.json({ user: null, profile: null });
    }
    const profile = db.studentProfiles.get(user.id);
    res.json({ user, profile: profile || null });
  });

  // Auth: Logout
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    currentUserId = null;
    res.json({ status: 'ok', message: 'Logged out successfully' });
  });

  // Auth: Switch user
  app.post('/api/auth/switch', (req: Request, res: Response) => {
    const { userId } = req.body;
    const user = db.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    currentUserId = userId;
    const profile = db.studentProfiles.get(user.id);
    res.json({ user, profile: profile || null, message: `Switched to ${user.name} (${user.role})` });
  });

  // Auth: Login (Students or Instructor)
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { usernameOrEmail, email, password, role } = req.body;
    const identifier = (usernameOrEmail || email || '').trim();
    const query = identifier.toLowerCase();
    const pass = (password || '').trim();

    // Check if logging in as Instructor (Kellish / piano)
    if (role === 'INSTRUCTOR' || query === 'kellish' || query === 'kellish@pianolearning.edu') {
      if ((query === 'kellish' || query === 'kellish@pianolearning.edu') && pass === 'piano') {
        let inst = db.users.find(u => u.role === 'INSTRUCTOR' || u.name.toLowerCase() === 'kellish');
        if (!inst) {
          inst = {
            id: 'inst-kellish',
            name: 'Kellish',
            email: 'kellish@pianolearning.edu',
            username: 'Kellish',
            password: 'piano',
            role: 'INSTRUCTOR',
            avatar: '🎹',
            bio: 'Master Piano Instructor & Studio Director',
            createdAt: '2026-03-01T00:00:00Z',
          };
          db.users.push(inst);
        }
        currentUserId = inst.id;
        return res.json({ user: inst, profile: null, token: `jwt-instructor-${inst.id}` });
      } else {
        return res.status(401).json({
          error: 'Invalid instructor credentials. Access requires Username: Kellish and Password: piano'
        });
      }
    }

    // Student Login
    if (!identifier) {
      return res.status(400).json({ error: 'Username or email is required' });
    }

    const student = db.users.find(u =>
      u.role === 'STUDENT' && (
        (u.email && u.email.toLowerCase() === query) ||
        (u.name && u.name.toLowerCase() === query) ||
        (u.username && u.username.toLowerCase() === query)
      )
    );

    if (!student) {
      return res.status(404).json({
        error: `No student account found for "${identifier}". Please click "Create Account" below to register!`
      });
    }

    if (student.password && pass && student.password !== pass) {
      return res.status(401).json({ error: 'Incorrect password for this student account' });
    }

    currentUserId = student.id;
    const profile = db.studentProfiles.get(student.id);
    res.json({ user: student, profile: profile || null, token: `jwt-token-${student.id}` });
  });

  // Auth: Register (create new student account)
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { name, email, password, avatar, skillLevel, learningGoal, bio } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Your student name is required' });
    }

    const trimmedName = name.trim();
    const studentEmail = (email && email.trim()) || `${trimmedName.toLowerCase().replace(/\s+/g, '')}@student.studio`;

    // Disallow registering with the reserved instructor username
    if (trimmedName.toLowerCase() === 'kellish') {
      return res.status(400).json({ error: 'Kellish is reserved for the Instructor Admin account. Please use instructor login.' });
    }

    const existing = db.users.find(u =>
      u.email.toLowerCase() === studentEmail.toLowerCase() ||
      u.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (existing) {
      return res.status(400).json({ error: 'A student with this name or email already exists. Please log in.' });
    }

    const newUser: import('./src/types.js').User = {
      id: `stud-${Date.now()}`,
      name: trimmedName,
      email: studentEmail,
      username: trimmedName,
      password: (password || 'piano').trim(),
      role: 'STUDENT',
      avatar: avatar || '🎹',
      skillLevel: skillLevel || 'Beginner',
      learningGoal: learningGoal || 'Master Keyboard Foundations & Pieces',
      bio: bio || '',
      createdAt: new Date().toISOString(),
    };
    db.users.push(newUser);

    const newProfile: import('./src/types.js').StudentProfile = {
      userId: newUser.id,
      currentCourseId: 'course-1',
      currentModuleId: 'mod-1',
      currentLessonId: 'les-1-1',
      overallProgress: 0,
      practiceStreakDays: 1,
      totalPracticeMinutes: 0,
      weakAreas: [],
      lastPracticeDate: 'Today',
      skillLevel: newUser.skillLevel,
      learningGoal: newUser.learningGoal,
    };
    db.studentProfiles.set(newUser.id, newProfile);

    currentUserId = newUser.id;
    res.json({
      user: newUser,
      profile: newProfile,
      token: `jwt-token-${newUser.id}`
    });
  });

  // Achievements: Get dynamic milestones for student
  app.get('/api/achievements/student/:studentId', (req: Request, res: Response) => {
    const { studentId } = req.params;
    const user = db.users.find(u => u.id === studentId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const list = computeStudentAchievements(studentId);
    res.json(list);
  });

  // Students: List all students for instructor dashboard
  app.get('/api/students', (req: Request, res: Response) => {
    const students = db.users
      .filter(u => u.role === 'STUDENT')
      .map(u => {
        const profile = db.studentProfiles.get(u.id);
        const currentLesson = db.lessons.find(l => l.id === profile?.currentLessonId);
        const currentModule = db.modules.find(m => m.id === profile?.currentModuleId);
        const recentFeedback = db.feedback
          .filter(f => f.studentId === u.id)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        const studentAssignments = db.assignments.filter(a => a.studentId === u.id);

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          progress: profile?.overallProgress || 0,
          currentLesson: currentLesson?.title || 'Keyboard Basics',
          currentModule: currentModule?.title || 'Module 1',
          practiceStreak: profile?.practiceStreakDays || 0,
          totalPracticeMinutes: profile?.totalPracticeMinutes || 0,
          lastPractice: profile?.lastPracticeDate || 'None',
          weakAreas: profile?.weakAreas || [],
          recentFeedback: recentFeedback?.message || null,
          pendingAssignmentsCount: studentAssignments.filter(a => !a.completed).length,
        };
      });
    res.json(students);
  });

  // Students: Individual progress & full metrics
  app.get('/api/students/:id/progress', (req: Request, res: Response) => {
    const studentId = req.params.id;
    const user = db.users.find(u => u.id === studentId);
    if (!user) return res.status(404).json({ error: 'Student not found' });

    const profile = db.studentProfiles.get(studentId);
    const progressRecords = db.lessonProgress.filter(p => p.studentId === studentId);
    const practiceHistory = db.practiceSessions.filter(p => p.studentId === studentId);
    const feedbackList = db.feedback.filter(f => f.studentId === studentId);
    const achievementsList = computeStudentAchievements(studentId);
    const studentAssignments = db.assignments.filter(a => a.studentId === studentId);

    // Module-by-module breakdown
    const moduleProgress = db.modules.map(mod => {
      const modLessons = db.lessons.filter(l => l.moduleId === mod.id);
      const completedCount = modLessons.filter(l =>
        progressRecords.some(p => p.lessonId === l.id && p.status === 'COMPLETED')
      ).length;
      const percentage = modLessons.length > 0 ? Math.round((completedCount / modLessons.length) * 100) : 0;
      return {
        moduleId: mod.id,
        moduleTitle: mod.title,
        totalLessons: modLessons.length,
        completedLessons: completedCount,
        percentage,
      };
    });

    res.json({
      student: user,
      profile,
      progressRecords,
      moduleProgress,
      practiceHistory,
      feedbackList,
      achievementsList,
      studentAssignments,
    });
  });

  // Courses
  app.get('/api/courses', (req: Request, res: Response) => {
    res.json(db.courses);
  });

  app.get('/api/courses/:id', (req: Request, res: Response) => {
    const course = db.courses.find(c => c.id === req.params.id);
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const courseModules = db.modules
      .filter(m => m.courseId === course.id)
      .sort((a, b) => a.order - b.order)
      .map(mod => {
        const modLessons = db.lessons
          .filter(l => l.moduleId === mod.id)
          .sort((a, b) => a.order - b.order);
        return {
          ...mod,
          lessons: modLessons,
        };
      });
    res.json({ ...course, fullModules: courseModules });
  });

  // Lessons: Get all or with student-specific status
  app.get('/api/lessons', (req: Request, res: Response) => {
    const studentId = (req.query.studentId as string) || currentUserId;
    const progressMap = new Map<string, string>();
    db.lessonProgress.filter(p => p.studentId === studentId).forEach(p => {
      progressMap.set(p.lessonId, p.status);
    });

    const studentProfile = db.studentProfiles.get(studentId);

    const lessonsWithStatus = db.lessons.map(lesson => {
      let status: 'COMPLETED' | 'CURRENT' | 'LOCKED' = 'LOCKED';
      if (progressMap.has(lesson.id)) {
        status = progressMap.get(lesson.id) as 'COMPLETED' | 'CURRENT' | 'LOCKED';
      } else if (lesson.id === studentProfile?.currentLessonId) {
        status = 'CURRENT';
      } else if (lesson.order === 1 && lesson.moduleId === 'mod-1') {
        status = 'CURRENT';
      }

      return {
        ...lesson,
        status,
      };
    });

    res.json(lessonsWithStatus);
  });

  app.get('/api/lessons/:id', (req: Request, res: Response) => {
    const lesson = db.lessons.find(l => l.id === req.params.id);
    if (!lesson) return res.status(404).json({ error: 'Lesson not found' });

    // Attach exercise details if testYourself points to one
    let exercise = null;
    if (lesson.sections.testYourself?.exerciseId) {
      exercise = db.exercises.find(e => e.id === lesson.sections.testYourself.exerciseId) || null;
    }

    res.json({ ...lesson, exercise });
  });

  // Create new lesson (Admin / Instructor)
  app.post('/api/lessons', (req: Request, res: Response) => {
    const newLessonData = req.body;
    const newLesson: Lesson = {
      id: `les-${Date.now()}`,
      moduleId: newLessonData.moduleId || 'mod-1',
      title: newLessonData.title || 'Untitled Lesson',
      description: newLessonData.description || '',
      order: (db.lessons.length + 1),
      difficulty: newLessonData.difficulty || 'Beginner',
      sections: newLessonData.sections || {
        learn: { heading: 'Concepts', text: 'Lesson overview', keyPoints: [] },
        watch: { title: 'Demonstration', description: '', animationType: 'keyboard_hand' },
        listen: { title: 'Audio Preview', description: '', notesToPlay: ['C4'], bpm: 60 },
        see: { title: 'Visual Keys', highlightKeys: ['C4'], description: '' },
        practice: { instructions: 'Practice key', targetNotes: ['C4'] },
        testYourself: { exerciseId: '' },
        assignment: { task: 'Practice at home', recommendedMinutes: 10, checkpoints: [] }
      }
    };
    db.lessons.push(newLesson);
    res.status(201).json(newLesson);
  });

  // Mark lesson completed
  app.post('/api/lessons/:id/complete', (req: Request, res: Response) => {
    const lessonId = req.params.id;
    const studentId = (req.body.studentId as string) || currentUserId;
    const score = req.body.score || 100;

    // Update or insert progress
    let prog = db.lessonProgress.find(p => p.studentId === studentId && p.lessonId === lessonId);
    if (prog) {
      prog.status = 'COMPLETED';
      prog.completionPercentage = 100;
      prog.score = score;
      prog.completedAt = new Date().toISOString();
    } else {
      prog = {
        id: `prog-${Date.now()}`,
        studentId,
        lessonId,
        completionPercentage: 100,
        score,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
      };
      db.lessonProgress.push(prog);
    }

    // Unlock next lesson
    const currentIndex = db.lessons.findIndex(l => l.id === lessonId);
    if (currentIndex >= 0 && currentIndex < db.lessons.length - 1) {
      const nextLesson = db.lessons[currentIndex + 1];
      const nextProg = db.lessonProgress.find(p => p.studentId === studentId && p.lessonId === nextLesson.id);
      if (!nextProg || nextProg.status === 'LOCKED') {
        if (nextProg) nextProg.status = 'CURRENT';
        else {
          db.lessonProgress.push({
            id: `prog-${Date.now()}-next`,
            studentId,
            lessonId: nextLesson.id,
            completionPercentage: 0,
            status: 'CURRENT',
          });
        }
      }
      // Update profile
      const prof = db.studentProfiles.get(studentId);
      if (prof) {
        prof.currentLessonId = nextLesson.id;
        prof.currentModuleId = nextLesson.moduleId;
        // Recalculate progress
        const completedCount = db.lessonProgress.filter(p => p.studentId === studentId && p.status === 'COMPLETED').length;
        prof.overallProgress = Math.min(100, Math.round((completedCount / db.lessons.length) * 100));
      }
    }

    res.json({ success: true, progress: prog });
  });

  // Exercises
  app.get('/api/exercises', (req: Request, res: Response) => {
    res.json(db.exercises);
  });

  app.get('/api/exercises/:id', (req: Request, res: Response) => {
    const exercise = db.exercises.find(e => e.id === req.params.id);
    if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
    res.json(exercise);
  });

  // Exercise Evaluation
  app.post('/api/exercises/:id/submit', (req: Request, res: Response) => {
    const exercise = db.exercises.find(e => e.id === req.params.id);
    if (!exercise) return res.status(404).json({ error: 'Exercise not found' });

    const { answer } = req.body;
    let isCorrect = false;

    if (Array.isArray(exercise.correctAnswer)) {
      if (Array.isArray(answer)) {
        isCorrect = exercise.correctAnswer.length === answer.length &&
          exercise.correctAnswer.every((val, idx) => val === answer[idx]);
      }
    } else {
      isCorrect = String(answer).trim().toLowerCase() === String(exercise.correctAnswer).trim().toLowerCase();
    }

    res.json({
      correct: isCorrect,
      explanation: exercise.explanation || (isCorrect ? 'Correct! 🎉' : 'Try again.'),
      correctAnswer: exercise.correctAnswer,
    });
  });

  // Practice sessions
  app.post('/api/practice', (req: Request, res: Response) => {
    const { studentId, exerciseTitle, durationMinutes, accuracy, notesPlayed } = req.body;
    const sId = studentId || currentUserId;

    const newSession: PracticeSession = {
      id: `prac-${Date.now()}`,
      studentId: sId,
      exerciseTitle: exerciseTitle || 'Free Keyboard Practice',
      durationMinutes: durationMinutes || 10,
      accuracy: accuracy !== undefined ? accuracy : 90,
      notesPlayed: notesPlayed || 50,
      completedAt: new Date().toISOString(),
    };
    db.practiceSessions.push(newSession);

    // Update student profile
    const profile = db.studentProfiles.get(sId);
    if (profile) {
      profile.totalPracticeMinutes += newSession.durationMinutes;
      profile.lastPracticeDate = 'Today';
    }

    res.status(201).json(newSession);
  });

  app.get('/api/practice/student/:studentId', (req: Request, res: Response) => {
    const sessions = db.practiceSessions
      .filter(p => p.studentId === req.params.studentId)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    res.json(sessions);
  });

  // Assignments
  app.get('/api/assignments', (req: Request, res: Response) => {
    res.json(db.assignments);
  });

  app.get('/api/assignments/student/:studentId', (req: Request, res: Response) => {
    const assignments = db.assignments.filter(a => a.studentId === req.params.studentId);
    res.json(assignments);
  });

  app.post('/api/assignments', (req: Request, res: Response) => {
    const { studentId, title, description, requirements, playCountTarget, practiceMinutesTarget, dueDate } = req.body;
    if (!studentId || !title) {
      return res.status(400).json({ error: 'studentId and title are required' });
    }

    const newAssignment: Assignment = {
      id: `asg-${Date.now()}`,
      studentId,
      title,
      description: description || '',
      requirements: Array.isArray(requirements) ? requirements : ['Practice daily'],
      playCountTarget: playCountTarget || 5,
      practiceMinutesTarget: practiceMinutesTarget || 10,
      dueDate: dueDate || 'Next Lesson',
      completed: false,
    };
    db.assignments.push(newAssignment);
    res.status(201).json(newAssignment);
  });

  app.put('/api/assignments/:id/toggle', (req: Request, res: Response) => {
    const assignment = db.assignments.find(a => a.id === req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    assignment.completed = !assignment.completed;
    assignment.completedAt = assignment.completed ? new Date().toISOString() : undefined;
    res.json(assignment);
  });

  // Feedback
  app.get('/api/feedback/student/:studentId', (req: Request, res: Response) => {
    const feedbackList = db.feedback
      .filter(f => f.studentId === req.params.studentId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(feedbackList);
  });

  app.post('/api/feedback', (req: Request, res: Response) => {
    const { studentId, lessonTitle, message, instructorId } = req.body;
    if (!studentId || !message) {
      return res.status(400).json({ error: 'studentId and message are required' });
    }

    // Dynamic instructor lookup - never hardcoded
    const instructor = db.users.find(u => u.id === instructorId)
      || db.users.find(u => u.id === currentUserId && (u.role === 'INSTRUCTOR' || u.role === 'ADMIN'))
      || db.users.find(u => u.role === 'INSTRUCTOR')
      || { id: 'inst-1', name: 'Studio Instructor' };

    const newFeedback: InstructorFeedback = {
      id: `fb-${Date.now()}`,
      studentId,
      instructorId: instructor.id,
      instructorName: instructor.name,
      lessonTitle: lessonTitle || 'General Technique',
      message,
      createdAt: new Date().toISOString(),
      read: false,
    };
    db.feedback.push(newFeedback);
    res.status(201).json(newFeedback);
  });

  // Studio Updates data store
  const studioUpdates: Array<{
    id: string;
    title: string;
    category: 'Curriculum' | 'Studio Feature' | 'Practice Tip' | 'Announcement';
    authorName: string;
    authorRole: string;
    content: string;
    tag?: string;
    createdAt: string;
  }> = [
    {
      id: 'upd-1',
      title: 'Milestone Badges & Dynamic Achievements Live',
      category: 'Studio Feature',
      authorName: 'Studio Team',
      authorRole: 'Engineering & Pedagogy',
      content: 'Track your real-time learning goals with our brand new interactive Achievement system! Earn Bronze, Silver, Gold, and Platinum badges for daily streaks, chord milestones, and repertoire recitals.',
      tag: 'New Feature',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 'upd-2',
      title: 'Pedagogy Tip: Relaxing the Wrists During Triad Changes',
      category: 'Practice Tip',
      authorName: 'Lead Instructor',
      authorRole: 'Instructor',
      content: 'When moving between C Major and G Major triads, keep your forearm level with the keyboard. Avoid collapsing your knuckles — imagine gently holding a fresh apple under your palm.',
      tag: 'Technique',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'upd-3',
      title: 'Repertoire Library Expanded with Play-Along Metronome',
      category: 'Curriculum',
      authorName: 'Piano Department',
      authorRole: 'Curriculum',
      content: 'Practice Ode to Joy, Twinkle Twinkle Little Star, and Minuet in G at 50, 75, and 100 BPM with interactive visual note highlights and real-time audio playback.',
      tag: 'Repertoire',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
  ];

  // Updates API
  app.get('/api/updates', (req: Request, res: Response) => {
    res.json(studioUpdates);
  });

  app.post('/api/updates', (req: Request, res: Response) => {
    const { title, category, content, tag } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const author = db.users.find(u => u.id === currentUserId) || {
      name: 'Studio Pianist',
      role: 'STUDENT',
    };

    const newUpdate = {
      id: `upd-${Date.now()}`,
      title: title.trim(),
      category: category || 'Announcement',
      authorName: author.name,
      authorRole: author.role === 'INSTRUCTOR' ? 'Instructor' : 'Student Scholar',
      content: content.trim(),
      tag: tag || 'Update',
      createdAt: new Date().toISOString(),
    };

    studioUpdates.unshift(newUpdate);
    res.status(201).json(newUpdate);
  });

  // Songs
  app.get('/api/songs', (req: Request, res: Response) => {
    res.json(db.songs);
  });

  // Instructor analytics
  app.get('/api/analytics/instructor', (req: Request, res: Response) => {
    const students = db.users.filter(u => u.role === 'STUDENT');
    const totalPracticeMin = Array.from(db.studentProfiles.values()).reduce((sum, p) => sum + p.totalPracticeMinutes, 0);
    const avgProgress = Math.round(
      Array.from(db.studentProfiles.values()).reduce((sum, p) => sum + p.overallProgress, 0) / (students.length || 1)
    );
    const weakTopics = [
      { topic: 'Even rhythm transitions', count: 2 },
      { topic: 'Pinky finger firmness', count: 2 },
      { topic: 'Thumb-under scale movement', count: 1 },
      { topic: 'Left hand chord independence', count: 1 },
    ];

    res.json({
      totalStudents: students.length,
      avgProgress,
      totalPracticeMinutes: totalPracticeMin,
      activeAssignments: db.assignments.filter(a => !a.completed).length,
      weakTopics,
    });
  });

  // Vite middleware setup (development vs production)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Piano Learning System server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
